// Réplica del formulario de demo de Cifrato (Fillout, id 4oR7zavS9Qus), leído el 13 oct 2026.
// Textos, opciones y orden copiados tal cual, incluso los que vienen así en el original.

export const OPCIONES_FUENTE = [
  "Instagram",
  "Facebook",
  "TikTok",
  "UltimaHoraCol",
  "Actualícese",
  "LinkedIn",
  "Email",
  "Youtube",
  "Google",
  "WhatsApp",
  "Llamada",
  "Página Aliado Siigo",
  "Referido",
  "Computrabajo",
  "Chatbot (ChatGPT, Perplexity, Claude, etc.)",
  "Forbes",
] as const;

export const OPCIONES_TIPO_EMPRESA = ["Firma contable", "Empresa individual", "Contador independiente"] as const;

export const OPCIONES_ERP = [
  "Siigo Nube",
  "Siigo Contador",
  "Siigo Pyme",
  "World Office",
  "Helisa",
  "Contai",
  "Odoo",
  "Siesa Enterprise",
  "Siesa SBS",
  "Alegra",
  "Loggro",
  "Otro",
] as const;

export const OPCIONES_FACTURAS = ["Más de 800", "Entre 500 y 800", "Entre 300 y 500", "Menos de 300"] as const;

export type TipoEmpresa = (typeof OPCIONES_TIPO_EMPRESA)[number];
export type RangoFacturas = (typeof OPCIONES_FACTURAS)[number];

export type DatosContacto = {
  nombre: string;
  celular: string; // formato +57XXXXXXXXXX
  correo: string;
  fuente: string; // una de OPCIONES_FUENTE o el texto libre de "Otro"
};

// Pregunta nueva: solo para firmas contables y contadores. Con esto se estima su volumen.
export const OPCIONES_EMPRESAS = ["1 a 5", "6 a 20", "21 a 50", "Más de 50"] as const;
export type RangoEmpresas = (typeof OPCIONES_EMPRESAS)[number];

// Firmas y contadores manejan varias empresas; la empresa individual solo la suya.
export const manejaEmpresas = (t: string) => t === "Firma contable" || t === "Contador independiente";

export type DatosEmpresa = {
  tipoEmpresa: TipoEmpresa | "";
  nombreEmpresa: string;
  nit: string; // nuevo, opcional: con él se consulta el registro
  erps: string[];
  empresas: RangoEmpresas | ""; // nuevo: solo firmas y contadores
  facturas: RangoFacturas | "";
};

// Validaciones del original.
export const REGEX_CELULAR = /^\+573\d{9}$/;
export const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_NIT = /^\d{9,10}$/; // sin puntos ni dígito de verificación

export type Destino =
  | { tipo: "erp_no_soportado" }
  | { tipo: "descubrimiento"; nivel: "alto" | "medio" }
  | { tipo: "demo_grupal" }
  | { tipo: "auto_onboarding" };

// Mismo orden de ramas que el botón del paso 2 en Fillout: gana la primera que se cumpla.
// (La rama "Prueba directa" de 60 min existe en el original pero depende de una pregunta
// que tienen oculta, así que nunca se activa y no se replica.)
export function decidirDestino(d: DatosEmpresa): Destino {
  if (d.erps.length === 1 && d.erps[0] === "Otro") return { tipo: "erp_no_soportado" };
  if (d.facturas === "Más de 800") return { tipo: "descubrimiento", nivel: "alto" };
  if (d.facturas === "Entre 500 y 800") return { tipo: "descubrimiento", nivel: "alto" };
  if (
    d.facturas === "Entre 300 y 500" &&
    (d.tipoEmpresa === "Firma contable" || d.tipoEmpresa === "Empresa individual")
  ) {
    return { tipo: "descubrimiento", nivel: "medio" };
  }
  if (d.facturas === "Menos de 300" || d.tipoEmpresa === "Contador independiente") {
    return { tipo: "demo_grupal" };
  }
  return { tipo: "auto_onboarding" };
}
