// Carga 18 interesados inventados en Supabase (ficticio = true). Se puede correr varias veces:
// primero borra los ficticios anteriores. Cada uno pasa por la misma precalificación automática
// que el formulario (registro simulado, correo y origen) y agenda la reunión que le asignó.
//   npm run sembrar
import { createClient } from "@supabase/supabase-js";
import { decidirDestino, type DatosEmpresa } from "../src/lib/demo/formulario.ts";
import { calificar, type Camino, type Resultado } from "../src/lib/puntaje.ts";

type Ficticio = {
  nombre: string;
  celular: string;
  correo: string;
  fuente: string;
  empresa: string;
  tipoEmpresa: DatosEmpresa["tipoEmpresa"];
  erps: string[];
  facturas: DatosEmpresa["facturas"];
  hace: number; // días desde que llenó el formulario
  agendadoEn: number; // días desde hoy
  respuestas?: Record<string, string>; // lo que respondió en la aclaración (casos confusos)
  corregidoA?: Camino; // el equipo lo corrigió en la auditoría
  resultado?: { estado: "cerro" | "seguimiento" | "no_cerro"; motivo: string; nota: string }; // lo que anotó el asesor
};

const FICTICIOS: Ficticio[] = [
  { nombre: "Laura Gómez", celular: "+573005550101", correo: "laura@gomezasociados.co", fuente: "Google", empresa: "Gómez & Asociados Contadores",
    tipoEmpresa: "Firma contable", erps: ["Siigo Nube"], facturas: "Más de 800", hace: 8, agendadoEn: -5,
    resultado: { estado: "cerro", motivo: "Cerró", nota: "Firmó plan de 3 meses para 12 empresas. Inicia la conexión con la DIAN esta semana." } },
  { nombre: "Carlos Méndez", celular: "+573005550102", correo: "cmendez@auditarconsultores.co", fuente: "Página Aliado Siigo", empresa: "Auditar Consultores SAS",
    tipoEmpresa: "Firma contable", erps: ["Siigo Contador", "World Office"], facturas: "Entre 500 y 800", hace: 9, agendadoEn: -6,
    resultado: { estado: "seguimiento", motivo: "Pidió propuesta", nota: "Le gustó la demo. Pide propuesta para 2 sedes; decide con su socio el viernes." } },
  { nombre: "Diana Prieto", celular: "+573005550103", correo: "diana@prietooutsourcing.co", fuente: "LinkedIn", empresa: "Prieto Outsourcing Contable",
    tipoEmpresa: "Firma contable", erps: ["Helisa"], facturas: "Más de 800", hace: 3, agendadoEn: 1 },
  { nombre: "Julián Torres", celular: "+573005550104", correo: "julian@torrescontadores.co", fuente: "Instagram", empresa: "Torres Contadores",
    tipoEmpresa: "Firma contable", erps: ["Alegra"], facturas: "Entre 300 y 500", hace: 10, agendadoEn: -7,
    resultado: { estado: "no_cerro", motivo: "Precio", nota: "Ve el valor, pero el precio supera lo que paga hoy en digitación. Revisar en 2 meses." } },
  { nombre: "Natalia Ruiz", celular: "+573005550105", correo: "nruiz@distribuidoralasabana.co", fuente: "Actualícese", empresa: "Distribuidora La Sabana SAS",
    tipoEmpresa: "Empresa individual", erps: ["Siigo Pyme"], facturas: "Entre 500 y 800", hace: 5, agendadoEn: 2 },
  { nombre: "Felipe Castaño", celular: "+573005550106", correo: "felipecastano.cont@gmail.com", fuente: "Youtube", empresa: "Castaño Asesorías",
    tipoEmpresa: "Contador independiente", erps: ["World Office"], facturas: "Más de 800", hace: 11, agendadoEn: -8,
    resultado: { estado: "no_cerro", motivo: "No asistió", nota: "No se conectó a la reunión ni respondió el mensaje para reagendar." } },
  { nombre: "Sofía Herrera", celular: "+573005550107", correo: "sofiaherrera.trigal@gmail.com", fuente: "TikTok", empresa: "Panadería El Trigal",
    tipoEmpresa: "Empresa individual", erps: ["Loggro"], facturas: "Entre 300 y 500", hace: 7, agendadoEn: -3,
    resultado: { estado: "seguimiento", motivo: "Sin respuesta", nota: "Asistió a la demo grupal y preguntó por el plan pequeño. No respondió el correo de seguimiento." } },
  { nombre: "Mateo Vargas", celular: "+573005550108", correo: "mateo@vargascontable.co", fuente: "Chatbot (ChatGPT, Perplexity, Claude, etc.)", empresa: "Vargas Contable",
    tipoEmpresa: "Contador independiente", erps: ["Contai"], facturas: "Entre 300 y 500", hace: 7, agendadoEn: 2 },
  { nombre: "Camila Ortiz", celular: "+573005550109", correo: "camiortiz92@hotmail.com", fuente: "Facebook", empresa: "Ortiz y Cía",
    tipoEmpresa: "Firma contable", erps: ["Siigo Nube"], facturas: "Entre 300 y 500", hace: 12, agendadoEn: -9,
    resultado: { estado: "no_cerro", motivo: "No es el momento", nota: "Está migrando de ERP. Retomar cuando termine, en enero." } },
  { nombre: "Ricardo Salazar", celular: "+573005550110", correo: "rsalazar@grupoandino.co", fuente: "Referido", empresa: "Grupo Empresarial Andino",
    tipoEmpresa: "Firma contable", erps: ["Siesa Enterprise", "Siigo Nube", "Odoo"], facturas: "Más de 800", hace: 6, agendadoEn: -2,
    resultado: { estado: "seguimiento", motivo: "Pidió propuesta", nota: "Requiere integración con 3 ERP y piloto en una unidad de negocio. Pendiente reunión técnica." } },
  { nombre: "Paola Jiménez", celular: "+573005550111", correo: "paola@jimenezcontadores.co", fuente: "WhatsApp", empresa: "Jiménez Contadores Públicos",
    tipoEmpresa: "Firma contable", erps: ["Helisa"], facturas: "Entre 500 y 800", hace: 9, agendadoEn: -4,
    resultado: { estado: "cerro", motivo: "Cerró", nota: "Cerró plan empresarial. Pidió capacitación para 6 analistas." } },
  { nombre: "Esteban Molina", celular: "+573005550112", correo: "esteban@ferreteriamolina.co", fuente: "Google", empresa: "Ferretería Molina",
    tipoEmpresa: "Empresa individual", erps: ["Alegra"], facturas: "Menos de 300", hace: 4, agendadoEn: 2 },
  // Casos confusos: la aclaración resolvió el primero sola; el segundo pasó a auditoría.
  { nombre: "Andrés Rojas", celular: "+573005550113", correo: "andres@inversionesrojas.co", fuente: "Google", empresa: "Inversiones Rojas",
    tipoEmpresa: "Empresa individual", erps: ["Siigo Pyme", "Alegra", "World Office"], facturas: "Más de 800", hace: 1, agendadoEn: 3,
    respuestas: { erps: "De las empresas que atiendo", volumen: "De las empresas que atiendo" } },
  { nombre: "Marcela Duarte", celular: "+573005550114", correo: "marcela@comercializadoraduarte.co", fuente: "Facebook", empresa: "Comercializadora Duarte",
    tipoEmpresa: "Empresa individual", erps: ["Siigo Nube"], facturas: "Más de 800", hace: 2, agendadoEn: 2,
    respuestas: { volumen: "Solo de mi empresa" } },
  { nombre: "Héctor Pardo", celular: "+573005550115", correo: "hector@solucionespardo.co", fuente: "LinkedIn", empresa: "Soluciones Integrales Pardo",
    tipoEmpresa: "Firma contable", erps: ["Siigo Nube", "Alegra"], facturas: "Entre 500 y 800", hace: 3, agendadoEn: 1,
    respuestas: { actividad: "Sí, de varias empresas" } },
  { nombre: "Jairo Ramírez", celular: "+573005550116", correo: "jairoramirez.cont@gmail.com", fuente: "Instagram", empresa: "Contabilidad JR",
    tipoEmpresa: "Firma contable", erps: ["Siigo Contador"], facturas: "Más de 800", hace: 2, agendadoEn: 6,
    respuestas: { registro: "Aún no está registrada" } },
  // Agendó pero no respondió la aclaración.
  { nombre: "Lucía Bernal", celular: "+573005550117", correo: "lucia@agroinsumosdelllano.co", fuente: "Email", empresa: "Agroinsumos del Llano",
    tipoEmpresa: "Empresa individual", erps: ["Siigo Pyme", "Odoo", "Loggro"], facturas: "Entre 500 y 800", hace: 1, agendadoEn: 2 },
  // Pasó a revisión humana y el equipo la corrigió.
  { nombre: "Óscar Montoya", celular: "+573005550118", correo: "oscar@textilesmontoya.co", fuente: "Google", empresa: "Textiles Montoya",
    tipoEmpresa: "Empresa individual", erps: ["World Office"], facturas: "Más de 800", hace: 5, agendadoEn: 3,
    respuestas: { volumen: "Solo de mi empresa" }, corregidoA: "sesion_grupal" },
];

