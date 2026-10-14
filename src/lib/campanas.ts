// Journeys de retención, desde la firma hasta la renovación, como workflows de HubSpot.
// Cada uno es independiente: se activa con un evento del producto, tiene un objetivo (el siguiente
// evento) y la cuenta sale en cuanto lo cumple. Es solo la estructura para mostrar: no envía nada.
import type { Lead } from "./panel.ts";

export type Canal = "email" | "whatsapp";
export type PasoCampana =
  | { tipo: "espera"; dias: number; texto?: string }
  | { tipo: "mensaje"; canal: Canal; titulo: string; texto: string }
  | { tipo: "tarea"; titulo: string; texto: string }
  | { tipo: "condicion"; pregunta: string; ramas: { nombre: string; pasos: PasoCampana[]; principal?: boolean }[] }
  | { tipo: "fin"; titulo: string };

export type Etapa = "Configuración" | "Uso" | "Renovación";

export type Campana = {
  id: string;
  etapa: Etapa;
  nombre: string;
  evento: string; // evento del producto que inscribe la cuenta
  disparador: string;
  meta: string; // evento objetivo: al cumplirlo, la cuenta sale
  objetivo: string;
  persona: string; // cuándo entra el especialista
  pasos: PasoCampana[];
};

export const CAMPANAS: Campana[] = [
  {
    id: "bienvenida",
    etapa: "Configuración",
    nombre: "Bienvenida y DIAN",
    evento: "cuenta_creada",
    disparador: "Firmó el contrato",
    meta: "dian_conectada",
    objetivo: "Conecta la DIAN",
    persona: "Si a los 5 días no ha conectado",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Bienvenida", texto: "Bienvenido a Cifrato, {{nombre}}. Son 3 pasos y el primero toma 5 minutos: conectar la DIAN." },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Conectó la DIAN?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a Conectar el ERP" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "whatsapp", titulo: "Guía de 5 minutos", texto: "Hola {{nombre}}, así conectas la DIAN en 5 minutos: {{guia}}" },
              { tipo: "espera", dias: 3 },
              { tipo: "tarea", titulo: "Conectar en llamada", texto: "15 minutos para conectar la DIAN en vivo." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "erp",
    etapa: "Configuración",
    nombre: "Conectar el ERP",
    evento: "dian_conectada",
    disparador: "Conectó la DIAN",
    meta: "erp_conectado",
    objetivo: "Conecta su ERP",
    persona: "Si a los 7 días no ha conectado",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Siguiente paso: {{erp}}", texto: "Las 4 pantallas de {{erp}} que necesitas, con capturas." },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Conectó el ERP?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a Primeras facturas" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "whatsapp", titulo: "¿Lo hacemos juntos?", texto: "{{nombre}}, ¿te ayudo a conectar {{erp}} hoy?" },
              { tipo: "espera", dias: 5 },
              { tipo: "tarea", titulo: "Conectar el ERP en llamada", texto: "Revisar permisos y conectar en vivo." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "primeras",
    etapa: "Configuración",
    nombre: "Primeras facturas",
    evento: "erp_conectado",
    disparador: "Conectó el ERP",
    meta: "primer_lote_subido",
    objetivo: "Sube su primer lote al ERP",
    persona: "Si hay errores al subir o a los 7 días no sube",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Tus facturas ya llegaron", texto: "Tienes {{pendientes}} facturas listas para revisar y subir a {{erp}}." },
      { tipo: "espera", dias: 3 },
      {
        tipo: "condicion",
        pregunta: "¿Subió el primer lote?",
        ramas: [
          {
            nombre: "Sí",
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Tu primera semana", texto: "{{facturas}} facturas causadas en {{empresa}} sin digitar." },
              { tipo: "fin", titulo: "Sale del journey" },
            ],
          },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "whatsapp", titulo: "Tus facturas te esperan", texto: "{{nombre}}, tienes {{pendientes}} facturas listas. Súbelas en un clic: {{enlace}}" },
              { tipo: "espera", dias: 4 },
              { tipo: "tarea", titulo: "Revisión de 20 minutos", texto: "Resolver errores o dudas de la causación." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "empresas",
    etapa: "Uso",
    nombre: "Sumar sus empresas",
    evento: "empresas_sin_activar",
    disparador: "Firma o contador con menos de la mitad de sus empresas activas a los 21 días",
    meta: "empresa_agregada",
    objetivo: "Activa otra empresa",
    persona: "Si maneja más de 10 empresas",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Agrega tu siguiente empresa", texto: "Llevas {{activas}} de {{contratadas}} empresas. La siguiente toma 5 minutos." },
      { tipo: "espera", dias: 3 },
      { tipo: "mensaje", canal: "whatsapp", titulo: "Lo que ya automatizaste", texto: "Así va {{empresa_activa}}, {{nombre}}. ¿Hacemos lo mismo con la siguiente?" },
      { tipo: "espera", dias: 4 },
      {
        tipo: "condicion",
        pregunta: "¿Activó otra empresa?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Sale del journey" }] },
          { nombre: "No", principal: true, pasos: [{ tipo: "tarea", titulo: "Plan de carga", texto: "Definir con la firma el orden y las fechas para activar sus empresas." }] },
        ],
      },
    ],
  },
  {
    id: "caida",
    etapa: "Uso",
    nombre: "Uso en caída",
    evento: "salud_ambar",
    disparador: "Su salud pasó a ámbar",
    meta: "salud_verde",
    objetivo: "Vuelve a verde",
    persona: "Si pasa a rojo, llamada en 24 horas",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "¿Todo bien?", texto: "Hola {{nombre}}, vimos menos facturas esta semana en {{empresa}}. ¿Pasó algo con la DIAN o con {{erp}}?" },
      { tipo: "espera", dias: 3 },
      {
        tipo: "condicion",
        pregunta: "¿Volvió a subir facturas?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Sale del journey" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Revisa tu conexión", texto: "Tu conexión con {{erp}} necesita atención. Revísala aquí: {{enlace}}" },
              { tipo: "espera", dias: 4 },
              { tipo: "tarea", titulo: "Llamada del especialista", texto: "Llamar con el uso de las últimas 4 semanas." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "renovacion",
    etapa: "Renovación",
    nombre: "Antes de renovar",
    evento: "renovacion_45_dias",
    disparador: "Faltan 45 días para la renovación",
    meta: "renovo",
    objetivo: "Renueva",
    persona: "Si su salud es ámbar o roja",
    pasos: [
      {
        tipo: "condicion",
        pregunta: "¿Su salud es verde?",
        ramas: [
          {
            nombre: "Sí",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Tu año con Cifrato", texto: "{{facturas_total}} facturas causadas en {{empresa}} sin digitar." },
              { tipo: "espera", dias: 15 },
              { tipo: "mensaje", canal: "whatsapp", titulo: "Tu renovación", texto: "Tu plan se renueva el {{fecha}}. ¿Revisamos si necesitas más empresas?" },
            ],
          },
          { nombre: "No", pasos: [{ tipo: "tarea", titulo: "Revisión de cuenta", texto: "30 minutos para revisar uso y plan antes de renovar." }] },
        ],
      },
    ],
  },
];

