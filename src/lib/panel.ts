// Datos del panel de operaciones. Funciones puras: se usan en el servidor y en el navegador.
// El panel muestra el sistema funcionando (por dónde pasó cada interesado y por qué), no comparaciones.
import type { Camino } from "./puntaje.ts";
import type { Registro } from "./registro.ts";

// Lo que anotó el asesor después de la reunión.
export type Resultado = { estado: "cerro" | "seguimiento" | "no_cerro"; motivo: string; nota: string; fecha: string };

export const RESULTADOS: Record<Resultado["estado"], { nombre: string; color: string }> = {
  cerro: { nombre: "Cerró", color: "var(--c-demo)" },
  seguimiento: { nombre: "En seguimiento", color: "var(--c-descubrimiento)" },
  no_cerro: { nombre: "No cerró", color: "var(--c-perdido)" },
};

export type Auditoria = { decision: "aprobado" | "corregido"; de: Camino; a: Camino; fecha: string };

export type Lead = {
  id: string;
  creado: string;
  nombre: string;
  correo: string;
  fuente: string;
  tipo_empresa: string;
  nombre_empresa: string;
  erps: string[];
  rango_facturas: string;
  destino_cifrato: string;
  puntaje: number | null;
  camino: Camino;
  resumen_humano: string;
  minutos_ahorrados: number;
  agendado_para: string | null;
  ficticio: boolean;
  detalle_puntaje: {
    senales: { senal: string; valor: string; puntos: number }[];
    excepciones: string[];
    registro: Registro | null;
    dudas?: { id: string; pregunta: string }[];
    aclaracion?: { pregunta: string; respuesta: string; nota: string; confianza?: "alta" | "baja" }[];
    cuenta_grande?: boolean;
    camino_inicial?: Camino;
    auditoria?: Auditoria;
    resultado?: Resultado;
  };
};

// A dónde quedó cada interesado.
export type Destino = "demo_directa" | "descubrimiento" | "sesion_grupal" | "persona" | "sin_reunion";

export const DESTINOS: Record<Destino, { nombre: string; color: string; duracion?: string }> = {
  demo_directa: { nombre: "Demo directa", color: "var(--c-demo)", duracion: "45 min" },
  descubrimiento: { nombre: "Descubrimiento", color: "var(--c-descubrimiento)", duracion: "30 min" },
  sesion_grupal: { nombre: "Demo grupal", color: "var(--c-grupal)", duracion: "45 min" },
  persona: { nombre: "Con un asesor", color: "var(--c-humano)", duracion: "30 min" },
  sin_reunion: { nombre: "Sin reunión", color: "var(--c-neutro)" },
};

export function destino(l: Lead): Destino {
  if (l.camino !== "filtrado") return l.camino;
  return l.destino_cifrato === "demo_grupal" ? "sesion_grupal" : "sin_reunion";
}

// ── Ruta por el enrutador ─────────────────────────────────────────────

export type Evaluacion = "claras" | "cuenta_grande" | "no_cuadran";
export type Resolucion = "aclarado" | "sin_responder" | "revision";

export function evaluacion(l: Lead): Evaluacion | null {
  if (l.camino === "filtrado") return null;
  if (l.detalle_puntaje.cuenta_grande) return "cuenta_grande";
  if (l.detalle_puntaje.dudas?.length || l.detalle_puntaje.aclaracion?.length) return "no_cuadran";
  return "claras";
}

export function resolucion(l: Lead): Resolucion | null {
  if (evaluacion(l) !== "no_cuadran") return null;
  if (l.detalle_puntaje.camino_inicial && (l.camino === "persona" || l.detalle_puntaje.auditoria)) return "revision";
  if (l.detalle_puntaje.dudas?.length) return "sin_responder";
  return "aclarado";
}

