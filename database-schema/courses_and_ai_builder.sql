-- PostgreSQL Schema: Courses and Smart Course Generator Drafts
-- Shows how Edaad's Smart AI Agent (Smart Course Generator) generates, drafts, and publishes curricula.

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title JSONB NOT NULL, -- Multilingual Arabic/English title (e.g. {"ar": "التربية الإسلامية", "en": "Islamic Studies"})
    description JSONB, -- Multilingual Arabic/English description
    modules JSONB DEFAULT '[]'::jsonb, -- Structured JSON array of modules, lessons, questions, and 3D labs
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_ai_builder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Teacher/creator UUID
    topic TEXT NOT NULL, -- Prompt used to generate the course
    source_type TEXT NOT NULL DEFAULT 'pdf' CHECK (source_type IN ('pdf', 'youtube', 'web')),
    schedule_data JSONB DEFAULT '{}'::jsonb, -- Holds generated curriculum schedule and references to linked courses
    is_generated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing for lookup speed
CREATE INDEX IF NOT EXISTS idx_course_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_ai_builder_user ON public.course_ai_builder(user_id);
