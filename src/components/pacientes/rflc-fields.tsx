'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'

// ── Types ────────────────────────────────────────────────────────────────────

interface RFLCState {
  // Meta
  endoscopio: string
  anestesia_topica: string
  tolerancia: string
  // Exploración nasal
  fosas_nasales: string[]
  cornetes: string[]
  tabique: string[]
  lesiones_nasales: string
  lesiones_nasales_detalle: string
  // Nasofaringe
  visualizacion: string
  mucosa_nasofaringe: string[]
  amigdala_faringea: string
  orificios_tubaricos: string
  secreciones_nasofaringe: string
  secreciones_nasofaringe_detalle: string
  // Orofaringe y laringe
  paladar: string[]
  pared_posterior: string[]
  epiglotis: string[]
  bandas_ventriculares: string[]
  cv_movilidad: string
  cv_bordes: string[]
  cv_coloracion: string
  glotis: string[]
  subglotis: string
  subglotis_detalle: string
  // Conclusión
  hallazgos: string
  impresion_diagnostica: string
  conducta: string
}

const EMPTY: RFLCState = {
  endoscopio: '', anestesia_topica: '', tolerancia: '',
  fosas_nasales: [], cornetes: [], tabique: [],
  lesiones_nasales: '', lesiones_nasales_detalle: '',
  visualizacion: '', mucosa_nasofaringe: [],
  amigdala_faringea: '', orificios_tubaricos: '',
  secreciones_nasofaringe: '', secreciones_nasofaringe_detalle: '',
  paladar: [], pared_posterior: [], epiglotis: [], bandas_ventriculares: [],
  cv_movilidad: '', cv_bordes: [], cv_coloracion: '',
  glotis: [], subglotis: '', subglotis_detalle: '',
  hallazgos: '', impresion_diagnostica: '', conducta: '',
}

// ── Report generator ─────────────────────────────────────────────────────────

function buildReport(s: RFLCState): string {
  const L: string[] = ['INFORME RINOFIBROLARINGOSCOPÍA', '']

  const meta = [
    s.endoscopio && `Endoscopio: ${s.endoscopio}`,
    s.anestesia_topica && `Anestesia tópica: ${s.anestesia_topica}`,
    s.tolerancia && `Tolerancia: ${s.tolerancia}`,
  ].filter(Boolean)
  if (meta.length) { L.push(meta.join(' | ')); L.push('') }

  L.push('── EXPLORACIÓN NASAL ──')
  if (s.fosas_nasales.length) L.push(`Fosas nasales: ${s.fosas_nasales.join(', ')}`)
  if (s.cornetes.length) L.push(`Cornetes: ${s.cornetes.join(', ')}`)
  if (s.tabique.length) L.push(`Tabique nasal: ${s.tabique.join(', ')}`)
  if (s.lesiones_nasales) L.push(`Lesiones/pólipos/masas: ${s.lesiones_nasales}${s.lesiones_nasales === 'Sí' && s.lesiones_nasales_detalle ? ` → ${s.lesiones_nasales_detalle}` : ''}`)
  L.push('')

  L.push('── NASOFARINGE ──')
  if (s.visualizacion) L.push(`Visualización: ${s.visualizacion}`)
  if (s.mucosa_nasofaringe.length) L.push(`Mucosa: ${s.mucosa_nasofaringe.join(', ')}`)
  if (s.amigdala_faringea) L.push(`Amígdala faríngea: ${s.amigdala_faringea}`)
  if (s.orificios_tubaricos) L.push(`Orificios tubáricos: ${s.orificios_tubaricos}`)
  if (s.secreciones_nasofaringe) L.push(`Secreciones: ${s.secreciones_nasofaringe}${s.secreciones_nasofaringe === 'Sí' && s.secreciones_nasofaringe_detalle ? ` → ${s.secreciones_nasofaringe_detalle}` : ''}`)
  L.push('')

  L.push('── OROFARINGE Y LARINGE ──')
  if (s.paladar.length) L.push(`Paladar blando/úvula: ${s.paladar.join(', ')}`)
  if (s.pared_posterior.length) L.push(`Pared posterior faríngea: ${s.pared_posterior.join(', ')}`)
  if (s.epiglotis.length) L.push(`Epiglotis: ${s.epiglotis.join(', ')}`)
  if (s.bandas_ventriculares.length) L.push(`Bandas ventriculares: ${s.bandas_ventriculares.join(', ')}`)
  if (s.cv_movilidad || s.cv_bordes.length || s.cv_coloracion) {
    L.push('Cuerdas vocales:')
    if (s.cv_movilidad) L.push(`  Movilidad: ${s.cv_movilidad}`)
    if (s.cv_bordes.length) L.push(`  Bordes libres: ${s.cv_bordes.join(', ')}`)
    if (s.cv_coloracion) L.push(`  Coloración: ${s.cv_coloracion}`)
  }
  if (s.glotis.length) L.push(`Glotis: ${s.glotis.join(', ')}`)
  if (s.subglotis) L.push(`Subglotis/tráquea proximal: ${s.subglotis}${s.subglotis === 'Alteraciones' && s.subglotis_detalle ? ` → ${s.subglotis_detalle}` : ''}`)
  L.push('')

  L.push('── CONCLUSIÓN ──')
  if (s.hallazgos) L.push(`Hallazgos: ${s.hallazgos}`)
  if (s.impresion_diagnostica) L.push(`Impresión diagnóstica: ${s.impresion_diagnostica}`)
  if (s.conducta) L.push(`Conducta/recomendaciones: ${s.conducta}`)

  return L.join('\n')
}

