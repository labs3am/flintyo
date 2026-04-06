import { useState, useEffect, useCallback, useRef } from "react";

const COLS = 10;
const ROWS = 20;
const TICK = 500;

type Piece = { shape: number[][]; x: number; y: number; color: string };

const SHAPES = [
  { shape: [[1,1,1,1]], color: "#06b6d4" },
  { shape: [[1,1],[1,1]], color: "#eab308" },
  { shape: [[0,1,0],[1,1,1]], color: "#a855f7" },
  { shape: [[1,0],[1,0],[1,1]], color: "#f97316" },
  { shape: [[0,1],[0,1],[1,1]], color: "#3b82f6" },
  { shape: [[1,1,0],[0,1,1]], color: "#ef4444" },
  { shape: [[0,1,1],[1,1,0]], color: "#22c55e" },
];

const createGrid = (): string[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(""));

const randomPiece = (): Piece => {
  const t = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return { shape: t.shape.map(r => [...r]), x: Math.floor(COLS / 2) - 1, y: 0, color: t.color };
};

const rotate = (shape: number[][]): number[][] => {
  const rows = shape.length, cols = shape[0].length;
  return Array.from({ length: cols }, (_, c) =>
    Array.from({ length: rows }, (_, r) => shape[rows - 1 - r][c])
  );
};

const collides = (grid: string[][], piece: Piece): boolean => {
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) {
        const nx = piece.x + c, ny = piece.y + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && grid[ny][nx]) return true;
      }
  return false;
};

const merge = (grid: string[][], piece: Piece): string[][] => {
  const g = grid.map(r => [...r]);
  for (let r = 0; r < piece.shape.length; r++)
    for (let c = 0; c < piece.shape[r].length; c++)
      if (piece.shape[r][c]) {
        const ny = piece.y + r, nx = piece.x + c;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) g[ny][nx] = piece.color;
      }
  return g;
};

const clearLines = (grid: string[][]): { grid: string[][]; cleared: number } => {
  const kept = grid.filter(row => row.some(c => !c));
  const cleared = ROWS - kept.length;
  const empty = Array.from({ length: cleared }, () => Array(COLS).fill(""));
  return { grid: [...empty, ...kept], cleared };
};

