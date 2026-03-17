import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Swords, MessageCircle, Trophy, Info } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  clash_challenge: { icon: Swords, color: "text-primary" },
  clash_accepted: { icon: Swords, color: "text-success" },
  clash_result: { icon: Trophy, color: "text-rank-gold" },
  chat_match: { icon: MessageCircle, color: "text-primary" },
};

const defaultConfig = { icon: Info, color: "text-muted-foreground" };

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (data) setNotifications(data as Notification[]);
    };

    load();

    const sub = supabase
      .channel("my-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [user]);

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
      );
    }
    setOpen(false);

    if (n.link) {
      // For chat notifications, check if chat is still active
      if (n.type === "chat_match" && n.link === "/talk") {
        navigate("/talk");
        return;
      }

      // For debate notifications, check if debate exists
      if (n.link.startsWith("/debate/")) {
        const debateId = n.link.replace("/debate/", "");
        const { data } = await supabase
          .from("debates")
          .select("id, status")
          .eq("id", debateId)
          .single();

        if (!data) {
          return; // debate doesn't exist
        }
        // If finished, still allow viewing results
        navigate(n.link);
        return;
      }

      navigate(n.link);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  // Group notifications: today vs earlier
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayNotifs = notifications.filter((n) => new Date(n.created_at) >= today);
  const earlierNotifs = notifications.filter((n) => new Date(n.created_at) < today);

  const renderNotification = (n: Notification) => {
    const cfg = typeConfig[n.type] || defaultConfig;
    const Icon = cfg.icon;

    return (
      <button
        key={n.id}
        onClick={() => handleClick(n)}
        className={`w-full text-left px-3 py-2.5 hover:bg-secondary/50 transition-colors flex items-start gap-2.5 ${
          !n.is_read ? "bg-primary/5" : ""
        }`}
      >
        <div className={`mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-secondary ${cfg.color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground truncate flex items-center gap-1">
              {!n.is_read && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              )}
              {n.title}
            </p>
            <span className="text-[9px] text-muted-foreground shrink-0">
              {timeAgo(n.created_at)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
            {n.message}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-muted-foreground hover:text-foreground transition-colors p-1"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-8 z-40 w-80 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <>
                  {todayNotifs.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 bg-secondary/20">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today</span>
                      </div>
                      {todayNotifs.map(renderNotification)}
                    </>
                  )}
                  {earlierNotifs.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 bg-secondary/20">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Earlier</span>
                      </div>
                      {earlierNotifs.map(renderNotification)}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
