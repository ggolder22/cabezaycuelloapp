import type { RolUsuario } from '@/types'

export const ROLES: Record<RolUsuario, { label: string; especialidad: string; color: string }> = {
  admin: {
    label: 'Administrador',
    especialidad: 'Administración del sistema',
    color: 'bg-slate-100 text-slate-800',
  },
  medico_especialista: {
    label: 'Médico Especialista',
    especialidad: 'Especialista general',
    color: 'bg-red-50 text-red-800',
  },
  oncologo: {
    label: 'Oncólogo',
    especialidad: 'Oncología',
    color: 'bg-purple-100 text-purple-800',
  },
  cirujano_cabeza_cuello: {
    label: 'Cirujano Cabeza y Cuello',
    especialidad: 'Cirugía de Cabeza y Cuello',
    color: 'bg-red-100 text-red-800',
  },
  fonoaudiologo: {
    label: 'Fonoaudiólogo',
    especialidad: 'Fonoaudiología',
    color: 'bg-green-100 text-green-800',
  },
  radiologo: {
    label: 'Radiólogo / Imágenes',
    especialidad: 'Diagnóstico por Imágenes',
    color: 'bg-cyan-100 text-cyan-800',
  },
  patologo: {
    label: 'Patólogo',
    especialidad: 'Patología',
    color: 'bg-orange-100 text-orange-800',
  },
  maxilofacial: {
    label: 'Cirujano Maxilofacial',
    especialidad: 'Cirugía Maxilofacial',
    color: 'bg-yellow-100 text-yellow-800',
  },
  orl: {
    label: 'ORL',
    especialidad: 'Otorrinolaringología',
    color: 'bg-blue-100 text-blue-800',
  },
  endocrinologo: {
    label: 'Endocrinólogo',
    especialidad: 'Endocrinología',
    color: 'bg-teal-100 text-teal-800',
  },
  estomatologo: {
    label: 'Estomatólogo',
    especialidad: 'Estomatología',
    color: 'bg-pink-100 text-pink-800',
  },
  cirujano_general: {
    label: 'Cirujano General',
    especialidad: 'Cirugía General / Trauma',
    color: 'bg-indigo-100 text-indigo-800',
  },
  enfermero: {
    label: 'Enfermero/a',
    especialidad: 'Enfermería',
    color: 'bg-sky-100 text-sky-800',
  },
  recepcionista: {
    label: 'Recepcionista',
    especialidad: 'Admisión y Recepción',
    color: 'bg-gray-100 text-gray-800',
  },
}

// Especialistas del circuito asistencial (planilla de ingreso)
export const ESPECIALISTAS_CIRCUITO = [
  { nombre: 'Dr. Gabriel Navarta', especialidad: 'Cirugía de Cabeza y Cuello' },
  { nombre: 'Dr. Orlando Rodríguez', especialidad: 'ORL' },
  { nombre: 'Dra. Nadia Ruiz', especialidad: 'Maxilofacial' },
  { nombre: 'Dr. Carlos Penizzotto', especialidad: 'Maxilofacial' },
  { nombre: 'Dr. Leonel Argumoza', especialidad: 'Cirugía General / Trauma' },
  { nombre: 'Dra. Fernanda Ponce', especialidad: 'Estomatología' },
  { nombre: 'Dra. Alejandra Castuma', especialidad: 'Endocrinología' },
  { nombre: 'Dra. Maira Orozco', especialidad: 'Diagnóstico por Imágenes' },
  { nombre: 'Dr. Gabriel Agüero', especialidad: 'Oncología' },
] as const

export const PERMISOS = {
  pacientes: {
    ver: ['admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello', 'fonoaudiologo', 'radiologo', 'patologo', 'maxilofacial', 'orl', 'endocrinologo', 'estomatologo', 'cirujano_general', 'enfermero', 'recepcionista'],
    crear: ['admin', 'recepcionista', 'medico_especialista', 'enfermero'],
    editar: ['admin', 'medico_especialista', 'recepcionista'],
    eliminar: ['admin'],
  },
  historia_clinica: {
    ver: ['admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello', 'fonoaudiologo', 'radiologo', 'patologo', 'maxilofacial', 'orl', 'endocrinologo', 'estomatologo', 'cirujano_general', 'enfermero'],
    crear: ['admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello', 'fonoaudiologo', 'patologo', 'maxilofacial', 'orl', 'endocrinologo', 'estomatologo', 'cirujano_general'],
    editar: ['admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello'],
    eliminar: ['admin'],
  },
  agenda: {
    ver: ['admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello', 'fonoaudiologo', 'radiologo', 'patologo', 'maxilofacial', 'orl', 'endocrinologo', 'estomatologo', 'cirujano_general', 'enfermero', 'recepcionista'],
    crear: ['admin', 'recepcionista', 'medico_especialista', 'enfermero'],
    editar: ['admin', 'recepcionista', 'medico_especialista'],
    eliminar: ['admin', 'recepcionista'],
  },
  imagenes: {
    ver: ['admin', 'medico_especialista', 'oncologo', 'cirujano_cabeza_cuello', 'radiologo', 'patologo', 'maxilofacial', 'orl'],
    subir: ['admin', 'medico_especialista', 'oncologo', 'radiologo', 'enfermero'],
    eliminar: ['admin'],
  },
  admin: {
    ver: ['admin'],
    gestionar: ['admin'],
  },
} as const satisfies Record<string, Record<string, string[]>>

export type Modulo = keyof typeof PERMISOS

export function tienePermiso(rol: RolUsuario, modulo: Modulo, accion: string): boolean {
  const permisos = PERMISOS[modulo]
  if (!permisos || !(accion in permisos)) return false
  return (permisos[accion as keyof typeof permisos] as string[]).includes(rol)
}