// ── Salud de la cuenta y reglas generales ─────────────────────────────

export type Salud = "verde" | "ambar" | "rojo";

export const SALUD: Record<Salud, { nombre: string; regla: string; color: string }> = {
  verde: { nombre: "Verde", regla: "Cumple todo", color: "var(--c-demo)" },
  ambar: { nombre: "Ámbar", regla: "Falla 1", color: "var(--c-humano)" },
  rojo: { nombre: "Rojo", regla: "Fallan 2 o más", color: "var(--c-perdido)" },
};

export const SENALES_SALUD = [
  "Sube tantas facturas como su promedio del último mes",
  "Usa todas las empresas que contrató",
  "Entró en la última semana",
  "Sus lotes suben al ERP sin errores",
];

export const REGLAS_PERSONA: { salud: Salud; texto: string }[] = [
  { salud: "verde", texto: "Solo automático" },
  { salud: "ambar", texto: "Automático primero; si en 7 días no mejora, el especialista" },
  { salud: "rojo", texto: "El especialista llama en 24 horas" },
];

export const REGLAS_FRECUENCIA = [
  "Máximo 2 mensajes por semana por cuenta",
  "Un journey a la vez: Renovación, luego Uso en caída, luego el resto",
  "Sin mensajes automáticos 3 días después de hablar con el especialista",
  "Grupo de control: 15 % de las cuentas nuevas no recibe journeys",
];

// ── Quiénes están en cada journey ─────────────────────────────────────

// Cuentas de muestra (ficticias). Los interesados que cerraron en el panel entran a Bienvenida.
export type Cuenta = { id: string; empresa: string; contacto: string; tipo: string; salud: Salud; dia: number; leadId?: string };

