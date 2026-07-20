-- Custom SQL migration file, put your code below! --
INSERT INTO event_config (name, event_start, event_length, site_active) VALUES ('config', NOW(), 7, false) ON CONFLICT (name) DO NOTHING;