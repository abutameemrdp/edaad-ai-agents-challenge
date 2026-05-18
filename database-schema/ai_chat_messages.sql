-- PostgreSQL Schema: persistent Socratic AI chat history
CREATE TABLE IF NOT EXISTS public.ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id) in production
    course_id UUID, -- References courses(id)
    lesson_id TEXT, -- The target lesson ID
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL, -- Conversation content in Arabic
    is_global BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index optimization for real-time history retrieval
CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON public.ai_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_course ON public.ai_chat_messages(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_created_at ON public.ai_chat_messages(created_at);

-- Row Level Security (RLS) policies for user data isolation
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat history"
ON public.ai_chat_messages
FOR ALL
USING (auth.uid() = user_id);
