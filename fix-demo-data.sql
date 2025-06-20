-- Insert demo teams with numeric IDs
INSERT INTO teams (id, name, description, created_at, updated_at) 
VALUES 
  ('1', 'Demo Basketball Team', 'Demo team for testing the application', NOW(), NOW()),
  ('2', 'Demo Team Two', 'Second demo team for testing', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert demo players with numeric IDs
INSERT INTO player_profiles (id, name, number, position, team_id, coach_id, attributes, created_at, updated_at) 
VALUES 
  ('1', 'John Smith', 1, 'PG', '1', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), '{"speed": 85, "size": 70, "shooting": 80, "ballHandling": 90, "defense": 75, "rebounding": 65}', NOW(), NOW()),
  ('2', 'Jane Doe', 2, 'SG', '1', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), '{"speed": 80, "size": 75, "shooting": 90, "ballHandling": 80, "defense": 70, "rebounding": 60}', NOW(), NOW()),
  ('3', 'Sam Johnson', 3, 'SF', '1', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), '{"speed": 75, "size": 85, "shooting": 75, "ballHandling": 65, "defense": 85, "rebounding": 80}', NOW(), NOW()),
  ('4', 'Chris Brown', 4, 'PF', '1', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), '{"speed": 65, "size": 90, "shooting": 60, "ballHandling": 50, "defense": 90, "rebounding": 95}', NOW(), NOW()),
  ('5', 'Alex Davis', 5, 'C', '1', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), '{"speed": 50, "size": 95, "shooting": 55, "ballHandling": 40, "defense": 95, "rebounding": 100}', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  number = EXCLUDED.number,
  position = EXCLUDED.position,
  attributes = EXCLUDED.attributes,
  updated_at = NOW();

-- Insert demo game plans with numeric IDs
INSERT INTO game_plans (id, title, description, opponent, defense_type, created_by_id, created_at, updated_at) 
VALUES 
  ('1', 'vs Lakers Game Plan', 'Game plan for upcoming game against Lakers', 'Lakers', 'Zone', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), NOW(), NOW()),
  ('2', 'vs Warriors Game Plan', 'Game plan for upcoming game against Warriors', 'Warriors', 'Man', (SELECT id FROM users WHERE email = 'coach@demo.com' LIMIT 1), NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  opponent = EXCLUDED.opponent,
  defense_type = EXCLUDED.defense_type,
  updated_at = NOW();

-- Display results
SELECT 'Teams:' as type, id, name FROM teams WHERE id IN ('1', '2')
UNION ALL
SELECT 'Players:' as type, id, name FROM player_profiles WHERE id IN ('1', '2', '3', '4', '5')
UNION ALL
SELECT 'GamePlans:' as type, id, title as name FROM game_plans WHERE id IN ('1', '2');