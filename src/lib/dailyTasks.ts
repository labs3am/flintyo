import { supabase } from "@/integrations/supabase/client";

export interface DailyTask {
  id: string;
  label: string;
  task_type: string;
  points: number;
  icon: string;
}

export const DAILY_TASKS: DailyTask[] = [
  { id: "post_flint", label: "Post a Flint", task_type: "post_flint", points: 5, icon: "🔥" },
  { id: "vote_flint", label: "Vote on a Flint", task_type: "vote_flint", points: 2, icon: "👍" },
  { id: "comment_flint", label: "Comment on a Flint", task_type: "comment_flint", points: 3, icon: "💬" },
  { id: "start_chat", label: "Start a Let's Talk", task_type: "start_chat", points: 5, icon: "🗣️" },
  { id: "clash_debate", label: "Start or join a Clash", task_type: "clash_debate", points: 5, icon: "⚔️" },
];

export const completeDailyTask = async (taskType: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc("complete_daily_task" as never, {
    p_task_type: taskType,
  } as never);

  if (error) return false;
  return data as unknown as boolean;
};

export const fetchTodayTasks = async (userId: string): Promise<string[]> => {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_tasks")
    .select("task_type")
    .eq("user_id", userId)
    .eq("task_date", today);

  return (data || []).map((d: any) => d.task_type);
};

export const fetchTotalTaskPoints = async (userId: string): Promise<number> => {
  const { data } = await supabase
    .from("daily_tasks")
    .select("points_awarded")
    .eq("user_id", userId);

  return (data || []).reduce((sum: number, d: any) => sum + d.points_awarded, 0);
};
