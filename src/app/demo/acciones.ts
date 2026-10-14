"use server";

import { supabaseServidor } from "@/lib/supabase";
import { calificar, type Camino, type DudaPublica, type Resultado } from "@/lib/puntaje";
import {
  OPCIONES_EMPRESAS,
  OPCIONES_FACTURAS,
  OPCIONES_TIPO_EMPRESA,
  REGEX_NIT,
  manejaEmpresas,
  REGEX_CELULAR,
  REGEX_CORREO,
  decidirDestino,
  type DatosContacto,
  type DatosEmpresa,
} from "@/lib/demo/formulario";

// Al responder la última pregunta: valida de nuevo (lo que llega del navegador no es confiable),
// precalifica con las señales automáticas, guarda y devuelve qué reunión agendar.
export async function precalificarYGuardar(
  contacto: DatosContacto,
  fuenteOtro: string,
  empresa: DatosEmpresa,
): Promise<{ id: string | null; camino: Camino | null; dudas: DudaPublica[] }> {
  const valido =
    contacto.nombre.trim().length >= 3 &&
    REGEX_CELULAR.test(contacto.celular) &&
    REGEX_CORREO.test(contacto.correo.trim()) &&
    contacto.fuente !== "" &&
    (OPCIONES_TIPO_EMPRESA as readonly string[]).includes(empresa.tipoEmpresa) &&
    empresa.nombreEmpresa.trim() !== "" &&
    empresa.erps.length > 0 &&
    (empresa.nit === "" || REGEX_NIT.test(empresa.nit)) &&
    (!manejaEmpresas(empresa.tipoEmpresa) || (OPCIONES_EMPRESAS as readonly string[]).includes(empresa.empresas)) &&
    (OPCIONES_FACTURAS as readonly string[]).includes(empresa.facturas);
  if (!valido) return { id: null, camino: null, dudas: [] };

  const destinoCifrato = decidirDestino(empresa).tipo;
  const r = calificar({
    nombreEmpresa: empresa.nombreEmpresa.trim(),
    nit: empresa.nit,
    empresas: manejaEmpresas(empresa.tipoEmpresa) ? empresa.empresas : "",
    tipoEmpresa: empresa.tipoEmpresa,
    facturas: empresa.facturas,
    erps: empresa.erps,
    correo: contacto.correo.trim(),
    fuente: contacto.fuente,
    destinoCifrato,
  });

  const { data, error } = await supabaseServidor()
    .from("leads")
    .insert({
      nombre: contacto.nombre.trim(),
      celular: contacto.celular,
      correo: contacto.correo.trim().toLowerCase(),
      fuente: contacto.fuente,
      fuente_otro: contacto.fuente === "Otro" ? fuenteOtro.trim() : null,
      tipo_empresa: empresa.tipoEmpresa,
      nombre_empresa: empresa.nombreEmpresa.trim(),
      erps: empresa.erps,
      rango_facturas: empresa.facturas,
      destino_cifrato: destinoCifrato,
      estado: "calificado",
      ...columnasCalificacion(r, r.camino, { nit: empresa.nit, empresas: empresa.empresas }),
    })
    .select("id")
    .single();

  if (error) console.error("precalificarYGuardar:", error.message);
  return { id: data?.id ?? null, camino: r.camino, dudas: r.dudas };
}

export async function marcarAgendado(id: string, cuando: string) {
  const { error } = await supabaseServidor()
    .from("leads")
    .update({ estado: "agendado", agendado_para: cuando })
    .eq("id", id);
  if (error) console.error("marcarAgendado:", error.message);
}

// Capa 2: con las respuestas de la aclaración, vuelve a calificar con los datos guardados y reasigna.
export async function aclarar(id: string, respuestas: Record<string, string>): Promise<{ camino: Camino | null }> {
  const db = supabaseServidor();
  const { data: lead, error } = await db.from("leads").select("*").eq("id", id).single();
  if (error || !lead) return { camino: null };
  const r = calificar({
    nombreEmpresa: lead.nombre_empresa,
    nit: lead.detalle_puntaje?.registro?.nit ?? lead.detalle_puntaje?.nit ?? "",
    empresas: lead.detalle_puntaje?.empresas ?? "",
    tipoEmpresa: lead.tipo_empresa,
    facturas: lead.rango_facturas,
    erps: lead.erps,
    correo: lead.correo,
    fuente: lead.fuente,
    destinoCifrato: lead.destino_cifrato,
    respuestas,
  });
  const inicial = lead.detalle_puntaje?.camino_inicial ?? lead.camino;
  const { error: e2 } = await db.from("leads").update(columnasCalificacion(r, inicial, lead.detalle_puntaje)).eq("id", id);
  if (e2) console.error("aclarar:", e2.message);
  return { camino: r.camino };
}

// Lo que se guarda de la calificación. camino_inicial: el que tenía antes de aclarar, para el panel.
// nit y empresas viajan en detalle_puntaje para no cambiar la tabla.
function columnasCalificacion(r: Resultado, caminoInicial: Camino, previo: { nit?: string; empresas?: string } = {}) {
  return {
    puntaje: r.camino === "filtrado" ? null : r.puntaje,
    detalle_puntaje: {
      nit: previo.nit || undefined,
      empresas: previo.empresas || undefined,
      volumen: r.volumen,
      senales: r.detalle,
      excepciones: r.excepciones,
      registro: r.registro,
      dudas: r.dudas,
      aclaracion: r.aclaracion,
      cuenta_grande: r.cuentaGrande,
      camino_inicial: caminoInicial,
    },
    camino: r.camino,
    resumen_humano: r.analisis,
    minutos_ahorrados: r.minutosAhorrados,
  };
}