// Nodos del diagrama, en orden de etapa. Cada interesado pasa por una lista de ellos.
export const NODOS = {
  entrada: { nombre: "Interesados", etapa: 0 },
  regla_cifrato: { nombre: "Regla de Cifrato", etapa: 1 },
  califica: { nombre: "Pasa a precalificar", etapa: 1 },
  claras: { nombre: "Señales claras", etapa: 2 },
  cuenta_grande: { nombre: "Cuenta grande", etapa: 2 },
  no_cuadran: { nombre: "Datos que no cuadran", etapa: 2 },
  aclarado: { nombre: "Se aclaró solo", etapa: 3 },
  sin_responder: { nombre: "Sin responder", etapa: 3 },
  revision: { nombre: "Revisión humana", etapa: 3 },
  demo_directa: { nombre: DESTINOS.demo_directa.nombre, etapa: 4 },
  descubrimiento: { nombre: DESTINOS.descubrimiento.nombre, etapa: 4 },
  sesion_grupal: { nombre: DESTINOS.sesion_grupal.nombre, etapa: 4 },
  persona: { nombre: DESTINOS.persona.nombre, etapa: 4 },
  sin_reunion: { nombre: DESTINOS.sin_reunion.nombre, etapa: 4 },
  cerro: { nombre: "Cerró", etapa: 5 },
  seguimiento: { nombre: "En seguimiento", etapa: 5 },
  no_cerro: { nombre: "No cerró", etapa: 5 },
} as const;
export type Nodo = keyof typeof NODOS;

export function ruta(l: Lead): Nodo[] {
  const ev = evaluacion(l);
  const fin: Nodo[] = l.detalle_puntaje.resultado ? [l.detalle_puntaje.resultado.estado] : [];
  if (!ev) return ["entrada", "regla_cifrato", destino(l), ...fin];
  const res = resolucion(l);
  return ["entrada", "califica", ev, ...(res ? [res] : []), destino(l), ...fin];
}

// ── Excepciones ───────────────────────────────────────────────────────

export type EstadoExcepcion = "abierta" | "sin_responder" | "resuelta" | "aprobada" | "corregida";

export const ESTADOS: Record<EstadoExcepcion, { nombre: string; tono: "ambar" | "verde" | "gris" }> = {
  abierta: { nombre: "Esperando revisión", tono: "ambar" },
  sin_responder: { nombre: "Sin responder", tono: "gris" },
  resuelta: { nombre: "Resuelta sola", tono: "verde" },
  aprobada: { nombre: "Aprobada", tono: "verde" },
  corregida: { nombre: "Corregida", tono: "gris" },
};

export function estadoExcepcion(l: Lead): EstadoExcepcion | null {
  const ev = evaluacion(l);
  if (ev !== "no_cuadran" && ev !== "cuenta_grande") return null;
  const a = l.detalle_puntaje.auditoria;
  if (a) return a.decision === "aprobado" ? "aprobada" : "corregida";
  if (l.camino === "persona") return "abierta";
  if (l.detalle_puntaje.dudas?.length) return "sin_responder";
  return "resuelta";
}

export const necesitaRevision = (l: Lead) => estadoExcepcion(l) === "abierta";

// ── Razón en una línea ────────────────────────────────────────────────

function senalesFuertes(l: Lead) {
  const d = l.detalle_puntaje;
  const partes: string[] = [];
  const s = (n: string) => d.senales.find((x) => x.senal === n);
  if ((s("Registro")?.puntos ?? 0) >= 2) partes.push(l.tipo_empresa === "Firma contable" ? "Firma contable registrada" : "Registro verificado");
  else if (l.tipo_empresa === "Firma contable") partes.push("Firma contable");
  if ((s("Facturas al mes")?.puntos ?? 0) >= 2) partes.push(`${l.rango_facturas.toLowerCase()} facturas`);
  if ((s("Correo")?.puntos ?? 0) > 0) partes.push("correo de empresa");
  else partes.push("correo gratuito");
  if ((s("Origen")?.puntos ?? 0) >= 2) partes.push(`llegó por ${l.fuente}`);
  return partes.slice(0, 3).join(", ");
}

export function razon(l: Lead): string {
  const d = l.detalle_puntaje;
  if (l.camino === "filtrado") {
    if (l.destino_cifrato === "erp_no_soportado") return "Su software contable aún no tiene integración";
    if (l.tipo_empresa === "Contador independiente") return "Contador independiente, asignado a la demo grupal";
    return `${l.rango_facturas} facturas al mes, asignado a la demo grupal`;
  }
  if (d.auditoria?.decision === "corregido") return "Reasignado por el equipo en la revisión";
  if (d.cuenta_grande) return `Cuenta de ${d.registro?.empleados} empleados, asignada al equipo senior`;
  const ultima = d.aclaracion?.at(-1);
  if (l.camino === "persona") return ultima ? ultima.nota : "Requiere revisión";
  if (d.dudas?.length) return "Agendó sin responder la pregunta de aclaración";
  if (ultima) return ultima.nota;
  return senalesFuertes(l).replace(/^./, (c) => c.toUpperCase());
}

// ── Traza paso a paso ─────────────────────────────────────────────────

