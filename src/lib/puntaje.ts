// Precalificación sin preguntas extra (PLAN.md, sección 10). El formulario queda igual al de Cifrato;
// el sistema averigua el resto con lo que ya llega: registro de la empresa, correo y origen.
// Tres capas: 1) reglas con varias señales; 2) si los datos se contradicen, una aclaración corta
// después de agendar (la "IA", simulada con reglas); 3) lo que no queda claro pasa a auditoría humana.
import { buscarEmpresa, esContable, type Registro } from "./registro.ts";

// demo_directa: agenda la demo de una vez · descubrimiento: agenda el Descubrimiento y el equipo llega
// con el análisis previo · sesion_grupal: agenda la demo grupal · persona: auditoría humana, un asesor
// revisa el caso antes de la reunión · filtrado: el formulario de Cifrato ya lo manda a la demo grupal.
export type Camino = "demo_directa" | "descubrimiento" | "sesion_grupal" | "persona" | "filtrado";

export type Entrada = {
  nombreEmpresa: string;
  tipoEmpresa: string;
  facturas: string;
  erps: string[];
  correo: string;
  fuente: string;
  destinoCifrato: string; // a dónde lo manda el formulario de Cifrato
  respuestas?: Record<string, string>; // respuestas a la aclaración, por id de duda
};

// Lo que ve el interesado: la pregunta y sus opciones, sin el efecto de cada una.
export type DudaPublica = { id: string; pregunta: string; opciones: string[] };

export type Resultado = {
  puntaje: number;
  detalle: { senal: string; valor: string; puntos: number }[];
  camino: Camino;
  excepciones: string[]; // por qué el caso no es simple (cuenta grande, contradicciones)
  dudas: DudaPublica[]; // contradicciones aún sin aclarar
  aclaracion: { pregunta: string; respuesta: string; nota: string; confianza: "alta" | "baja" }[];
  cuentaGrande: boolean;
  minutosAhorrados: number;
  registro: Registro | null;
  analisis: string; // lo que lee el equipo antes de la reunión
};

type Opcion = { texto: string; ajuste: number; confianza: "alta" | "baja"; nota: string };
type Duda = { id: string; motivo: string; pregunta: string; opciones: Opcion[] };

const CORREOS_GRATUITOS = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com"];
// Origen: quien busca o llega recomendado tiene más intención que quien vio un anuncio.
const ORIGEN_ALTO = ["Página Aliado Siigo", "Referido", "Google"];
const ORIGEN_MEDIO = ["LinkedIn", "Email", "WhatsApp", "Llamada", "Actualícese", "Chatbot (ChatGPT, Perplexity, Claude, etc.)"];

// Minutos de llamada humana liberados frente al Descubrimiento de 30 minutos que agendaría hoy:
// ir directo a la demo o a la grupal libera 30; la auditoría deja la revisión en unos 10, libera 20.
const MINUTOS: Record<Camino, number> = { demo_directa: 30, descubrimiento: 0, sesion_grupal: 30, persona: 20, filtrado: 0 };

// Contradicciones en los datos. Cada una trae su pregunta y lo que significa cada respuesta.
// Una firma contable con varios ERP es normal (sus clientes usan ERP distintos), por eso no está aquí.
function detectarDudas(e: Entrada, registro: Registro | null, corporativo: boolean): Duda[] {
  const dudas: Duda[] = [];
  if (e.tipoEmpresa === "Empresa individual" && e.erps.length >= 3) {
    dudas.push({
      id: "erps",
      motivo: "Empresa individual con varios ERP",
      pregunta: "¿Esos software contables son de tu empresa o de las empresas que atiendes?",
      opciones: [
        { texto: "De las empresas que atiendo", ajuste: 1, confianza: "alta", nota: "Atiende a otras empresas, se clasifica como firma contable" },
        { texto: "Todos son de mi empresa", ajuste: 0, confianza: "alta", nota: "Usa varios ERP propios, revisar la integración en la reunión" },
        { texto: "No estoy seguro", ajuste: 0, confianza: "baja", nota: "Sin claridad sobre sus ERP, requiere revisión" },
      ],
    });
  }
  if (e.tipoEmpresa === "Empresa individual" && e.facturas === "Más de 800" && registro && registro.empleados < 5) {
    dudas.push({
      id: "volumen",
      motivo: "Más de 800 facturas con muy pocos empleados",
      pregunta: "¿Esas facturas son de tu empresa o de las empresas a las que les llevas la contabilidad?",
      opciones: [
        { texto: "De las empresas que atiendo", ajuste: 0, confianza: "alta", nota: "El volumen corresponde a sus clientes" },
        { texto: "Solo de mi empresa", ajuste: -2, confianza: "baja", nota: "Volumen atípico para su tamaño, requiere revisión" },
        { texto: "Sumé compras y ventas", ajuste: -1, confianza: "alta", nota: "Su volumen de compras es menor al reportado" },
      ],
    });
  }
  if (e.tipoEmpresa === "Firma contable" && registro && !esContable(registro)) {
    dudas.push({
      id: "actividad",
      motivo: "Dice ser firma contable, pero el registro no es contable",
      pregunta: "¿Llevas la contabilidad de otras empresas?",
      opciones: [
        { texto: "Sí, de varias empresas", ajuste: 0, confianza: "alta", nota: "Confirma que presta servicios contables" },
        { texto: "No, solo la de mi empresa", ajuste: -1, confianza: "alta", nota: "Lleva solo su contabilidad, se clasifica como empresa individual" },
      ],
    });
  }
  if (!registro && !corporativo && (e.facturas === "Más de 800" || e.facturas === "Entre 500 y 800")) {
    dudas.push({
      id: "registro",
      motivo: "No aparece en el registro, con correo gratuito y volumen alto",
      pregunta: "¿Cómo está registrada tu empresa ante la DIAN?",
      opciones: [
        { texto: "Como empresa (persona jurídica)", ajuste: 1, confianza: "alta", nota: "Persona jurídica, validar el NIT antes de la reunión" },
        { texto: "Como persona natural", ajuste: 0, confianza: "alta", nota: "Persona natural, se mantiene la clasificación" },
        { texto: "Aún no está registrada", ajuste: -3, confianza: "alta", nota: "Sin registro ante la DIAN, se asigna a la demo grupal" },
      ],
    });
  }
  return dudas.slice(0, 2); // nunca más de 2 preguntas
}

