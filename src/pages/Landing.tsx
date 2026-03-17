import { Link } from "react-router-dom";
import { Flame, Zap, Swords, MessageCircle, ArrowRight, Sparkles, ThumbsUp, ThumbsDown, Clock, ChevronDown, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const EXAMPLE_FLINTS = [
  { id: "LabsID_48291", content: "Is success worth sacrificing peace?", category: "Life" },
  { id: "LabsID_10283", content: "Does religion unite people or divide them?", category: "Religion" },
  { id: "LabsID_58392", content: "Would you rather know the future or change the past?", category: "Other" },
];

const STEPS = [
  { num: "1", title: "Create a LabsID", desc: "Your anonymous identity — no name, no photo, just ideas." },
  { num: "2", title: "Share a Flint", desc: "Post a thought. It disappears in 12 hours unless you save it." },
  { num: "3", title: "Debate ideas", desc: "Challenge someone to a Clash. The audience picks the winner." },
  { num: "4", title: "Talk with strangers", desc: "Match anonymously by topic. 10 minutes. No strings." },
];

const Landing = () => {
  const scrollToContent = () => {
    document.getElementById("what-is-flint")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Flintyo</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-xs">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="text-xs font-semibold">Create LabsID</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Flame className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Flintyo
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium">
            Where thoughts appear and disappear like sparks.
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Flintyo is an anonymous space for ideas, debates, and conversations.
            Share thoughts, challenge perspectives, and talk with strangers — without identity pressure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/signup">
              <Button size="lg" className="font-semibold gap-2 px-8">
                <Sparkles className="h-4 w-4" />
                Create Your LabsID
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 px-8" onClick={scrollToContent}>
              Explore Flintyo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground animate-bounce"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </section>

      {/* What is a Flint? */}
      <section id="what-is-flint" className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold">What is a Flint?</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
              A Flint is a temporary thought shared on Flintyo. Most Flints disappear after 12 hours.
              Some sparks fade quickly. Others start debates.
            </p>
            <p className="text-muted-foreground text-sm">
              Share a question, an opinion, or an idea — and see how people respond.
            </p>
          </div>

          {/* Example Flints */}
          <div className="space-y-3 max-w-md mx-auto">
            {EXAMPLE_FLINTS.map((f) => (
              <div
                key={f.id}
                className="rounded-lg border border-border bg-card p-4 space-y-2 cursor-pointer hover:border-primary/30 transition-colors group"
                onClick={() => {/* trigger signup prompt */}}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-primary">{f.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{f.category}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" /> 11h 42m
                    </span>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">"{f.content}"</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-success transition-colors">
                    <ThumbsUp className="h-3.5 w-3.5" /> {Math.floor(Math.random() * 40 + 10)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-destructive transition-colors">
                    <ThumbsDown className="h-3.5 w-3.5" /> {Math.floor(Math.random() * 15 + 3)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Swords className="h-3.5 w-3.5" /> Clash
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Core Experiences */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Three Core Experiences</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "Flint",
                desc: "Share thoughts anonymously. Most posts disappear after a short time. Speak freely without identity pressure.",
              },
              {
                icon: <Swords className="h-8 w-8 text-primary" />,
                title: "Clash",
                desc: "Challenge ideas in live debates. Two people argue their perspective. The audience decides who wins.",
              },
              {
                icon: <MessageCircle className="h-8 w-8 text-primary" />,
                title: "Let's Talk",
                desc: "Start anonymous conversations with strangers. Choose a topic and match instantly. Talk for 10 minutes and see where it goes.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center space-y-3 p-6 rounded-xl border border-border bg-background">
                {item.icon}
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Flintyo Works */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto space-y-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">How Flintyo Works</h2>
          <div className="space-y-6">
            {STEPS.map((step) => (
              <div key={step.num} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Builder */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Flintyo is an experiment created under{" "}
            <a href="https://labs3am.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Labs3AM
            </a>,
            an independent project exploring new ways people can share ideas and connect online.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          <Flame className="h-10 w-10 text-primary mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to spark a conversation?</h2>
          <Link to="/signup">
            <Button size="lg" className="font-semibold gap-2 px-10">
              <Sparkles className="h-4 w-4" />
              Create Your LabsID
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-primary" />
            <span>Flintyo</span>
          </div>
          <span>
            from the house of{" "}
            <a href="https://labs3am.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Labs3am.com
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
