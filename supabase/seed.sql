-- Sample rooms and demo hosts for The Living Room.
-- Run after schema.sql. Safe to re-run (uses upserts on slug).

insert into user_profiles (id, display_name, is_guest, role, is_over_18_confirmed)
values
  ('00000000-0000-0000-0000-000000000001', 'Mara', false, 'host', true),
  ('00000000-0000-0000-0000-000000000002', 'Tomas', false, 'host', true),
  ('00000000-0000-0000-0000-000000000003', 'Priya', false, 'host', true)
on conflict (id) do nothing;

insert into rooms (slug, name, description, format, activity_level, host_id, host_prompts)
values
  ('morning-coffee', 'Morning Coffee', 'A slow start, together. Come as you are, before the day gets loud.', 'conversation', 'Gentle Conversation', '00000000-0000-0000-0000-000000000001', array['What are you drinking this morning?', 'One ordinary thing you''re looking forward to today?']),
  ('quiet-company', 'Quiet Company', 'No topic, no agenda. Just people sitting nearby.', 'quiet', 'Quiet', null, array['No need to say anything. You''re welcome to simply stay.']),
  ('watching-television', 'Watching Television', 'Everyone has something on in the background. Say what, or don''t.', 'activity', 'Quiet', null, array['What''s on your screen tonight?']),
  ('reading-together', 'Reading Together', 'Bring your book. Read in company, look up when you feel like it.', 'activity', 'Quiet', '00000000-0000-0000-0000-000000000002', array['What are you reading at the moment?']),
  ('working-from-home', 'Working From Home', 'A shared desk, without the small talk. Just company while you work.', 'quiet', 'Quiet', null, array['Wave if you''re heads-down. No explanation needed.']),
  ('cooking-dinner', 'Cooking Dinner', 'Chop, stir, taste. Company for the part of the evening that''s often solitary.', 'activity', 'Gentle Conversation', null, array['What''s on the stove tonight?']),
  ('night-owls', 'Night Owls', 'For the people still awake when the rest of the house is quiet.', 'conversation', 'Gentle Conversation', '00000000-0000-0000-0000-000000000003', array['What''s keeping you up tonight? No need to answer.']),
  ('cant-sleep', 'Can''t Sleep', 'A low-lit room for the hours that feel longest alone.', 'quiet', 'Quiet', null, array['You don''t have to explain why you''re awake.']),
  ('gardening', 'Gardening', 'Dirt under your nails or just a windowsill pot. Company while you tend to something.', 'activity', 'Gentle Conversation', null, array['What are you growing, or trying to?']),
  ('music-in-the-background', 'Music in the Background', 'Everyone''s got something playing. Share it or just listen along.', 'activity', 'Gentle Conversation', null, array['What''s playing for you right now?']),
  ('sunday-afternoon', 'Sunday Afternoon', 'That particular stillness before the week starts again.', 'quiet', 'Quiet', null, array['No need to answer. You are welcome to simply stay.']),
  ('living-alone', 'Living Alone', 'For the quiet of a home with just you in it.', 'conversation', 'Gentle Conversation', '00000000-0000-0000-0000-000000000001', array['What does your evening routine look like?']),
  ('recently-retired', 'Recently Retired', 'The days look different now. Company for that adjustment.', 'conversation', 'Gentle Conversation', null, array['What''s surprised you most about the new pace?']),
  ('carers-corner', 'Carers'' Corner', 'For the people looking after someone else. A room that asks nothing of you.', 'quiet', 'Quiet', '00000000-0000-0000-0000-000000000003', array['Say hello with a wave if you don''t feel like talking.']),
  ('recovering-at-home', 'Recovering at Home', 'Company while you rest and mend, at whatever pace that takes.', 'quiet', 'Quiet', null, array['You are welcome to simply stay.']),
  ('grief-and-loss', 'Grief and Loss', 'A gentle room for the weight of missing someone. No need to explain.', 'quiet', 'Quiet', '00000000-0000-0000-0000-000000000002', array['No need to say anything. You are welcome to simply stay.']),
  ('new-to-the-city', 'New to the City', 'For the early, disorienting weeks somewhere unfamiliar.', 'conversation', 'Gentle Conversation', null, array['What''s one thing you''re still finding your way around?']),
  ('just-need-company', 'Just Need Company', 'No theme. Sometimes that''s exactly what''s needed.', 'quiet', 'Quiet', null, array['Come in for five minutes or stay all evening.'])
on conflict (slug) do nothing;
