-- Delete all feed-related data to start fresh
-- Order matters due to foreign keys
DELETE FROM debate_votes;
DELETE FROM debate_messages;
DELETE FROM debates;
DELETE FROM votes;
DELETE FROM comments;
DELETE FROM reports;
DELETE FROM flints;