const TetrisGame = () => {
  const [grid, setGrid] = useState(createGrid);
  const [piece, setPiece] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const pieceRef = useRef(piece);
  const gridRef = useRef(grid);
  pieceRef.current = piece;
  gridRef.current = grid;

  const tryMove = useCallback((dx: number, dy: number, newShape?: number[][]) => {
    const p = pieceRef.current;
    const moved: Piece = {
      ...p,
      x: p.x + dx,
      y: p.y + dy,
      shape: newShape || p.shape,
    };
    if (!collides(gridRef.current, moved)) {
      setPiece(moved);
      return true;
    }
    return false;
  }, []);

  const drop = useCallback(() => {
    const p = pieceRef.current;
    const moved = { ...p, y: p.y + 1 };
    if (!collides(gridRef.current, moved)) {
      setPiece(moved);
    } else {
      const merged = merge(gridRef.current, p);
      const { grid: cleared, cleared: lines } = clearLines(merged);
      setGrid(cleared);
      setScore(s => s + lines * 100 + 10);
      const next = randomPiece();
      if (collides(cleared, next)) {
        setGameOver(true);
      } else {
        setPiece(next);
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    const p = { ...pieceRef.current };
    while (!collides(gridRef.current, { ...p, y: p.y + 1 })) p.y++;
    setPiece(p);
    // Let next tick handle merge
    const merged = merge(gridRef.current, p);
    const { grid: cleared, cleared: lines } = clearLines(merged);
    setGrid(cleared);
    setScore(s => s + lines * 100 + 20);
    const next = randomPiece();
    if (collides(cleared, next)) setGameOver(true);
    else setPiece(next);
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const id = setInterval(drop, TICK);
    return () => clearInterval(id);
  }, [started, gameOver, drop]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (!started) { setStarted(true); return; }
      if (e.key === "ArrowLeft") tryMove(-1, 0);
      else if (e.key === "ArrowRight") tryMove(1, 0);
      else if (e.key === "ArrowDown") drop();
      else if (e.key === "ArrowUp") {
        const rotated = rotate(pieceRef.current.shape);
        tryMove(0, 0, rotated);
      } else if (e.key === " ") { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [started, gameOver, tryMove, drop, hardDrop]);

  const reset = () => {
    setGrid(createGrid());
    setPiece(randomPiece());
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  // Render grid with current piece overlaid
  const display = grid.map(r => [...r]);
  if (!gameOver) {
    for (let r = 0; r < piece.shape.length; r++)
      for (let c = 0; c < piece.shape[r].length; c++)
        if (piece.shape[r][c]) {
          const ny = piece.y + r, nx = piece.x + c;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS)
            display[ny][nx] = piece.color;
        }
  }

  const cellSize = 24;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full px-1" style={{ maxWidth: cellSize * COLS }}>
        <span className="text-zinc-500 text-xs font-mono">Score: {score}</span>
        {gameOver && (
          <button onClick={reset} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            Play Again
          </button>
        )}
      </div>

      <div
        className="relative border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden select-none"
        style={{ width: cellSize * COLS + 2, height: cellSize * ROWS + 2 }}
      >
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/60 backdrop-blur-sm">
            <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors animate-pulse">
              Tap to start
            </button>
          </div>
        )}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/70 backdrop-blur-sm gap-2">
            <p className="text-white text-sm font-medium">Game Over</p>
            <p className="text-zinc-400 text-xs">Score: {score}</p>
          </div>
        )}
        {display.map((row, ri) => (
          <div key={ri} className="flex">
            {row.map((cell, ci) => (
              <div
                key={ci}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cell || "transparent",
                  border: cell ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.03)",
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-5 gap-1.5 w-[260px]">
        <button
          onTouchStart={(e) => { e.preventDefault(); tryMove(-1, 0); if (!started) setStarted(true); }}
          onClick={() => { tryMove(-1, 0); if (!started) setStarted(true); }}
          className="col-span-1 h-12 rounded-lg bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg font-bold"
        >
          ←
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            const rotated = rotate(pieceRef.current.shape);
            tryMove(0, 0, rotated);
            if (!started) setStarted(true);
          }}
          onClick={() => {
            const rotated = rotate(pieceRef.current.shape);
            tryMove(0, 0, rotated);
            if (!started) setStarted(true);
          }}
          className="col-span-1 h-12 rounded-lg bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold"
        >
          ↻
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); drop(); if (!started) setStarted(true); }}
          onClick={() => { drop(); if (!started) setStarted(true); }}
          className="col-span-1 h-12 rounded-lg bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg font-bold"
        >
          ↓
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); hardDrop(); if (!started) setStarted(true); }}
          onClick={() => { hardDrop(); if (!started) setStarted(true); }}
          className="col-span-1 h-12 rounded-lg bg-red-900/60 active:bg-red-800/60 flex items-center justify-center text-zinc-300 text-xs font-bold"
        >
          ⤓
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); tryMove(1, 0); if (!started) setStarted(true); }}
          onClick={() => { tryMove(1, 0); if (!started) setStarted(true); }}
          className="col-span-1 h-12 rounded-lg bg-zinc-800 active:bg-zinc-700 flex items-center justify-center text-zinc-300 text-lg font-bold"
        >
          →
        </button>
      </div>
    </div>
  );
};

const Shutdown = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-6 py-10 gap-8 overflow-y-auto">
      <div className="text-center space-y-4 max-w-sm">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Flintyo Has Shut Down
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Every spark fades, but the conversations we had were real.
          Thank you for debating, clashing, and speaking your mind — 
          anonymously and honestly. Flintyo may be gone, but the ideas 
          you shared live on.
        </p>
        <p className="text-zinc-500 text-xs">
          All accounts and data have been permanently deleted.
        </p>
      </div>

      <div className="w-full max-w-xs border-t border-zinc-800 pt-6">
        <p className="text-center text-zinc-600 text-[10px] uppercase tracking-widest mb-4">
          While you're here...
        </p>
        <TetrisGame />
      </div>

      <p className="text-[10px] text-zinc-700 pb-4">© 2025 Flintyo</p>
    </div>
  );
};

export default Shutdown;