// ── UI helpers ───────────────────────────────────────────────────────────────

const PILL_BASE = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs cursor-pointer select-none transition-colors'
const PILL_OFF = `${PILL_BASE} border-slate-200 bg-white text-slate-600 hover:bg-slate-50`
const PILL_ON = `${PILL_BASE} border-blue-400 bg-blue-50 text-blue-700 font-medium`

function MultiCheck({
  selected, options, onChange,
}: { selected: string[]; options: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(o => o !== opt) : [...selected, opt])
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)}
          className={selected.includes(opt) ? PILL_ON : PILL_OFF}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function RadioCheck({
  selected, options, onChange,
}: { selected: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button key={opt} type="button"
          onClick={() => onChange(selected === opt ? '' : opt)}
          className={selected === opt ? PILL_ON : PILL_OFF}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b pb-1">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      {children}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function RFLCFields({ onChange }: { onChange: (text: string) => void }) {
  const [s, setS] = useState<RFLCState>(EMPTY)

  const up = useCallback(<K extends keyof RFLCState>(field: K, value: RFLCState[K]) => {
    setS(prev => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    onChange(buildReport(s))
  }, [s, onChange])

  return (
    <div className="space-y-5 py-2">

      {/* Meta */}
      <Section title="Datos del procedimiento">
        <Row label="Endoscopio">
          <RadioCheck selected={s.endoscopio} options={['Flexible', 'Rígido']}
            onChange={v => up('endoscopio', v)} />
        </Row>
        <Row label="Anestesia tópica">
          <RadioCheck selected={s.anestesia_topica} options={['Sí', 'No']}
            onChange={v => up('anestesia_topica', v)} />
        </Row>
        <Row label="Tolerancia">
          <RadioCheck selected={s.tolerancia} options={['Buena', 'Regular', 'Mala']}
            onChange={v => up('tolerancia', v)} />
        </Row>
      </Section>

      {/* Exploración nasal */}
      <Section title="Exploración nasal">
        <Row label="Fosas nasales">
          <MultiCheck selected={s.fosas_nasales} options={['Permeables', 'Congestión', 'Secreciones', 'Costras']}
            onChange={v => up('fosas_nasales', v)} />
        </Row>
        <Row label="Cornetes">
          <MultiCheck selected={s.cornetes} options={['Normales', 'Hipertrofia', 'Contacto']}
            onChange={v => up('cornetes', v)} />
        </Row>
        <Row label="Tabique nasal">
          <MultiCheck selected={s.tabique} options={['Centrado', 'Desviado', 'Espolón']}
            onChange={v => up('tabique', v)} />
        </Row>
        <Row label="Lesiones / pólipos / masas">
          <RadioCheck selected={s.lesiones_nasales} options={['No', 'Sí']}
            onChange={v => up('lesiones_nasales', v)} />
          {s.lesiones_nasales === 'Sí' && (
            <Input className="mt-1.5 h-8 text-xs" placeholder="Describir lesiones..."
              value={s.lesiones_nasales_detalle}
              onChange={e => up('lesiones_nasales_detalle', e.target.value)} />
          )}
        </Row>
      </Section>

      {/* Nasofaringe */}
      <Section title="Nasofaringe">
        <Row label="Visualización">
          <RadioCheck selected={s.visualizacion} options={['Completa', 'Parcial']}
            onChange={v => up('visualizacion', v)} />
        </Row>
        <Row label="Mucosa">
          <MultiCheck selected={s.mucosa_nasofaringe} options={['Normal', 'Hiperemia', 'Edema']}
            onChange={v => up('mucosa_nasofaringe', v)} />
        </Row>
        <Row label="Amígdala faríngea">
          <RadioCheck selected={s.amigdala_faringea} options={['Normal', 'Hipertrófica']}
            onChange={v => up('amigdala_faringea', v)} />
        </Row>
        <Row label="Orificios tubáricos">
          <RadioCheck selected={s.orificios_tubaricos} options={['Normales', 'Alterados']}
            onChange={v => up('orificios_tubaricos', v)} />
        </Row>
        <Row label="Secreciones">
          <RadioCheck selected={s.secreciones_nasofaringe} options={['No', 'Sí']}
            onChange={v => up('secreciones_nasofaringe', v)} />
          {s.secreciones_nasofaringe === 'Sí' && (
            <Input className="mt-1.5 h-8 text-xs" placeholder="Describir secreciones..."
              value={s.secreciones_nasofaringe_detalle}
              onChange={e => up('secreciones_nasofaringe_detalle', e.target.value)} />
          )}
        </Row>
      </Section>

      {/* Orofaringe y laringe */}
      <Section title="Orofaringe y laringe">
        <Row label="Paladar blando / úvula">
          <MultiCheck selected={s.paladar} options={['Normal', 'Asimetría', 'Disfunción']}
            onChange={v => up('paladar', v)} />
        </Row>
        <Row label="Pared posterior faríngea">
          <MultiCheck selected={s.pared_posterior} options={['Normal', 'Hiperemia', 'Secreciones']}
            onChange={v => up('pared_posterior', v)} />
        </Row>
        <Row label="Epiglotis">
          <MultiCheck selected={s.epiglotis} options={['Normal', 'Edema', 'Forma anómala']}
            onChange={v => up('epiglotis', v)} />
        </Row>
        <Row label="Bandas ventriculares">
          <MultiCheck selected={s.bandas_ventriculares} options={['Normales', 'Hipertróficas', 'Lesiones']}
            onChange={v => up('bandas_ventriculares', v)} />
        </Row>
        <Row label="Cuerdas vocales — Movilidad">
          <RadioCheck selected={s.cv_movilidad} options={['Normal', 'Limitada', 'Parálisis']}
            onChange={v => up('cv_movilidad', v)} />
        </Row>
        <Row label="Cuerdas vocales — Bordes libres">
          <MultiCheck selected={s.cv_bordes} options={['Normales', 'Engrosamiento', 'Lesiones']}
            onChange={v => up('cv_bordes', v)} />
        </Row>
        <Row label="Cuerdas vocales — Coloración">
          <RadioCheck selected={s.cv_coloracion} options={['Normal', 'Hiperemia']}
            onChange={v => up('cv_coloracion', v)} />
        </Row>
        <Row label="Glotis">
          <MultiCheck selected={s.glotis} options={['Cierre completo', 'Cierre incompleto', 'Asimetría']}
            onChange={v => up('glotis', v)} />
        </Row>
        <Row label="Subglotis / tráquea proximal">
          <RadioCheck selected={s.subglotis} options={['Normal', 'Alteraciones']}
            onChange={v => up('subglotis', v)} />
          {s.subglotis === 'Alteraciones' && (
            <Input className="mt-1.5 h-8 text-xs" placeholder="Describir alteraciones..."
              value={s.subglotis_detalle}
              onChange={e => up('subglotis_detalle', e.target.value)} />
          )}
        </Row>
      </Section>

      {/* Conclusión */}
      <Section title="Conclusión">
        <Row label="Hallazgos relevantes">
          <textarea
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder="Hallazgos del estudio..."
            value={s.hallazgos}
            onChange={e => up('hallazgos', e.target.value)}
          />
        </Row>
        <Row label="Impresión diagnóstica">
          <textarea
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder="Impresión diagnóstica..."
            value={s.impresion_diagnostica}
            onChange={e => up('impresion_diagnostica', e.target.value)}
          />
        </Row>
        <Row label="Conducta / recomendaciones">
          <textarea
            rows={2}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder="Conducta a seguir..."
            value={s.conducta}
            onChange={e => up('conducta', e.target.value)}
          />
        </Row>
      </Section>
    </div>
  )
}