const CUENTAS: (Cuenta & { campana: string })[] = [
  { id: "c1", empresa: "Ruiz & Asociados", contacto: "Paula Ruiz", tipo: "Firma contable", salud: "verde", campana: "bienvenida", dia: 1 },
  { id: "c2", empresa: "Contaplus SAS", contacto: "Jorge Lince", tipo: "Firma contable", salud: "ambar", campana: "bienvenida", dia: 4 },
  { id: "c3", empresa: "Asesorías Peña", contacto: "Diana Peña", tipo: "Contador independiente", salud: "verde", campana: "erp", dia: 1 },
  { id: "c4", empresa: "Grupo Contable del Norte", contacto: "Mauricio Arce", tipo: "Firma contable", salud: "ambar", campana: "erp", dia: 5 },
  { id: "c5", empresa: "Restaurante La Brasa", contacto: "Camila Ortiz", tipo: "Restaurante", salud: "verde", campana: "primeras", dia: 2 },
  { id: "c6", empresa: "Nova Contadores", contacto: "Andrea Salas", tipo: "Firma contable", salud: "ambar", campana: "primeras", dia: 6 },
  { id: "c7", empresa: "Bermúdez Contadores", contacto: "Luis Bermúdez", tipo: "Firma contable", salud: "ambar", campana: "empresas", dia: 3 },
  { id: "c8", empresa: "Outsourcing Contable Ríos", contacto: "Sandra Ríos", tipo: "Firma contable", salud: "ambar", campana: "empresas", dia: 8 },
  { id: "c9", empresa: "Ferretería El Tornillo", contacto: "Hernán Gil", tipo: "Empresa individual", salud: "ambar", campana: "caida", dia: 1 },
  { id: "c10", empresa: "Cuentas Claras SAS", contacto: "Natalia Mejía", tipo: "Firma contable", salud: "ambar", campana: "caida", dia: 5 },
  { id: "c11", empresa: "Méndez Auditores", contacto: "Ricardo Méndez", tipo: "Firma contable", salud: "verde", campana: "renovacion", dia: 3 },
  { id: "c12", empresa: "Asesores Tributarios Lara", contacto: "Felipe Lara", tipo: "Firma contable", salud: "rojo", campana: "renovacion", dia: 1 },
];

const DIA = 86_400_000;
const porId = (id: string) => CAMPANAS.find((c) => c.id === id)!;
const diasDesde = (l: Lead, ahora: number) => Math.max(Math.floor((ahora - new Date(l.detalle_puntaje.resultado?.fecha ?? l.creado).getTime()) / DIA), 0);

export function campanaDe(l: Lead): Campana | null {
  return l.detalle_puntaje.resultado?.estado === "cerro" ? porId("bienvenida") : null;
}

export function cuentasDe(c: Campana, leads: Lead[], ahora: number): Cuenta[] {
  const cerraron = leads
    .filter((l) => campanaDe(l)?.id === c.id)
    .map((l) => ({ id: l.id, empresa: l.nombre_empresa, contacto: l.nombre, tipo: l.tipo_empresa, salud: "verde" as Salud, dia: diasDesde(l, ahora), leadId: l.id }));
  return [...cerraron, ...CUENTAS.filter((x) => x.campana === c.id)];
}

type Accion = Extract<PasoCampana, { tipo: "mensaje" | "tarea" }>;

// Los mensajes del camino principal con su día, para saber cuál va y cuál sigue.
function linea(pasos: PasoCampana[], dia = 0): { paso: Accion; dia: number }[] {
  const out: { paso: Accion; dia: number }[] = [];
  for (const p of pasos) {
    if (p.tipo === "espera") dia += p.dias;
    else if (p.tipo === "condicion") {
      const rama = p.ramas.find((r) => r.principal) ?? p.ramas[0];
      const sub = linea(rama.pasos, dia);
      out.push(...sub);
      dia = sub.at(-1)?.dia ?? dia;
    } else if (p.tipo === "mensaje" || p.tipo === "tarea") out.push({ paso: p, dia });
  }
  return out;
}

// Dónde va una cuenta que lleva `dias` días en el journey.
export function avance(c: Campana, dias: number) {
  const pasos = linea(c.pasos);
  const hechos = pasos.filter((p) => p.dia <= dias);
  const siguiente = pasos.find((p) => p.dia > dias) ?? null;
  return {
    ultimo: hechos.at(-1)?.paso ?? null,
    siguiente: siguiente?.paso ?? null,
    enDias: siguiente ? siguiente.dia - dias : null,
    hechos: hechos.length,
    total: pasos.length,
  };
}

export const avanceLead = (l: Lead, c: Campana, ahora: number) => avance(c, diasDesde(l, ahora));

// Día de cada mensaje o tarea en el camino principal, para mostrarlo en el lienzo.
export function diasDe(c: Campana) {
  return new Map(linea(c.pasos).map((p) => [p.paso as PasoCampana, p.dia]));
}
