-- PostgreSQL Schema: Diagnostic Alerts and Remedial Lessons Telemetry
-- Used by Edaad's Multi-Agent diagnostic layer to store detected struggle states.

CREATE TABLE IF NOT EXISTS public.remedial_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL, -- References auth.users(id) / user_profiles(id)
    course_id UUID NOT NULL, -- References courses(id)
    struggle_concept TEXT NOT NULL, -- The specific pedagogical concept the student struggled with
    remedial_lesson_id UUID, -- Link to generated remedial course lesson
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'GENERATED', 'ASSIGNED', 'RESOLVED')),
    diagnostic_confidence NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index optimization
CREATE INDEX IF NOT EXISTS idx_remedial_student ON public.remedial_alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_remedial_status ON public.remedial_alerts(status);

-- Enable Supabase Realtime replication for the teacher monitoring dashboard
-- This replication publishes insert/update events directly to the teacher's live UI.
ALTER publication supabase_realtime ADD TABLE public.remedial_alerts;

COMMENT ON TABLE public.remedial_alerts IS 'Stores diagnostic alerts and telemetry triggered by the Edaad Diagnostic AI Agent to alert teachers.';
