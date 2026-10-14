// Campañas de seguimiento, al estilo de un workflow de Customer.io: un disparador según dónde quedó
// el interesado (y lo que anotó el asesor después de la reunión) y una secuencia por días y canales.
// Es solo la estructura para mostrar: no envía nada.
import type { Lead } from "./panel.ts";

export type Canal = "email" | "whatsapp";
export type PasoCampana =
  | { tipo: "espera"; dias: number; texto?: string }
  | { tipo: "mensaje"; canal: Canal; titulo: string; texto: string }
  | { tipo: "tarea"; titulo: string; texto: string }
  | { tipo: "actualizar"; titulo: string }
  | { tipo: "condicion"; pregunta: string; ramas: { nombre: string; pasos: PasoCampana[]; principal?: boolean }[] }
  | { tipo: "fin"; titulo: string };

export type Campana = {
  id: string;
  grupo: "Antes de la reunión" | "En seguimiento" | "No cerró" | "Cerró";
  nombre: string;
  disparador: string;
  objetivo: string;
  sale: string;
  pasos: PasoCampana[];
};

export const CAMPANAS: Campana[] = [
  {
    id: "antes",
    grupo: "Antes de la reunión",
    nombre: "Confirmación y recordatorios",
    disparador: "Agendó una reunión",
    objetivo: "Que asista a la reunión",
    sale: "Cuando asiste o reagenda",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "Confirmación", texto: "Hola {{nombre}}, tu {{reunion}} quedó para el {{fecha}}. Te enviamos el enlace al correo." },
      { tipo: "espera", dias: 0, texto: "Hasta 24 horas antes" },
      { tipo: "mensaje", canal: "email", titulo: "Prepara tu reunión", texto: "Ten a mano tu acceso a la DIAN y a {{erp}} para verlo con tus propias facturas." },
      { tipo: "espera", dias: 0, texto: "Hasta 1 hora antes" },
      { tipo: "mensaje", canal: "whatsapp", titulo: "Recordatorio", texto: "En una hora nos vemos por Google Meet: {{enlace}}" },
      {
        tipo: "condicion",
        pregunta: "¿Asistió?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a lo que anote el asesor" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "whatsapp", titulo: "¿Buscamos otro horario?", texto: "Te esperamos hoy, {{nombre}}. Elige otro horario aquí: {{agenda}}" },
              { tipo: "espera", dias: 2 },
              { tipo: "mensaje", canal: "email", titulo: "Último intento", texto: "Guardamos tu análisis de {{empresa}}. Cuando quieras, retomamos." },
              { tipo: "fin", titulo: "Pasa a No asistió" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "aclaracion",
    grupo: "Antes de la reunión",
    nombre: "Pregunta sin responder",
    disparador: "Agendó sin responder la pregunta de aclaración",
    objetivo: "Clasificar bien la reunión antes de que ocurra",
    sale: "Cuando responde",
    pasos: [
      { tipo: "espera", dias: 0, texto: "Esperar 2 horas" },
      { tipo: "mensaje", canal: "whatsapp", titulo: "Una pregunta rápida", texto: "Para preparar tu reunión: {{pregunta}}" },
      {
        tipo: "condicion",
        pregunta: "¿Respondió?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "actualizar", titulo: "Reclasificar la reunión" }, { tipo: "fin", titulo: "Sale de la campaña" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "espera", dias: 1 },
              { tipo: "mensaje", canal: "email", titulo: "Recordatorio de la pregunta", texto: "Con tu respuesta llegamos a la reunión con propuestas para {{empresa}}." },
              { tipo: "tarea", titulo: "El asesor confirma en la reunión", texto: "Preguntar: {{pregunta}}" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "propuesta",
    grupo: "En seguimiento",
    nombre: "Pidió propuesta",
    disparador: "El asesor anotó: pidió propuesta",
    objetivo: "Cerrar en los siguientes 7 días",
    sale: "Cuando cierra o dice que no",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Tu propuesta", texto: "Propuesta para {{empresa}}: {{facturas}} facturas al mes en {{erp}}, con implementación por etapas." },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Abrió la propuesta?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "mensaje", canal: "whatsapp", titulo: "¿Resolvemos dudas?", texto: "Hola {{nombre}}, ¿revisamos juntos la propuesta en 15 minutos?" }] },
          {
            nombre: "No",
            principal: true,
            pasos: [{ tipo: "mensaje", canal: "email", titulo: "La propuesta en 3 puntos", texto: "Lo esencial para {{empresa}}: qué se automatiza, en cuánto tiempo y cuánto cuesta." }],
          },
        ],
      },
      { tipo: "espera", dias: 4 },
      { tipo: "tarea", titulo: "Llamada de cierre", texto: "El asesor llama con el contexto de la reunión y las respuestas." },
      {
        tipo: "condicion",
        pregunta: "¿Cerró?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "fin", titulo: "Pasa a Bienvenida" }] },
          { nombre: "No", principal: true, pasos: [{ tipo: "fin", titulo: "Pasa a No cerró, según el motivo" }] },
        ],
      },
    ],
  },
  {
    id: "activacion",
    grupo: "En seguimiento",
    nombre: "Sin respuesta después de la reunión",
    disparador: "Tuvo la reunión y no volvió a responder en 3 días",
    objetivo: "Reactivar la conversación y llevarla al cierre",
    sale: "Cuando responde o agenda",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "Lo que vimos juntos", texto: "Hola {{nombre}}, te dejo el resumen de tu reunión y el siguiente paso para {{empresa}}." },
      { tipo: "espera", dias: 3 },
      {
        tipo: "condicion",
        pregunta: "¿Respondió?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "tarea", titulo: "Retomar con el asesor", texto: "Llamar con el contexto de la reunión y lo que respondió." }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "mensaje", canal: "email", titulo: "Pruébalo con tus facturas", texto: "Activa 3 días gratis con 50 facturas de {{empresa}}, sin reunión de por medio." },
              { tipo: "espera", dias: 4 },
              { tipo: "mensaje", canal: "whatsapp", titulo: "¿Te ayudo a empezar?", texto: "{{nombre}}, ¿conectamos la DIAN en 10 minutos y ves tus primeras facturas causadas?" },
              { tipo: "espera", dias: 7 },
              { tipo: "mensaje", canal: "email", titulo: "Último mensaje", texto: "No te escribimos más por ahora. Cuando quieras retomar, tu análisis sigue aquí." },
              { tipo: "fin", titulo: "Pasa a No es el momento" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "decision",
    grupo: "En seguimiento",
    nombre: "Lo decide con otra persona",
    disparador: "El asesor anotó: lo consulta con su socio o jefe",
    objetivo: "Llegar a quien decide",
    sale: "Cuando agenda con quien decide",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Resumen para compartir", texto: "Un resumen de una página para compartir con quien decide en {{empresa}}." },
      { tipo: "espera", dias: 2 },
      { tipo: "mensaje", canal: "whatsapp", titulo: "Un caso parecido", texto: "Así redujo una firma como {{empresa}} su cierre contable de 5 días a 1." },
      { tipo: "espera", dias: 4 },
      { tipo: "tarea", titulo: "Proponer reunión con quien decide", texto: "Ofrecer 20 minutos con el socio o jefe." },
    ],
  },
  {
    id: "precio",
    grupo: "No cerró",
    nombre: "Por precio",
    disparador: "El asesor anotó: no cerró por precio",
    objetivo: "Mostrar el costo de no automatizar",
    sale: "Cuando acepta el piloto o pasan 60 días",
    pasos: [
      { tipo: "espera", dias: 2 },
      { tipo: "mensaje", canal: "email", titulo: "Lo que cuesta digitar", texto: "{{facturas}} facturas al mes son cerca de {{horas}} horas de digitación. Así se compara con Cifrato." },
      { tipo: "espera", dias: 7 },
      { tipo: "mensaje", canal: "whatsapp", titulo: "Piloto sin compromiso", texto: "¿Probamos 30 días con una sola empresa, {{nombre}}?" },
      {
        tipo: "condicion",
        pregunta: "¿Aceptó el piloto?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "tarea", titulo: "Activar el piloto", texto: "El asesor configura la empresa de prueba." }] },
          {
            nombre: "No",
            principal: true,
            pasos: [
              { tipo: "espera", dias: 60 },
              { tipo: "mensaje", canal: "email", titulo: "Novedades y nuevo plan", texto: "Hay un plan nuevo para firmas como {{empresa}}." },
              { tipo: "fin", titulo: "Sale de la campaña" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "no_asistio",
    grupo: "No cerró",
    nombre: "No asistió",
    disparador: "No se conectó a la reunión",
    objetivo: "Recuperar la reunión",
    sale: "Cuando reagenda",
    pasos: [
      { tipo: "mensaje", canal: "whatsapp", titulo: "¿Reagendamos?", texto: "Hola {{nombre}}, no alcanzamos a vernos. Elige otro horario: {{agenda}}" },
      { tipo: "espera", dias: 2 },
      { tipo: "mensaje", canal: "email", titulo: "Tu análisis te espera", texto: "Preparamos el análisis de {{empresa}}. Míralo en 20 minutos cuando quieras." },
      { tipo: "espera", dias: 5 },
      { tipo: "mensaje", canal: "whatsapp", titulo: "Demo grupal", texto: "Si prefieres, únete a la próxima demo grupal: {{agenda_grupal}}" },
      { tipo: "fin", titulo: "Pasa a la demo grupal" },
    ],
  },
  {
    id: "momento",
    grupo: "No cerró",
    nombre: "No es el momento",
    disparador: "El asesor anotó: no es el momento",
    objetivo: "Volver cuando esté listo",
    sale: "Cuando responde",
    pasos: [
      { tipo: "espera", dias: 30 },
      { tipo: "mensaje", canal: "email", titulo: "Lo nuevo en Cifrato", texto: "Nuevas integraciones y lo que mejoramos este mes." },
      { tipo: "espera", dias: 30 },
      { tipo: "mensaje", canal: "whatsapp", titulo: "¿Retomamos?", texto: "Hola {{nombre}}, ¿ya es buen momento para {{empresa}}?" },
      {
        tipo: "condicion",
        pregunta: "¿Respondió?",
        ramas: [
          { nombre: "Sí", pasos: [{ tipo: "tarea", titulo: "Agendar con el mismo asesor", texto: "Retomar desde lo que quedó anotado." }] },
          { nombre: "No", principal: true, pasos: [{ tipo: "fin", titulo: "Sale de la campaña" }] },
        ],
      },
    ],
  },
  {
    id: "bienvenida",
    grupo: "Cerró",
    nombre: "Bienvenida",
    disparador: "El asesor anotó: cerró",
    objetivo: "Primeras facturas causadas en 7 días",
    sale: "Al cumplir 30 días",
    pasos: [
      { tipo: "mensaje", canal: "email", titulo: "Bienvenida", texto: "Bienvenido a Cifrato, {{nombre}}. Estos son los 3 pasos para empezar." },
      { tipo: "espera", dias: 2 },
      {
        tipo: "condicion",
        pregunta: "¿Conectó la DIAN?",
        ramas: [
          { nombre: "Sí", principal: true, pasos: [{ tipo: "mensaje", canal: "whatsapp", titulo: "Ya estás conectado", texto: "Listo, {{nombre}}. Tus facturas empiezan a llegar hoy." }] },
          { nombre: "No", pasos: [{ tipo: "tarea", titulo: "Sesión de soporte", texto: "Acompañar la conexión en 15 minutos." }] },
        ],
      },
      { tipo: "espera", dias: 5 },
      { tipo: "mensaje", canal: "email", titulo: "Tus primeras facturas", texto: "Así va {{empresa}}: facturas causadas y tiempo ahorrado." },
      { tipo: "espera", dias: 23 },
      { tipo: "mensaje", canal: "email", titulo: "Tu opinión", texto: "¿Cómo va todo? Si conoces otra firma, te damos un mes gratis." },
      { tipo: "fin", titulo: "Sale de la campaña" },
    ],
  },
];

// ── En qué campaña está cada interesado ───────────────────────────────

const POR_MOTIVO: Record<string, string> = {
  "Pidió propuesta": "propuesta",
  "Lo consulta internamente": "decision",
  "Sin respuesta": "activacion",
  Precio: "precio",
  "No asistió": "no_asistio",
  "No es el momento": "momento",
};

export function campanaDe(l: Lead, ahora: number): Campana | null {
  const r = l.detalle_puntaje.resultado;
  if (r?.estado === "cerro") return porId("bienvenida");
  if (r) return porId(POR_MOTIVO[r.motivo] ?? "decision");
  if (l.detalle_puntaje.dudas?.length) return porId("aclaracion");
  if (l.agendado_para && new Date(l.agendado_para).getTime() > ahora) return porId("antes");
  return null;
}

const porId = (id: string) => CAMPANAS.find((c) => c.id === id)!;

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

export function avance(l: Lead, c: Campana, ahora: number) {
  const pasos = linea(c.pasos);

  // Antes de la reunión: los mensajes se cuentan hacia atrás desde la reunión, no desde que llegó.
  if (c.id === "antes" && l.agendado_para) {
    const reunion = new Date(l.agendado_para).getTime();
    const momentos = [new Date(l.creado).getTime(), reunion - 86_400_000, reunion - 3_600_000];
    const previos = pasos.slice(0, 3).map((p, i) => ({ ...p, t: momentos[i] }));
    const hechos = previos.filter((p) => p.t <= ahora);
    const siguiente = previos.find((p) => p.t > ahora) ?? null;
    return {
      ultimo: hechos.at(-1)?.paso ?? null,
      siguiente: siguiente?.paso ?? null,
      enDias: siguiente ? Math.max(Math.round((siguiente.t - ahora) / 86_400_000), 0) : null,
      hechos: hechos.length,
      total: previos.length,
    };
  }

  const inicio = new Date(l.detalle_puntaje.resultado?.fecha ?? l.creado).getTime();
  const dias = Math.floor((ahora - inicio) / 86_400_000);
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

// Día de cada mensaje o tarea en el camino principal, para mostrarlo en el lienzo.
export function diasDe(c: Campana) {
  return new Map(linea(c.pasos).map((p) => [p.paso as PasoCampana, p.dia]));
}

// Propiedades que el sistema escribe en el contacto de HubSpot; los workflows de HubSpot se activan con ellas.
export const PROPIEDADES = ["cifrato_reunion", "cifrato_puntaje", "cifrato_caso_especial", "cifrato_resultado", "cifrato_motivo", "cifrato_analisis"];
