-- ============================================================
-- MIGRACIÓN: Campos de Planilla de Ingreso
-- Ejecutar en Supabase SQL Editor DESPUÉS del schema inicial
-- ============================================================

ALTER TABLE public.pacientes
  -- Sección 1 — Datos filiatorios
  ADD COLUMN IF NOT EXISTS tipo_derivacion TEXT CHECK (tipo_derivacion IN ('espontanea','imagenes','interconsulta','urgencias')),
  ADD COLUMN IF NOT EXISTS motivo_consulta TEXT,

  -- Sección 2 — Antecedentes
  ADD COLUMN IF NOT EXISTS antecedentes_oncologicos BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS antecedentes_oncologicos_detalle TEXT,
  ADD COLUMN IF NOT EXISTS antecedentes_quirurgicos BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS antecedentes_quirurgicos_detalle TEXT,
  ADD COLUMN IF NOT EXISTS comorbilidades TEXT,
  ADD COLUMN IF NOT EXISTS medicacion_impacto TEXT,
  ADD COLUMN IF NOT EXISTS alergias BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS alergias_detalle TEXT,

  -- Sección 3 — Examen clínico
  ADD COLUMN IF NOT EXISTS estado_general TEXT CHECK (estado_general IN ('conservado','regular','comprometido')),
  ADD COLUMN IF NOT EXISTS signos_alarma BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signos_alarma_detalle TEXT,
  ADD COLUMN IF NOT EXISTS observaciones_ingreso TEXT,

  -- Sección 4 — Circuito asistencial
  -- Estructura: [{"nombre":"Dr. X","especialidad":"...","tipo":"urgente|programado"}]
  ADD COLUMN IF NOT EXISTS derivaciones JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Actualizar el CHECK de roles para los nuevos roles
ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_rol_check CHECK (rol IN (
    'admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello',
    'fonoaudiologo', 'radiologo', 'patologo', 'maxilofacial',
    'orl', 'endocrinologo', 'estomatologo', 'cirujano_general',
    'enfermero', 'recepcionista'
  ));

-- Agregar DNI al CHECK de tipo_documento
ALTER TABLE public.pacientes
  DROP CONSTRAINT IF EXISTS pacientes_tipo_documento_check;

ALTER TABLE public.pacientes
  ADD CONSTRAINT pacientes_tipo_documento_check
  CHECK (tipo_documento IN ('CC','CE','DNI','PA','RC','TI','NIT'));
