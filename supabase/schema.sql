-- =========================================================================
-- Urban Air Quality Assistant — Supabase Database Schema
-- Includes PostgreSQL tables, pgvector embeddings for RAG, and Row Level Security (RLS)
-- =========================================================================

-- Enable pgvector extension for RAG embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  city TEXT DEFAULT 'Delhi',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Household Profiles (Optional & Consent-Driven)
CREATE TABLE IF NOT EXISTS public.household_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  home_type TEXT CHECK (home_type IN ('apartment', 'independent_house', 'other')),
  area_sqm NUMERIC,
  occupants INT DEFAULT 1,
  cooking_fuel TEXT CHECK (cooking_fuel IN ('lpg', 'png', 'induction', 'electric', 'biomass')),
  ventilation_type TEXT CHECK (ventilation_type IN ('windows', 'mechanical', 'both', 'none')),
  has_purifier BOOLEAN DEFAULT FALSE,
  purifier_cadr NUMERIC,
  budget_category TEXT CHECK (budget_category IN ('low', 'medium', 'high')),
  health_data_consent BOOLEAN DEFAULT FALSE,
  vulnerable_groups TEXT[], -- only saved if consent is true
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Monitoring Stations & AQI Readings
CREATE TABLE IF NOT EXISTS public.monitoring_stations (
  id TEXT PRIMARY KEY, -- e.g. 'cpcb-anand-vihar'
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  operator TEXT DEFAULT 'CPCB',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aqi_readings (
  id BIGSERIAL PRIMARY KEY,
  station_id TEXT REFERENCES public.monitoring_stations(id) ON DELETE CASCADE,
  measured_at TIMESTAMPTZ NOT NULL,
  aqi INT NOT NULL,
  category TEXT NOT NULL,
  dominant_pollutant TEXT NOT NULL,
  pm25 NUMERIC,
  pm10 NUMERIC,
  no2 NUMERIC,
  so2 NUMERIC,
  co NUMERIC,
  o3 NUMERIC,
  source TEXT DEFAULT 'CPCB',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aqi_readings_station_time ON public.aqi_readings(station_id, measured_at DESC);

-- 4. Completed Planner Actions
CREATE TABLE IF NOT EXISTS public.completed_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  action_title TEXT NOT NULL,
  period TEXT CHECK (period IN ('morning', 'afternoon', 'evening', 'night')),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sustainable Commute & Activity Logs (Impact Tracker)
CREATE TABLE IF NOT EXISTS public.sustainable_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- e.g., 'metro_commute', 'induction_cooking'
  baseline_mode TEXT,
  chosen_mode TEXT,
  distance_km NUMERIC,
  saved_kg_co2e NUMERIC NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Research & Scientific Knowledge Base (with pgvector for RAG)
CREATE TABLE IF NOT EXISTS public.evidence_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  published_date DATE,
  url TEXT NOT NULL,
  summary TEXT NOT NULL,
  applicability TEXT,
  evidence_type TEXT,
  content TEXT,
  embedding vector(768), -- Dimensions matching Gemini or OpenAI embeddings
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search function for pgvector similarity
CREATE OR REPLACE FUNCTION match_evidence_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id TEXT,
  title TEXT,
  issuer TEXT,
  summary TEXT,
  url TEXT,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    evidence_documents.id,
    evidence_documents.title,
    evidence_documents.issuer,
    evidence_documents.summary,
    evidence_documents.url,
    1 - (evidence_documents.embedding <=> query_embedding) AS similarity
  FROM evidence_documents
  WHERE 1 - (evidence_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- 7. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sustainable_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aqi_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_documents ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Household Profiles: Users can view, insert and update own household
CREATE POLICY "Users can view own household" ON public.household_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own household" ON public.household_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own household" ON public.household_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own household" ON public.household_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Completed Actions: User isolation
CREATE POLICY "Users can manage own completed actions" ON public.completed_actions
  FOR ALL USING (auth.uid() = user_id);

-- Sustainable Activities: User isolation
CREATE POLICY "Users can manage own sustainable activities" ON public.sustainable_activities
  FOR ALL USING (auth.uid() = user_id);

-- Public Data: Anyone can view station readings and research evidence
CREATE POLICY "Public read monitoring stations" ON public.monitoring_stations
  FOR SELECT USING (true);

CREATE POLICY "Public read aqi readings" ON public.aqi_readings
  FOR SELECT USING (true);

CREATE POLICY "Public read evidence documents" ON public.evidence_documents
  FOR SELECT USING (true);

