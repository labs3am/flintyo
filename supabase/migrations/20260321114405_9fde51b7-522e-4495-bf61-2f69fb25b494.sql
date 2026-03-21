
SELECT cron.schedule(
  'weekly-broadcast-email',
  '0 10 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://tyeqzhiwrymkrebhjvor.supabase.co/functions/v1/send-broadcast-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZXF6aGl3cnlta3JlYmhqdm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODI3MTIsImV4cCI6MjA4OTI1ODcxMn0.LH8oy8lYiCUMAT30B7dFOomhqgNahmF6STqVZfjEGcg"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
