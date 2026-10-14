// Estimación del volumen de facturas de compra. El número que escribe el interesado no es
// confiable, así que el sistema lo estima con datos públicos y lo usa para verificar lo declarado.
// En la versión real, los factores se calibran con el volumen real de los clientes actuales de
// Cifrato (sector, tamaño y facturas que de verdad procesan). Aquí son supuestos.
import type { Registro } from "./registro.ts";

// Facturas de compra al mes por empleado, según la actividad (CIIU). Supuestos.
const POR_EMPLEADO: { prefijo: string; factor: number }[] = [
  { prefijo: "56", factor: 25 }, // restaurantes: compran a diario
  { prefijo: "46", factor: 14 }, // comercio al por mayor
  { prefijo: "47", factor: 12 }, // comercio al por menor
  { prefijo: "10", factor: 10 }, // alimentos
  { prefijo: "13", factor: 8 }, // textiles
];
const POR_EMPLEADO_OTROS = 5;

// Facturas de compra al mes de una empresa cliente típica de una firma. Supuesto: la firma típica
// maneja de 3 a 20 empresas con 500 a 1.500 facturas al mes (Forbes, mar 2026), unas 70 por empresa.
const POR_EMPRESA_CLIENTE = 70;
const MITAD_RANGO: Record<string, number> = { "1 a 5": 3, "6 a 20": 12, "21 a 50": 35, "Más de 50": 60 };

// Rango declarado en el formulario, en números.
const DECLARADO: Record<string, [number, number]> = {
  "Menos de 300": [0, 300],
  "Entre 300 y 500": [300, 500],
  "Entre 500 y 800": [500, 800],
  "Más de 800": [800, Infinity],
};

export type Volumen = {
  estimado: number | null; // null: no hay con qué estimar
  fuente: string; // de dónde sale la estimación
  cuadra: boolean | null; // ¿lo declarado coincide con lo estimado? null si no hay estimación
};

export function estimarVolumen(tipo: string, registro: Registro | null, empresas: string, declarado: string): Volumen {
  let estimado: number | null = null;
  let fuente = "Sin datos para estimar: se usa lo declarado";

  if ((tipo === "Firma contable" || tipo === "Contador independiente") && MITAD_RANGO[empresas]) {
    estimado = MITAD_RANGO[empresas] * POR_EMPRESA_CLIENTE;
    fuente = `${empresas} empresas × ${POR_EMPRESA_CLIENTE} facturas por empresa`;
  } else if (registro && tipo === "Empresa individual") {
    // Para una firma, su propio registro no dice nada de su volumen: se estima por sus empresas.
    const factor = POR_EMPLEADO.find((p) => registro.actividad.startsWith(p.prefijo))?.factor ?? POR_EMPLEADO_OTROS;
    estimado = Math.max(registro.empleados * factor, 10);
    fuente = `${registro.empleados} empleados × ${factor} facturas por empleado (${registro.actividad.split(" · ")[1].toLowerCase()})`;
  }

  // Cuadra si el estimado cae en el rango declarado, con margen del 50 % (es una estimación).
  const r = DECLARADO[declarado];
  const cuadra = estimado === null || !r ? null : estimado >= r[0] * 0.5 && estimado <= r[1] * 1.5;
  return { estimado, fuente, cuadra };
}

// El volumen con el que se califica: el estimado si existe; si no, el punto medio de lo declarado.
export function volumenParaCalificar(v: Volumen, declarado: string): number {
  if (v.estimado !== null) return v.estimado;
  const r = DECLARADO[declarado];
  return r ? (r[1] === Infinity ? 900 : (r[0] + r[1]) / 2) : 0;
}
