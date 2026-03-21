import { Link, useLocation } from "react-router-dom";
import { Flame, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const { pathname } = useLocation();

  const links = [
    { to: "/", icon: Flame, label: "Home", match: "/" },
    { to: "/create", icon: Plus, label: "Flint", match: "/create", fab: true },
    { to: "/talk", icon: MessageCircle, label: "Talk", match: "/talk" },
    { to: "/profile", icon: User, label: "Profile", match: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-around py-2">
        {links.map(({ to, icon: Icon, label, match, fab }) => {
          const active = pathname === match;
          if (fab) {
            return (
              <Link key={to} to={to} className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary -mt-5 shadow-lg shadow-primary/30">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          }
          return (
            <Link key={to} to={to} className={cn("flex flex-col items-center gap-0.5", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
