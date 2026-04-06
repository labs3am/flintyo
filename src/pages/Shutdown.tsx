import { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 10;
const INITIAL_SPEED = 200;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Cell = { x: number; y: number };

const SnakeGame = () => {
  const [snake, setSnake] = useState<Cell[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Cell>({ x: 3, y: 3 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const dirRef = useRef<Direction>("RIGHT");

  const spawnFood = useCallback((currentSnake: Cell[]): Cell => {
    let newFood: Cell;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    const initial = [{ x: 5, y: 5 }];
    setSnake(initial);
    setFood(spawnFood(initial));
    setDirection("RIGHT");
    dirRef.current = "RIGHT";
    setGameOver(false);
    setScore(0);
    setStarted(true);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
        w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opposites: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (opposites[newDir] !== dirRef.current) {
        dirRef.current = newDir;
        setDirection(newDir);
      }
      if (!started && !gameOver) setStarted(true);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, gameOver]);

  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        const dir = dirRef.current;
        if (dir === "UP") head.y--;
        if (dir === "DOWN") head.y++;
        if (dir === "LEFT") head.x--;
        if (dir === "RIGHT") head.x++;

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 1);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, Math.max(80, INITIAL_SPEED - score * 8));
    return () => clearInterval(interval);
  }, [started, gameOver, food, score, spawnFood]);

  const handleSwipe = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    handleSwipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!handleSwipe.current) return;
    const dx = e.changedTouches[0].clientX - handleSwipe.current.x;
    const dy = e.changedTouches[0].clientY - handleSwipe.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    const opposites: Record<Direction, Direction> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    let newDir: Direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      newDir = dx > 0 ? "RIGHT" : "LEFT";
    } else {
      newDir = dy > 0 ? "DOWN" : "UP";
    }
    if (opposites[newDir] !== dirRef.current) {
      dirRef.current = newDir;
      setDirection(newDir);
    }
    if (!started && !gameOver) setStarted(true);
    handleSwipe.current = null;
  };

  const cellSize = `${100 / GRID_SIZE}%`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full max-w-[280px] px-1">
        <span className="text-zinc-500 text-xs">Score: {score}</span>
        {gameOver && (
          <button onClick={resetGame} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Play Again
          </button>
        )}
      </div>
      <div
        className="relative w-[280px] h-[280px] border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button onClick={resetGame} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors animate-pulse">
              Tap or press arrow keys to start
            </button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 backdrop-blur-sm rounded-lg gap-2">
            <p className="text-white text-sm font-medium">Game Over</p>
            <p className="text-zinc-400 text-xs">Score: {score}</p>
          </div>
        )}
        {/* Food */}
        <div
          className="absolute rounded-full bg-red-500"
          style={{
            width: cellSize, height: cellSize,
            left: `${(food.x / GRID_SIZE) * 100}%`,
            top: `${(food.y / GRID_SIZE) * 100}%`,
          }}
        />
        {/* Snake */}
        {snake.map((cell, i) => (
          <div
            key={i}
            className={`absolute rounded-sm ${i === 0 ? "bg-white" : "bg-zinc-400"}`}
            style={{
              width: cellSize, height: cellSize,
              left: `${(cell.x / GRID_SIZE) * 100}%`,
              top: `${(cell.y / GRID_SIZE) * 100}%`,
            }}
          />
        ))}
      </div>
      {/* Mobile D-pad */}
      <div className="grid grid-cols-3 gap-1 w-[140px] sm:hidden">
        <div />
        <button onClick={() => { dirRef.current !== "DOWN" && (dirRef.current = "UP"); setDirection("UP"); if (!started) setStarted(true); }} className="h-10 rounded bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg">↑</button>
        <div />
        <button onClick={() => { dirRef.current !== "RIGHT" && (dirRef.current = "LEFT"); setDirection("LEFT"); if (!started) setStarted(true); }} className="h-10 rounded bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg">←</button>
        <div className="h-10" />
        <button onClick={() => { dirRef.current !== "LEFT" && (dirRef.current = "RIGHT"); setDirection("RIGHT"); if (!started) setStarted(true); }} className="h-10 rounded bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg">→</button>
        <div />
        <button onClick={() => { dirRef.current !== "UP" && (dirRef.current = "DOWN"); setDirection("DOWN"); if (!started) setStarted(true); }} className="h-10 rounded bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg">↓</button>
        <div />
      </div>
    </div>
  );
};

const Shutdown = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 gap-10">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Flintyo Has Shut Down
        </h1>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">
          All data has been permanently deleted. Thanks for the memories.
        </p>
      </div>

      <SnakeGame />

      <p className="text-[10px] text-zinc-700">© 2025 Flintyo</p>
    </div>
  );
};

export default Shutdown;