export function calificar(e: Entrada): Resultado {
  const registro = buscarEmpresa(e.nombreEmpresa);
  const dominio = e.correo.split("@")[1]?.toLowerCase() ?? "";
  const corporativo = !!dominio && !CORREOS_GRATUITOS.includes(dominio);

  const detalle = [
    { senal: "Facturas al mes", valor: e.facturas, puntos: ({ "Más de 800": 3, "Entre 500 y 800": 2, "Entre 300 y 500": 1 } as Record<string, number>)[e.facturas] ?? 0 },
    { senal: "Tipo de empresa", valor: e.tipoEmpresa, puntos: e.tipoEmpresa === "Firma contable" ? 2 : 1 },
    { senal: "Correo", valor: corporativo ? `Corporativo (${dominio})` : "Gratuito", puntos: corporativo ? 2 : 0 },
    {
      senal: "Registro",
      valor: registro ? `${registro.actividad.split(" · ")[1]}, ${registro.empleados} empleados` : "No encontrado",
      puntos: (esContable(registro) ? 2 : 0) + (registro && registro.empleados >= 20 ? 1 : 0),
    },
    {
      senal: "Origen",
      valor: e.fuente,
      puntos: ORIGEN_ALTO.includes(e.fuente) ? 2 : ORIGEN_MEDIO.includes(e.fuente) ? 1 : e.fuente === "Computrabajo" ? -3 : 0,
    },
  ];

  // Capa 2: aplicar lo que respondió en la aclaración.
  const dudas = detectarDudas(e, registro, corporativo);
  const aclaracion: Resultado["aclaracion"] = [];
  let confianzaBaja = false;
  for (const d of dudas) {
    const o = d.opciones.find((x) => x.texto === e.respuestas?.[d.id]);
    if (!o) continue;
    aclaracion.push({ pregunta: d.pregunta, respuesta: o.texto, nota: o.nota, confianza: o.confianza });
    if (o.confianza === "baja") confianzaBaja = true;
    detalle.push({ senal: "Aclaración", valor: o.texto, puntos: o.ajuste });
  }
  const pendientes = dudas.filter((d) => !e.respuestas?.[d.id]);
  const puntaje = detalle.reduce((s, d) => s + d.puntos, 0);

  // Más de 200 empleados con buenas señales es lo más claro que hay: demo directa con el equipo senior.
  const cuentaGrande = !!registro && registro.empleados >= 200 && puntaje >= 5;
  const excepciones = [...(cuentaGrande ? ["Cuenta grande (más de 200 empleados)"] : []), ...dudas.map((d) => d.motivo)];

  let camino: Camino;
  if (e.destinoCifrato !== "descubrimiento") camino = "filtrado";
  else if (confianzaBaja) camino = "persona"; // capa 3: lo que la aclaración no resolvió
  else if (cuentaGrande) camino = "demo_directa";
  else camino = puntaje >= 9 ? "demo_directa" : puntaje >= 5 ? "descubrimiento" : "sesion_grupal";

  const analisis = [
    registro
      ? `${e.nombreEmpresa}: ${registro.actividad.split(" · ")[1].toLowerCase()} en ${registro.ciudad}, ${registro.empleados} empleados, matriculada desde ${registro.desde} (NIT ${registro.nit}).`
      : `${e.nombreEmpresa}: no aparece en el registro, confirmar NIT en la llamada.`,
    `${e.facturas} facturas al mes en ${e.erps.join(", ")}. Llegó por ${e.fuente}${corporativo ? "" : ", con correo gratuito"}.`,
    cuentaGrande
      ? `Cuenta grande: asignar al equipo senior. Llevar caso de integración con ${e.erps.length > 1 ? "varios ERP" : e.erps[0]}, propuesta por volumen y plan de implementación por etapas.`
      : "",
    ...aclaracion.map((a) => `Aclaró: "${a.respuesta}". ${a.nota}.`),
    pendientes.length ? `Pendiente de aclarar: ${pendientes.map((d) => d.motivo.toLowerCase()).join("; ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    puntaje,
    detalle,
    camino,
    excepciones,
    dudas: camino === "filtrado" ? [] : pendientes.map(({ id, pregunta, opciones }) => ({ id, pregunta, opciones: opciones.map((o) => o.texto) })),
    aclaracion,
    cuentaGrande,
    minutosAhorrados: MINUTOS[camino],
    registro,
    analisis,
  };
}
