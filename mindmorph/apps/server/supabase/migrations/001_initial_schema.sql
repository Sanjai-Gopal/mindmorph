CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  cognitive_profile JSONB DEFAULT '{
    "learning_style": null,
    "attention_span_minutes": 25,
    "peak_focus_hours": ["09:00", "11:00", "15:00"],
    "procrastination_triggers": [],
    "engagement_vector": []
  }',
  gamification JSONB DEFAULT '{
    "xp": 0,
    "level": 1,
    "streak": 0,
    "longest_streak": 0,
    "achievements": [],
    "last_active_date": null
  }',
  preferences JSONB DEFAULT '{
    "theme": "system",
    "notifications": true,
    "sound_effects": true,
    "break_reminders": true
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT,
  duration_seconds INTEGER DEFAULT 0,
  engagement_score FLOAT DEFAULT 0,
  emotional_snapshots JSONB[] DEFAULT ARRAY[]::JSONB[],
  behavior_metrics JSONB DEFAULT '{
    "typing_speed_wpm": 0,
    "scroll_depth": 0,
    "tab_switches": 0,
    "idle_seconds": 0,
    "click_frequency": 0
  }',
  content_format TEXT DEFAULT 'original',
  intervention_applied BOOLEAN DEFAULT false,
  intervention_type TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  transformed_content TEXT NOT NULL,
  format TEXT NOT NULL,
  subject TEXT,
  topics_extracted TEXT[],
  quality_score FLOAT DEFAULT 0,
  user_rating INTEGER,
  used_in_session UUID REFERENCES study_sessions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  weight FLOAT DEFAULT 1.0,
  mapped_concepts TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  focus_level INTEGER CHECK (focus_level BETWEEN 1 AND 10),
  notes TEXT,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_study_sessions_user ON study_sessions(user_id, started_at);
CREATE INDEX idx_study_sessions_engagement ON study_sessions(engagement_score);
CREATE INDEX idx_mood_logs_user ON daily_mood_logs(user_id, logged_at);
CREATE INDEX idx_transformations_user ON content_transformations(user_id, created_at);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can read own sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own transformations" ON content_transformations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transformations" ON content_transformations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own interests" ON user_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can read own mood logs" ON daily_mood_logs FOR SELECT USING (auth.uid() = user_id);

-- Function to update profile updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Automatic profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable real-time for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE study_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_mood_logs;