export type Paso = { tono?: "ok" | "alerta"; icono: "formulario" | "regla" | "registro" | "senales" | "alerta" | "agenda" | "pregunta" | "respuesta" | "decision" | "humano"; titulo: string; detalle?: string; cuando: string };

export function traza(l: Lead): Paso[] {
  const d = l.detalle_puntaje;
  const t0 = new Date(l.creado).getTime();
  const en = (s: number) => new Date(t0 + s * 1000).toISOString();
  const pasos: Paso[] = [
    { icono: "formulario", titulo: "Llenó el formulario", detalle: `${l.tipo_empresa}, ${l.rango_facturas.toLowerCase()} facturas, ${l.erps.join(", ")}`, cuando: en(0) },
  ];
  if (l.camino === "filtrado") {
    pasos.push({ icono: "regla", titulo: "Aplicó la regla de Cifrato", detalle: razon(l), cuando: en(1) });
    if (l.agendado_para) pasos.push({ icono: "agenda", titulo: `Agendó la ${DESTINOS[destino(l)].nombre.toLowerCase()}`, cuando: en(140) });
    return [...pasos, ...despues(l)];
  }
  pasos.push({
    icono: "registro",
    titulo: d.registro ? "Encontró la empresa en el registro" : "No encontró la empresa en el registro",
    detalle: d.registro ? `${d.registro.actividad.split(" · ")[1]}, ${d.registro.empleados} empleados, ${d.registro.ciudad}` : "Se confirma el NIT en la reunión",
    cuando: en(1),
  });
  const inicial = d.camino_inicial && d.camino_inicial !== "filtrado" ? d.camino_inicial : l.camino;
  pasos.push({ icono: "senales", titulo: `Sumó ${puntajeSin(l)} puntos`, detalle: senalesFuertes(l), cuando: en(1) });
  if (d.cuenta_grande) pasos.push({ icono: "alerta", titulo: "Detectó una cuenta grande", detalle: "Asignada al equipo senior, con la investigación lista", cuando: en(1) });
  const motivos = d.excepciones.filter((x) => !x.startsWith("Cuenta grande"));
  if (motivos.length) pasos.push({ icono: "alerta", titulo: "Detectó datos que no cuadran", detalle: motivos.join(" · "), cuando: en(1) });
  if (l.agendado_para) pasos.push({ icono: "agenda", titulo: `Agendó ${DESTINOS[inicial as Destino].nombre.toLowerCase()}`, detalle: "Eligió su propio horario", cuando: en(140) });
  (d.aclaracion ?? []).forEach((a, i) => {
    pasos.push({ icono: "pregunta", titulo: a.pregunta, cuando: en(150 + i * 20) });
    pasos.push({ icono: "respuesta", tono: a.confianza === "baja" ? "alerta" : "ok", titulo: `“${a.respuesta}”`, detalle: a.nota, cuando: en(160 + i * 20) });
  });
  if (d.dudas?.length) pasos.push({ icono: "pregunta", titulo: d.dudas[0].pregunta, detalle: "Aún sin respuesta", cuando: en(150) });
  const ultimo = en(200);
  if (l.camino === "persona" || (d.auditoria && d.aclaracion?.length)) {
    pasos.push({ icono: "humano", titulo: "Enviado a revisión del equipo", detalle: "La respuesta no resolvió la duda", cuando: ultimo });
  } else if (inicial !== l.camino) {
    pasos.push({ icono: "decision", titulo: `Reasignado a ${DESTINOS[l.camino as Destino].nombre.toLowerCase()}`, detalle: "Mismo horario, con aviso a la persona", cuando: ultimo });
  }
  if (d.auditoria) {
    pasos.push({
      icono: "humano",
      titulo: d.auditoria.decision === "aprobado" ? "El equipo aprobó la decisión" : `El equipo la cambió a ${DESTINOS[d.auditoria.a as Destino].nombre.toLowerCase()}`,
      detalle: d.auditoria.decision === "corregido" ? "Queda registrado para ajustar la regla" : undefined,
      cuando: d.auditoria.fecha,
    });
  }
  return [...pasos, ...despues(l)];
}

