import React, {
  useEffect,
  useState,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import { initializeBoard, placeRandom, checkGameOver } from "./GameUtils";
import "./App.css";

// BOARD_SIZE sets the dimensions of the game board to be 4x4
// actionTypes defines action names for use in the Redux reducer
const BOARD_SIZE = 4;
const actionTypes = {
  MOVE: "MOVE",
  RESTART: "RESTART",
  GAME_OVER: "GAME_OVER",
  SET_RECORD: "SET_RECORD",
};

// The Board component renders a game board using a flat array representation
// It styles each tile based on its value and the chosen theme (dark or light)
const Board = ({ flatBoard, theme }) => (
  <div className="board">
    {flatBoard.map((tile, i) => (
      <div
        key={i}
        className="tile"
        style={{
          background:
            theme === "dark"
              ? tile
                ? `linear-gradient(45deg, hsl(${
                    Math.log2(tile) * 30
                  }, 55%, 45%), hsl(${Math.log2(tile) * 30 + 10}, 90%, 75%))`
                : "linear-gradient(45deg, #ccc, #999)"
              : tile
              ? `linear-gradient(45deg, hsl(${
                  Math.log2(tile) * 30
                }, 75%, 65%), hsl(${Math.log2(tile) * 30 + 20}, 80%, 75%))`
              : "linear-gradient(45deg, #ddd, #eee)",
        }}
      >
        {tile !== null && tile}
      </div>
    ))}
  </div>
);

// Initialize the game state by attempting to load from localStorage, otherwise set to default values
// If loading fails, log the error and revert to default state
const initialState = (() => {
  try {
    const gameState = JSON.parse(localStorage.getItem("gameState")) || {};
    const elapsedTimeFromStorage = localStorage.getItem("elapsedTime");
    const elapsedTime = isNaN(Number(elapsedTimeFromStorage))
      ? 0
      : Number(elapsedTimeFromStorage);
    const timerRunning =
      JSON.parse(localStorage.getItem("timerRunning")) || false;
    const record = Number(localStorage.getItem("record")) || 0;

    // Return the loaded gameState if it's valid, otherwise return default state
    if (
      gameState.board &&
      Array.isArray(gameState.board) &&
      typeof gameState.score === "number"
    ) {
      return {
        ...gameState,
        record,
        elapsedTime,
        timerRunning,
      };
    } else {
      return {
        board: initializeBoard(),
        score: 0,
        record,
        gameOver: false,
        elapsedTime,
        timerRunning,
      };
    }
  } catch (error) {
    console.error("Could not retrieve from localStorage: ", error);
    return {
      board: initializeBoard(),
      score: 0,
      record: 0,
      gameOver: false,
      elapsedTime: 0,
      timerRunning: false,
    };
  }
})();

// Helper function to save to local storage
const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key} to localStorage: `, error);
  }
};

// Reducer function to manage game state based on different action types
// Takes current state and an action, returns new updated state
const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.MOVE:
      const newBoard = action.newBoard;
      return {
        ...state,
        board: newBoard,
        score: state.score + action.scoreIncrement,
      };
    case actionTypes.RESTART:
      return {
        board: initializeBoard(),
        score: 0,
        record: state.record,
        gameOver: false,
      };
    case actionTypes.GAME_OVER:
      return { ...state, gameOver: true };
    case actionTypes.SET_RECORD:
      return { ...state, record: action.record };
    default:
      return state;
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isTouchDevice] = useState("ontouchstart" in window);
  const [elapsedTime, setElapsedTime] = useState(initialState.elapsedTime);
  const [timerRunning, setTimerRunning] = useState(initialState.timerRunning);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem("app-theme") || "light";
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(true);

  // Use useMemo to cache the flattened board
  const flatBoard = useMemo(() => state.board.flat(), [state.board]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        // Save record score
        if (state.gameOver && state.score > state.record) {
          dispatch({ type: actionTypes.SET_RECORD, record: state.score });
          saveToLocalStorage("record", state.score);
        }
        // Save current game state
        saveToLocalStorage("gameState", state);
        // Save timer state
        saveToLocalStorage("elapsedTime", elapsedTime || 0);
        saveToLocalStorage("timerRunning", timerRunning);
      } catch (error) {
        console.error("Could not save to localStorage: ", error);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [elapsedTime, state, timerRunning]);

  useEffect(() => {
    // Apply the theme to the document root on component mount and theme change
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  useEffect(() => {
    if (state.gameOver) {
      setShowGameOverOverlay(true);
    }
  }, [state.gameOver]);

  useEffect(() => {
    let timer;
    if (state.gameOver) {
      setShowGameOverOverlay(true);
      timer = setTimeout(() => {
        // Show hint
        const hintElement = document.getElementById("hint");
        hintElement.style.display = "block";
        setTimeout(() => {
          hintElement.style.display = "none";
          setShowGameOverOverlay(false);
        }, 10000);
      }, 0);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [state.gameOver]);

  useEffect(() => {
    // Save the theme value to local storage whenever it changes
    window.localStorage.setItem("app-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (state.gameOver || !timerRunning) return;

    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [state.gameOver, timerRunning]);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleKeydown({ key: "ArrowRight" });
      } else {
        handleKeydown({ key: "ArrowLeft" });
      }
    } else {
      if (deltaY > 0) {
        handleKeydown({ key: "ArrowDown" });
      } else {
        handleKeydown({ key: "ArrowUp" });
      }
    }
  };

  const handleKeydown = useCallback(
    (e) => {
      const mergeTiles = (line) => {
        const newLine = Array(BOARD_SIZE).fill(null);
        let scoreIncrement = 0;
        let position = 0;

        for (let i = 0; i < line.length; i++) {
          let tile = line[i];
          if (tile === null) continue;

          if (newLine[position] === null) {
            newLine[position] = tile;
          } else if (newLine[position] === tile) {
            newLine[position] *= 2;
            scoreIncrement += newLine[position];
            position++;
          } else {
            position++;
            newLine[position] = tile;
          }
        }
        return { newLine, scoreIncrement };
      };

      let newBoard = [];
      let scoreIncrement = 0;
      let boardChanged = false;

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        for (let i = 0; i < BOARD_SIZE; i++) {
          const line =
            e.key === "ArrowUp" || e.key === "ArrowDown"
              ? state.board.map((row) => row[i])
              : state.board[i];

          const filteredLine =
            e.key === "ArrowDown" || e.key === "ArrowRight"
              ? line.filter(Boolean).reverse()
              : line.filter(Boolean);

          const { newLine, scoreIncrement: lineScore } =
            mergeTiles(filteredLine);
          scoreIncrement += lineScore;

          if (e.key === "ArrowDown" || e.key === "ArrowRight")
            newLine.reverse();

          for (let j = 0; j < BOARD_SIZE; j++) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              newBoard[j] = [...(newBoard[j] || []), newLine[j]];
            } else {
              newBoard[i] = [...(newBoard[i] || []), newLine[j]];
            }
            if (newLine[j] !== line[j]) boardChanged = true;
          }
        }

        if (boardChanged) {
          if (!timerRunning) {
            setTimerRunning(true); // Start the timer on the first move
          }
          placeRandom(newBoard);
          dispatch({
            type: actionTypes.MOVE,
            newBoard,
            scoreIncrement,
          });

          // Check if game is over and dispatch GAME_OVER action if needed
          const gameOver = checkGameOver(newBoard);
          if (gameOver) {
            dispatch({ type: actionTypes.GAME_OVER });
          }
        }
      }
    },
    [state.board, timerRunning]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleKeydown]);

  const restartGame = () => {
    localStorage.removeItem("gameState"); // Clear saved game state
    dispatch({ type: actionTypes.RESTART });
    setElapsedTime(0); // Reset timer
    setTimerRunning(false); // Stop timer
  };

  // State to manage tutorial overlay visibility
  const [showTutorial, setShowTutorial] = useState(() => {
    return sessionStorage.getItem("tutorialShown") === null;
  });
  // Hide the tutorial and set a flag in sessionStorage
  const hideTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem("tutorialShown", "true");
  };
  // Function to reset the tutorial display
  const resetTutorial = () => {
    sessionStorage.removeItem("tutorialShown");
    setShowTutorial(true);
  };

  return (
    <div
      className="container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <h1>Slide & Merge</h1>
      <p className="hint">
        {isTouchDevice
          ? "Swipe to move and merge the tiles!"
          : "Use your keyboard's arrow keys to move and merge the tiles!"}
      </p>
      <Board flatBoard={flatBoard} theme={theme} />
      <div className="score-record">
        <h2>🎯 Score: {state.score}</h2>
        <h2>🥇 Record: {state.record}</h2>
        <h2 className="timer">
          🕒 Time:{" "}
          {typeof elapsedTime === "number" && !isNaN(elapsedTime)
            ? `${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60)
                .toString()
                .padStart(2, "0")}`
            : "N/A"}
        </h2>
      </div>
      {showSettingsMenu && (
        <div className="settings-menu fade-in">
          <h2>Game Settings</h2>
          <div
            className="buttons-wrapper"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
          >
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={resetTutorial}>Show Tutorial</button>
            <button onClick={restartGame}>Restart Game</button>
          </div>
        </div>
      )}
      {state.gameOver && showGameOverOverlay && (
        <div className="game-over fade-in">
          <h2>Game Over!</h2>
          <p>Your scored {state.score} points. Do you want to play again?</p>
          <button onClick={restartGame}>Yes, please!</button>
          <button
            onClick={() => {
              setShowGameOverOverlay(false);
            }}
          >
            Show the Board
          </button>
        </div>
      )}

      {showTutorial && (
        <div className="tutorial-overlay fade-in">
          <h2>Welcome to Slide & Merge!</h2>
          <p>
            The goal is simple: move and merge tiles to reach higher numbers.
          </p>
          <ul>
            <li>Swipe or use arrow keys to move the tiles.</li>
            <li>Merging tiles adds up their values.</li>
            <li>The game is over when you can't move anymore.</li>
          </ul>
          <button onClick={hideTutorial}>Got it!</button>
        </div>
      )}
      <button
        className="settings-toggle-button"
        onClick={() => setShowSettingsMenu(!showSettingsMenu)}
      >
        ⚙️
      </button>
      <div id="hint">Restart the game, change theme etc.</div>
    </div>
  );
};

export default App;
