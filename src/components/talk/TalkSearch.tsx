import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, MessageCircle, Heart, Swords, Brain, Shuffle, Users, Globe, Clock, Shield, UserX, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";

const MOOD_OPTIONS = [
  { label: "Need Advice", icon: Heart, color: "text-pink-400" },
  { label: "Debate Me", icon: Swords, color: "text-orange-400" },
  { label: "Deep Talk", icon: Brain, color: "text-purple-400" },
  { label: "Random Chat", icon: Shuffle, color: "text-green-400" },
  { label: "Relationships", icon: Users, color: "text-red-400" },
  { label: "Real World", icon: Globe, color: "text-blue-400" },
];

const SEARCHING_MESSAGES = [
  "Finding someone…",
  "Matching energy…",
  "Almost there…",
  "Looking for the right person…",
];

const HOW_IT_WORKS = [
  { icon: UserX, title: "100% Anonymous", desc: "No names, no photos — just your LabsID" },
  { icon: Clock, title: "10 Min Chats", desc: "Timed conversations. Hold to extend if it's good" },
  { icon: Shield, title: "Safe Space", desc: "Report anything inappropriate with one tap" },
  { icon: MessageCircle, title: "Real Talks", desc: "Pick a mood, share what's on your mind, get matched" },
];

interface TalkSearchProps {
  onMatch: (chatId: string) => void;
  searching: boolean;
  noUserFound: boolean;
  onSearch: (category: string, topic: string) => void;
  onCancel: () => void;
}

const TalkSearch = ({ searching, noUserFound, onSearch, onCancel }: TalkSearchProps) => {
  const [selected, setSelected] = useState("Random Chat");
  const [topic, setTopic] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);

  // Cycle searching messages
  useEffect(() => {
    if (!searching) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % SEARCHING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [searching]);

  // No user found screen
  if (noUserFound) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Let's Talk</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4">
          <div className="text-4xl">😔</div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-foreground">No one available right now</h2>
            <p className="text-sm text-muted-foreground">Everyone's busy. Give it a minute and try again!</p>
          </div>
          <Button onClick={() => onSearch(selected, topic)} className="font-semibold gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (searching) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">Let's Talk</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-ping" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground animate-pulse">
              {SEARCHING_MESSAGES[msgIndex]}
            </p>
            <p className="text-xs text-muted-foreground">
              {selected}{topic.trim() ? ` · "${topic.trim()}"` : ""}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Let's Talk</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center gap-6 px-4 py-6 overflow-y-auto">
        {/* How it works */}
        <div className="w-full max-w-sm space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How it works</h3>
          <div className="grid grid-cols-2 gap-2">
            {HOW_IT_WORKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl bg-card border border-border p-3 space-y-1">
                <Icon className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">{title}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm h-px bg-border" />

        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-foreground">What's the vibe?</h2>
          <p className="text-xs text-muted-foreground">Pick a mood and get matched anonymously</p>
        </div>

        {/* Mood grid */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-2.5">
          {MOOD_OPTIONS.map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left transition-all ${
                selected === label
                  ? "bg-primary/15 border border-primary/40 shadow-sm"
                  : "bg-card border border-border hover:border-primary/20"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${selected === label ? "text-primary" : color}`} />
              <span className={`text-sm font-medium ${
                selected === label ? "text-primary" : "text-foreground"
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Topic input */}
        <div className="w-full max-w-sm space-y-2">
          <Textarea
            placeholder="What's on your mind? Ask for advice or share a thought…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-card border-border min-h-[80px] resize-none text-sm"
            maxLength={300}
          />
          <p className="text-[10px] text-muted-foreground text-right">{topic.length}/300</p>
        </div>

        <Button
          onClick={() => onSearch(selected, topic)}
          className="w-full max-w-sm font-semibold h-11"
        >
          Find someone 🔍
        </Button>
      </div>
    </div>
  );
};

export default TalkSearch;
