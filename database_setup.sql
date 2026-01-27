-- Portfolio site database schema (full rebuild)
-- Intended for Supabase (PostgreSQL)

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper: updated_at auto-update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing tables (safe rebuild)
DROP TABLE IF EXISTS public.contact_settings CASCADE;
DROP TABLE IF EXISTS public.contact_recipients CASCADE;
DROP TABLE IF EXISTS public.hero_images CASCADE;
DROP TABLE IF EXISTS public.experiences CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.news CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;

-- Topics
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('Projects', 'Works', 'Others')),
  summary TEXT NOT NULL,
  body TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  role TEXT,
  links JSONB,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- News
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_text TEXT,
  body TEXT,
  date DATE,
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skills
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('On-sight', 'Technology', 'Business')),
  name TEXT NOT NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 5),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Experiences
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hero images
CREATE TABLE public.hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact recipients
CREATE TABLE public.contact_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact settings (singleton)
CREATE TABLE public.contact_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  template_key TEXT NOT NULL CHECK (template_key IN ('main', 'sub')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS topics_sort_order_idx ON public.topics (sort_order);
CREATE INDEX IF NOT EXISTS topics_created_at_idx ON public.topics (created_at DESC);
CREATE INDEX IF NOT EXISTS news_sort_order_idx ON public.news (sort_order);
CREATE INDEX IF NOT EXISTS news_created_at_idx ON public.news (created_at DESC);
CREATE INDEX IF NOT EXISTS skills_sort_order_idx ON public.skills (sort_order);
CREATE INDEX IF NOT EXISTS experiences_sort_order_idx ON public.experiences (sort_order);
CREATE INDEX IF NOT EXISTS hero_images_sort_order_idx ON public.hero_images (sort_order);

-- Triggers: updated_at
DROP TRIGGER IF EXISTS topics_updated_at ON public.topics;
CREATE TRIGGER topics_updated_at
BEFORE UPDATE ON public.topics
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS news_updated_at ON public.news;
CREATE TRIGGER news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS experiences_updated_at ON public.experiences;
CREATE TRIGGER experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS contact_settings_updated_at ON public.contact_settings;
CREATE TRIGGER contact_settings_updated_at
BEFORE UPDATE ON public.contact_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Allow Public Select Topics" ON public.topics;
CREATE POLICY "Allow Public Select Topics" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Select News" ON public.news;
CREATE POLICY "Allow Public Select News" ON public.news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Select Skills" ON public.skills;
CREATE POLICY "Allow Public Select Skills" ON public.skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Select Experiences" ON public.experiences;
CREATE POLICY "Allow Public Select Experiences" ON public.experiences FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Select Hero Images" ON public.hero_images;
CREATE POLICY "Allow Public Select Hero Images" ON public.hero_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Select Contact Recipients" ON public.contact_recipients;
CREATE POLICY "Allow Public Select Contact Recipients" ON public.contact_recipients FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Select Contact Settings" ON public.contact_settings;
CREATE POLICY "Allow Public Select Contact Settings" ON public.contact_settings FOR SELECT USING (true);

-- Authenticated full access
DROP POLICY IF EXISTS "Allow Authenticated All Topics" ON public.topics;
CREATE POLICY "Allow Authenticated All Topics" ON public.topics
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Authenticated All News" ON public.news;
CREATE POLICY "Allow Authenticated All News" ON public.news
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Authenticated All Skills" ON public.skills;
CREATE POLICY "Allow Authenticated All Skills" ON public.skills
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Authenticated All Experiences" ON public.experiences;
CREATE POLICY "Allow Authenticated All Experiences" ON public.experiences
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Authenticated All Hero Images" ON public.hero_images;
CREATE POLICY "Allow Authenticated All Hero Images" ON public.hero_images
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Authenticated All Contact Recipients" ON public.contact_recipients;
CREATE POLICY "Allow Authenticated All Contact Recipients" ON public.contact_recipients
FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Authenticated All Contact Settings" ON public.contact_settings;
CREATE POLICY "Allow Authenticated All Contact Settings" ON public.contact_settings
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket (public images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow Public Select Images Bucket" ON storage.objects;
CREATE POLICY "Allow Public Select Images Bucket" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Allow Authenticated All Images Bucket" ON storage.objects;
CREATE POLICY "Allow Authenticated All Images Bucket" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

COMMIT;
