-- ================================================================
-- Migración: evoluciones + matrícula profesional
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- 1. Agregar número de matrícula a usuarios
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS numero_matricula TEXT;

-- 2. Tabla de evoluciones / registro de procedimientos
CREATE TABLE IF NOT EXISTS public.evoluciones (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      UUID        NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id        UUID        NOT NULL REFERENCES public.usuarios(id),
  fecha            TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo             TEXT        NOT NULL DEFAULT 'nota'
                               CHECK (tipo IN ('nota','consulta','procedimiento','orden','resultado','interconsulta')),
  descripcion      TEXT        NOT NULL,
  diagnostico      TEXT,
  numero_matricula TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índice para búsquedas por paciente
CREATE INDEX IF NOT EXISTS evoluciones_paciente_idx
  ON public.evoluciones (paciente_id, fecha DESC);

-- 4. RLS
ALTER TABLE public.evoluciones ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer evoluciones
CREATE POLICY "evoluciones_select"
  ON public.evoluciones FOR SELECT
  TO authenticated
  USING (true);

-- Solo el médico autor puede insertar (medico_id = usuario actual)
CREATE POLICY "evoluciones_insert"
  ON public.evoluciones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = medico_id);

-- El médico solo puede editar sus propias entradas
CREATE POLICY "evoluciones_update"
  ON public.evoluciones FOR UPDATE
  TO authenticated
  USING (auth.uid() = medico_id);
