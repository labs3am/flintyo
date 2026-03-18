import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { completeDailyTask } from "@/lib/dailyTasks";
import TalkSearch from "@/components/talk/TalkSearch";
import TalkChat from "@/components/talk/TalkChat";

const LetsTalk = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searching, setSearching] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleSearch = useCallback(async (category: string, topic: string) => {
    if (!user) return;
    const searchTopic = topic.trim() || category;
    setSearching(true);

    const { data, error } = await supabase.rpc("find_chat_match" as never, {
      p_user_id: user.id,
      p_topic: searchTopic,
    } as never);

    if (error) {
      toast({ title: "Search failed", variant: "destructive" });
      setSearching(false);
      return;
    }

    if (data) {
      setChatId(data as string);
      setSearching(false);
      completeDailyTask("start_chat");
    } else {
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 3000;
        if (elapsed > 60000) {
          if (pollRef.current) clearInterval(pollRef.current);
          await supabase.from("chat_queue").delete().eq("user_id", user.id);
          setSearching(false);
          toast({ title: "No one available right now. Try again later!", variant: "destructive" });
          return;
        }
        const { data: chats } = await supabase
          .from("chats")
          .select("id")
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .order("created_at", { ascending: false })
          .limit(1);

        if (chats && chats.length > 0) {
          setChatId(chats[0].id);
          setSearching(false);
          completeDailyTask("start_chat");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 3000);
    }
  }, [user, toast]);

  const handleCancel = useCallback(async () => {
    if (!user) return;
    await supabase.from("chat_queue").delete().eq("user_id", user.id);
    setSearching(false);
    if (pollRef.current) clearInterval(pollRef.current);
  }, [user]);

  const handleNewChat = () => {
    setChatId(null);
  };

  if (!user) return null;

  if (chatId) {
    return <TalkChat chatId={chatId} userId={user.id} onNewChat={handleNewChat} />;
  }

  return (
    <TalkSearch
      searching={searching}
      onSearch={handleSearch}
      onCancel={handleCancel}
      onMatch={(id) => setChatId(id)}
    />
  );
};

export default LetsTalk;
