import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Flame, LogOut } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground">Flintyo</span>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
          <LogOut className="mr-1 h-4 w-4" />
          Sign out
        </Button>
      </header>

      {/* Placeholder feed */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <Flame className="h-16 w-16 text-primary animate-pulse-glow" />
        <h2 className="text-xl font-semibold text-foreground">Welcome to Flintyo</h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          You're signed in as <span className="font-mono text-primary">{user?.email}</span>. 
          The home feed is coming next.
        </p>
      </main>
    </div>
  );
};

export default Index;
