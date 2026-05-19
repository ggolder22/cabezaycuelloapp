-- ============================================================
-- SCHEMA: Clínica Cabeza y Cuello
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLA: usuarios (extiende auth.users de Supabase)
-- ============================================================
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  primer_nombre TEXT NOT NULL,
  segundo_nombre TEXT,
  primer_apellido TEXT NOT NULL,
  segundo_apellido TEXT,
  rol TEXT NOT NULL CHECK (rol IN (
    'admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello',
    'fonoaudiologo', 'radiologo', 'patologo', 'odontólogo_maxilofacial',
    'enfermero', 'recepcionista'
  )),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECUENCIA y FUNCIÓN: número de historia único
-- Formato: HCC-2026-00001
-- ============================================================
CREATE SEQUENCE historia_seq START 1;

CREATE OR REPLACE FUNCTION generar_numero_historia()
RETURNS TRIGGER AS $$
BEGIN
  NEW.numero_historia := 'HCC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('historia_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: pacientes
-- ============================================================
CREATE TABLE public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_historia TEXT UNIQUE NOT NULL DEFAULT '',
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('CC','CE','PA','RC','TI','NIT')),
  numero_documento TEXT NOT NULL,
  primer_nombre TEXT NOT NULL,
  segundo_nombre TEXT,
  primer_apellido TEXT NOT NULL,
  segundo_apellido TEXT,
  fecha_nacimiento DATE NOT NULL,
  sexo CHAR(1) NOT NULL CHECK (sexo IN ('M','F','O')),
  telefono TEXT,
  celular TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  departamento TEXT,
  eps TEXT,
  tipo_afiliacion TEXT CHECK (tipo_afiliacion IN ('contributivo','subsidiado','vinculado','particular')),
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tipo_documento, numero_documento)
);

CREATE TRIGGER trg_numero_historia
  BEFORE INSERT ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION generar_numero_historia();

-- ============================================================
-- TABLA: historias_clinicas
-- ============================================================
CREATE TABLE public.historias_clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  medico_id UUID NOT NULL REFERENCES public.usuarios(id),
  fecha_consulta TIMESTAMPTZ NOT NULL DEFAULT now(),
  motivo_consulta TEXT NOT NULL,
  enfermedad_actual TEXT NOT NULL,
  antecedentes_personales TEXT,
  antecedentes_familiares TEXT,
  revision_sistemas TEXT,
  examen_fisico TEXT,
  diagnostico_principal TEXT NOT NULL,
  diagnosticos_secundarios TEXT,
  cie10_principal TEXT,
  plan_tratamiento TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: citas
-- ============================================================
CREATE TABLE public.citas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  medico_id UUID NOT NULL REFERENCES public.usuarios(id),
  fecha_hora TIMESTAMPTZ NOT NULL,
  duracion_minutos INT NOT NULL DEFAULT 30,
  tipo_consulta TEXT NOT NULL CHECK (tipo_consulta IN ('primera_vez','control','procedimiento','urgencia')),
  estado TEXT NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada','confirmada','en_curso','completada','cancelada','no_asistio')),
  motivo TEXT,
  notas TEXT,
  creado_por UUID REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: archivos_clinicos
-- ============================================================
CREATE TABLE public.archivos_clinicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  historia_id UUID REFERENCES public.historias_clinicas(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('imagen_diagnostica','laboratorio','biopsia','informe','consentimiento','otro')),
  formato TEXT NOT NULL,
  url TEXT NOT NULL,
  subido_por UUID NOT NULL REFERENCES public.usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: audit_log (trazabilidad completa)
-- ============================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla TEXT NOT NULL,
  registro_id TEXT NOT NULL,
  accion TEXT NOT NULL CHECK (accion IN ('INSERT','UPDATE','DELETE')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES public.usuarios(id),
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- FUNCIÓN + TRIGGERS: audit automático
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (tabla, registro_id, accion, datos_anteriores, datos_nuevos)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_pacientes
  AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_historias_clinicas
  AFTER INSERT OR UPDATE OR DELETE ON public.historias_clinicas
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

CREATE TRIGGER audit_citas
  AFTER INSERT OR UPDATE OR DELETE ON public.citas
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();

-- ============================================================
-- updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updated_at_usuarios BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER updated_at_pacientes BEFORE UPDATE ON public.pacientes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER updated_at_historias BEFORE UPDATE ON public.historias_clinicas FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER updated_at_citas BEFORE UPDATE ON public.citas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historias_clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archivos_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Usuarios: solo pueden ver su propio perfil (admin ve todos)
CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT USING (
    id = auth.uid() OR
    (SELECT rol FROM public.usuarios WHERE id = auth.uid()) = 'admin'
  );

-- Pacientes: cualquier usuario autenticado puede ver (RLS más fino por rol se agrega después)
CREATE POLICY "pacientes_select" ON public.pacientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pacientes_insert" ON public.pacientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "pacientes_update" ON public.pacientes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Historia clínica: solo usuarios clínicos
CREATE POLICY "historias_select" ON public.historias_clinicas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "historias_insert" ON public.historias_clinicas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Citas: todos los usuarios autenticados
CREATE POLICY "citas_select" ON public.citas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "citas_insert" ON public.citas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "citas_update" ON public.citas
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Archivos
CREATE POLICY "archivos_select" ON public.archivos_clinicos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "archivos_insert" ON public.archivos_clinicos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Audit log: solo admin puede leer
CREATE POLICY "audit_select" ON public.audit_log
  FOR SELECT USING (
    (SELECT rol FROM public.usuarios WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================
-- Storage bucket para imágenes clínicas
-- ============================================================
-- Ejecutar en Supabase Storage:
-- Crear bucket 'imagenes-clinicas' (privado)
-- Crear bucket 'documentos-clinicos' (privado)