function diasDesdeHoy(dias: number, hora: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, 0, 0, 0);
  return d.toISOString();
}

const url = process.env.SUPABASE_URL;
const clave = process.env.SUPABASE_SECRET_KEY;
if (!url || !clave) throw new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY (corre con --env-file=.env.local)");
const db = createClient(url, clave, { auth: { persistSession: false } });

const filas = FICTICIOS.map((f) => {
  const destinoCifrato = decidirDestino({ tipoEmpresa: f.tipoEmpresa, nombreEmpresa: f.empresa, erps: f.erps, facturas: f.facturas }).tipo;
  const entrada = { nombreEmpresa: f.empresa, tipoEmpresa: f.tipoEmpresa, facturas: f.facturas, erps: f.erps, correo: f.correo, fuente: f.fuente, destinoCifrato };
  const inicial: Resultado = calificar(entrada);
  const r = calificar({ ...entrada, respuestas: f.respuestas });
  const camino = f.corregidoA ?? r.camino;
  const auditoria = f.corregidoA ? { decision: "corregido", de: r.camino, a: f.corregidoA, fecha: diasDesdeHoy(-f.hace + 1, 10) } : undefined;
  return {
    creado: diasDesdeHoy(-f.hace, 9 + (f.hace % 8)),
    nombre: f.nombre,
    celular: f.celular,
    correo: f.correo,
    fuente: f.fuente,
    tipo_empresa: f.tipoEmpresa,
    nombre_empresa: f.empresa,
    erps: f.erps,
    rango_facturas: f.facturas,
    destino_cifrato: destinoCifrato,
    estado: "agendado",
    puntaje: r.camino === "filtrado" ? null : r.puntaje,
    detalle_puntaje: {
      senales: r.detalle,
      excepciones: r.excepciones,
      registro: r.registro,
      dudas: r.dudas,
      aclaracion: r.aclaracion,
      cuenta_grande: r.cuentaGrande,
      camino_inicial: inicial.camino,
      ...(auditoria ? { auditoria } : {}),
      ...(f.resultado ? { resultado: { ...f.resultado, fecha: diasDesdeHoy(f.agendadoEn, 17) } } : {}),
    },
    camino,
    resumen_humano: r.analisis,
    minutos_ahorrados: f.corregidoA ? 30 : r.minutosAhorrados,
    agendado_para: diasDesdeHoy(f.agendadoEn, 8 + (f.agendadoEn % 6)),
    ficticio: true,
  };
});

const borrado = await db.from("leads").delete().eq("ficticio", true);
if (borrado.error) throw borrado.error;
const { error } = await db.from("leads").insert(filas);
if (error) throw error;

console.log(`Listo: ${filas.length} interesados ficticios.`);
console.table(filas.map((f) => ({ empresa: f.nombre_empresa, puntaje: f.puntaje, inicial: f.detalle_puntaje.camino_inicial, camino: f.camino, cifrato: f.destino_cifrato })));
