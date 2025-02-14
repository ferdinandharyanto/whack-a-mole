"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MolePosition {
  index: number | null;
  type: "mole" | "rabbit" | "megapass" | null;
}

const WhackAMole = () => {
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [molePosition, setMolePosition] = useState<MolePosition>({
    index: null,
    type: null,
  });
  const [timeLeft, setTimeLeft] = useState<number>(100); // Timer state
  const [isClickable, setIsClickable] = useState<boolean>(true); // State to control clickability
  const [bestScore, setBestScore] = useState<number>(() => {
    return Number(localStorage.getItem("bestScore")) || 0;
  });
  const [showInfo, setShowInfo] = useState<boolean>(false); // State to control info modal visibility

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setGameOver(true);
            alert(`Time's up! Your final score is: ${score}`);
            return 0;
          }
          return prevTime - 1; // Decrease time
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, gameOver]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameOver) {
      interval = setInterval(() => {
        showMole();
      }, 2000); // Show mole every 2 seconds
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", String(score));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const showMole = () => {
    const randomPosition = Math.floor(Math.random() * 15);
    const moleOrRabbit = Math.random();
    let moleType: "mole" | "rabbit" | "megapass";

    if (moleOrRabbit < 0.6) {
      moleType = "mole"; // 60% chance for regular mole
    } else if (moleOrRabbit < 0.9) {
      moleType = "rabbit"; // 30% chance for rabbit
    } else {
      moleType = "megapass"; // 10% chance for Mega Pass
    }

    setMolePosition({ index: randomPosition, type: moleType });

    // Keep mole visible for 1.5 seconds before disappearing
    setTimeout(() => {
      setMolePosition({ index: null, type: null });
    }, 1500);
  };

  const handleClick = (index: number) => {
    if (!isClickable) return;

    if (index === molePosition.index) {
      if (molePosition.type === "mole") {
        setScore((prevScore) => prevScore + 1);
        setIsClickable(false);
        setMolePosition({ index: null, type: null });

        setTimeout(() => {
          setIsClickable(true);
        }, 500); // Enable clicks again after a delay
      } else if (molePosition.type === "megapass") {
        setScore((prevScore) => prevScore + 5); // Increase score by 5 for Mega Pass
        setIsClickable(false);
        setMolePosition({ index: null, type: null });

        setTimeout(() => {
          setIsClickable(true);
        }, 500); // Enable clicks again after a delay
      } else {
        setGameOver(true);
        alert(`Game Over! Your final score is: ${score}`);
      }
    }
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setTimeLeft(100); // Reset timer to 100 seconds
    showMole();
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setTimeLeft(100); // Reset timer to 100 seconds
    setMolePosition({ index: null, type: null }); // Reset mole position
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border-4 border-black p-4 bg-gray-800 rounded-lg">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/images/megarabbit.png"
            alt="Mega Rabbit"
            width={150}
            height={150}
          />
          <h1 className="text-2xl font-bold mb-4 text-white">
            Whack-a-Mole Game
          </h1>
        </div>
        {gameStarted ? (
          <div className="text-lg mb-4 text-white">Score: {score}</div>
        ) : (
          <div className="text-lg mb-4 text-white">Best Score: {bestScore}</div>
        )}
        <div className="text-lg mb-4 text-white">Time Left: {timeLeft}s</div>
        {/* Display timer */}
        {!gameStarted ? (
          <div className="flex justify-between">
            <button
              onClick={startGame}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Start Game
            </button>

            <button
              onClick={() => setShowInfo(true)} // Show info modal
              className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition"
            >
              Game Info
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, index) => (
              <div
                key={index}
                className="relative w-24 h-24 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: "url('/images/hole.png')",
                  backgroundSize: "cover",
                }}
                onClick={() => handleClick(index)}
              >
                {molePosition.index === index ? (
                  <div
                    className={`absolute transition-transform duration-500 ${
                      molePosition.type === "mole"
                        ? "animate-mole"
                        : molePosition.type === "megapass"
                        ? "animate-mole"
                        : "animate-rabbit"
                    }`}
                  >
                    {molePosition.type === "mole" ? (
                      <Image
                        src="/images/mole.png"
                        alt="Mole"
                        width={100}
                        height={100}
                      />
                    ) : molePosition.type === "megapass" ? (
                      <Image
                        src="/images/megapass.png"
                        alt="Mega Pass"
                        width={100}
                        height={100}
                      />
                    ) : (
                      <Image
                        src="/images/rabbit.png"
                        alt="Rabbit"
                        width={100}
                        height={100}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {gameOver && (
          <button
            onClick={resetGame} // Reset game when clicked
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition mt-4"
          >
            Back to Menu
          </button>
        )}
      </div>

      {/* Information Modal */}
      {showInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-7 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-2">How to Play</h2>
            <div className="flex items-center">
              <Image
                src="/images/mole.png"
                alt="Mole"
                width={100}
                height={100}
              />
              <span>Click on the mole to score points!</span>
            </div>
            <div className="flex items-center">
              <Image
                src="/images/rabbit.png"
                alt="Rabbit"
                width={100}
                height={100}
              />
              <span>Avoid clicking on the rabbit, or the game will end!</span>
            </div>
            <div className="flex items-center">
              <Image
                src="/images/megapass.png"
                alt="Mega Pass"
                width={100}
                height={100}
              />
              <span>Hitting the Mega Pass gives you +5 points!</span>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowInfo(false)} // Close info modal
                className="bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhackAMole;
