// Registro de empresas SIMULADO. En la versión real sería la consulta de RUT/RUES que Cifrato
// ya tiene como herramienta gratuita en su sitio. Aquí son empresas inventadas.

export type Registro = {
  nit: string;
  actividad: string; // código CIIU y descripción
  empleados: number;
  ciudad: string;
  desde: number; // año de matrícula
};

const CONTABLE = "6920 · Actividades de contabilidad y auditoría";

const EMPRESAS: Record<string, Registro> = {
  "gomez & asociados contadores": { nit: "900.512.338-1", actividad: CONTABLE, empleados: 28, ciudad: "Bogotá", desde: 2011 },
  "auditar consultores sas": { nit: "901.104.725-6", actividad: CONTABLE, empleados: 45, ciudad: "Medellín", desde: 2016 },
  "prieto outsourcing contable": { nit: "900.877.214-3", actividad: CONTABLE, empleados: 19, ciudad: "Cali", desde: 2014 },
  "torres contadores": { nit: "901.332.908-2", actividad: CONTABLE, empleados: 7, ciudad: "Bucaramanga", desde: 2019 },
  "distribuidora la sabana sas": { nit: "830.145.662-9", actividad: "4690 · Comercio al por mayor no especializado", empleados: 60, ciudad: "Chía", desde: 2005 },
  "castano asesorias": { nit: "1.020.443.871-5", actividad: CONTABLE, empleados: 2, ciudad: "Pereira", desde: 2020 },
  "panaderia el trigal": { nit: "901.587.120-4", actividad: "1081 · Elaboración de productos de panadería", empleados: 9, ciudad: "Tunja", desde: 2021 },
  "vargas contable": { nit: "1.098.765.432-1", actividad: CONTABLE, empleados: 1, ciudad: "Manizales", desde: 2023 },
  "grupo empresarial andino": { nit: "860.044.517-8", actividad: CONTABLE, empleados: 310, ciudad: "Bogotá", desde: 1998 },
  "jimenez contadores publicos": { nit: "900.233.786-0", actividad: CONTABLE, empleados: 240, ciudad: "Barranquilla", desde: 2008 },
  "inversiones rojas": { nit: "901.702.355-3", actividad: "4659 · Comercio de maquinaria y equipo", empleados: 3, ciudad: "Bogotá", desde: 2022 },
  "comercializadora duarte": { nit: "901.811.046-9", actividad: "4799 · Comercio al por menor no especializado", empleados: 2, ciudad: "Ibagué", desde: 2024 },
  "soluciones integrales pardo": { nit: "901.245.630-8", actividad: "7020 · Consultoría de gestión", empleados: 12, ciudad: "Bogotá", desde: 2017 },
  "agroinsumos del llano": { nit: "900.611.482-5", actividad: "4620 · Comercio de materias primas agropecuarias", empleados: 15, ciudad: "Villavicencio", desde: 2015 },
  "textiles montoya": { nit: "901.733.904-1", actividad: "1392 · Confección de artículos textiles", empleados: 4, ciudad: "Itagüí", desde: 2023 },
  "ferreteria molina": { nit: "901.665.019-7", actividad: "4752 · Comercio de ferretería", empleados: 4, ciudad: "Neiva", desde: 2022 },
};

const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

export function buscarEmpresa(nombre: string): Registro | null {
  return EMPRESAS[normalizar(nombre)] ?? null;
}

export const esContable = (r: Registro | null) => !!r && r.actividad.startsWith("6920");