// La reunión y lo que anotó el asesor.
function despues(l: Lead): Paso[] {
  const r = l.detalle_puntaje.resultado;
  if (!r || !l.agendado_para) return [];
  return [
    { icono: "agenda", titulo: r.motivo === "No asistió" ? "No se conectó a la reunión" : "Tuvo la reunión", cuando: l.agendado_para },
    {
      icono: "respuesta",
      tono: r.estado === "cerro" ? "ok" : r.estado === "no_cerro" ? "alerta" : undefined,
      titulo: `El asesor anotó: ${RESULTADOS[r.estado].nombre.toLowerCase()}${r.estado === "cerro" ? "" : `, ${r.motivo.toLowerCase()}`}`,
      detalle: r.nota,
      cuando: r.fecha,
    },
  ];
}

// Puntaje de las señales automáticas, sin el ajuste de la aclaración.
export function puntajeSin(l: Lead) {
  return l.detalle_puntaje.senales.filter((s) => s.senal !== "Aclaración").reduce((s, x) => s + x.puntos, 0);
}

// ── Reglas activas ────────────────────────────────────────────────────

export const REGLAS = [
  { id: "cuenta", nombre: "Cuenta grande", condicion: "Más de 200 empleados y 5 puntos o más", accion: "Demo directa con el equipo senior", motivo: "Cuenta grande" },
  { id: "erps", nombre: "Varios ERP en una empresa individual", condicion: "Empresa individual con 3 o más ERP", accion: "Pregunta si los ERP son suyos o de sus clientes", motivo: "Empresa individual con varios ERP" },
  { id: "volumen", nombre: "Volumen que no cuadra", condicion: "Empresa individual, más de 800 facturas y menos de 5 empleados", accion: "Pregunta de quién son las facturas", motivo: "Más de 800 facturas" },
  { id: "actividad", nombre: "Firma sin actividad contable", condicion: "Dice ser firma contable, pero el registro dice otra cosa", accion: "Pregunta si lleva la contabilidad de otras empresas", motivo: "Dice ser firma contable" },
  { id: "registro", nombre: "Empresa sin registro", condicion: "No aparece en el registro, usa correo gratuito y 500 facturas o más", accion: "Pregunta cómo está registrada ante la DIAN", motivo: "No aparece en el registro" },
] as const;

export function usoRegla(leads: Lead[], motivo: string) {
  const con = leads.filter((l) => l.detalle_puntaje.excepciones?.some((x) => x.startsWith(motivo)));
  const conResultado = con.filter((l) => l.detalle_puntaje.resultado && l.detalle_puntaje.resultado.estado !== "seguimiento");
  return {
    veces: con.length,
    corregidas: con.filter((l) => l.detalle_puntaje.auditoria?.decision === "corregido").length,
    cerraron: conResultado.filter((l) => l.detalle_puntaje.resultado!.estado === "cerro").length,
    conResultado: conResultado.length,
  };
}

// ── Fechas suaves (hora de Bogotá) ────────────────────────────────────

const ZONA = "America/Bogota";
const dia = (t: number) => new Date(t).toLocaleDateString("en-CA", { timeZone: ZONA });
const diferenciaDias = (t: number, ahora: number) => Math.round((Date.parse(dia(t)) - Date.parse(dia(ahora))) / 86_400_000);

export function hora(iso: string) {
  const d = new Date(iso);
  const s = d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: ZONA });
  // "3 pm", "9:30 am": corto y sin puntos; el espacio no se parte en dos líneas.
  return s.replace(":00", "").replace(/\s*a\.\s*m\./, " am").replace(/\s*p\.\s*m\./, " pm");
}

// "Hoy", "Mañana", "Jueves" o "15 oct", para reuniones que vienen.
export function diaSuave(iso: string, ahora: number) {
  const t = new Date(iso).getTime();
  const n = diferenciaDias(t, ahora);
  if (n === 0) return "Hoy";
  if (n === 1) return "Mañana";
  if (n === -1) return "Ayer";
  if (n > 1 && n < 7) {
    const s = new Date(t).toLocaleDateString("es-CO", { weekday: "long", timeZone: ZONA });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  return new Date(t).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: ZONA }).replace(".", "");
}

export const cuandoReunion = (iso: string, ahora: number) => `${diaSuave(iso, ahora)}, ${hora(iso)}`;

// "Hace 2 h", "Ayer", "Hace 3 días", para lo que ya pasó.
export function haceCuanto(iso: string, ahora: number) {
  const min = Math.round((ahora - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  if (min < 60 * 24 && diferenciaDias(new Date(iso).getTime(), ahora) === 0) return `Hace ${Math.round(min / 60)} h`;
  const n = -diferenciaDias(new Date(iso).getTime(), ahora);
  if (n === 1) return "Ayer";
  if (n < 7) return `Hace ${n} días`;
  return diaSuave(iso, ahora);
}
