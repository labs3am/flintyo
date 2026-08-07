import { cn } from "@/lib/utils";
import { ranked, type Scores } from "@/lib/bhabhi/score";

/** Compact cross-round scoreboard: points earned and Donkey tally. */
export function ScoreBoard({
  scores,
  players,
  className,
}: {
  scores?: Scores;
  players: { id: string; name: string }[];
  className?: string;
}) {
  const rows = ranked(scores, players);
  const played = rows[0]?.rounds ?? 0;
  return (
    <div className={cn("panel rounded-2xl p-3", className)}>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Scoreboard</p>
        <p className="text-[10px] text-muted-foreground">{played} round{played === 1 ? "" : "s"}</p>
      </div>
      <ul className="flex flex-col gap-1">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-[10px] font-black text-muted-foreground">{i + 1}</span>
            <span className="flex-1 truncate font-semibold">{r.name}</span>
            <span className="text-[10px] text-muted-foreground">🫏 {r.donkeys}</span>
            <span className="w-8 text-right font-black text-gold">{r.points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
