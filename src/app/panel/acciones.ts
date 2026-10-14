"use server";

import { refresh } from "next/cache";
import { supabaseServidor } from "@/lib/supabase";
import type { Camino } from "@/lib/puntaje";

const CAMINOS: Camino[] = ["demo_directa", "descubrimiento", "sesion_grupal", "persona"];
// Minutos liberados por camino (los mismos de puntaje.ts), para que corregir actualice las horas.
const MINUTOS: Record<string, number> = { demo_directa: 30, descubrimiento: 0, sesion_grupal: 30, persona: 20 };

// Capa 3: el humano aprueba la decisión automática o la corrige. Cada corrección queda registrada
// para ajustar las reglas después; es lo que mide la precisión del sistema.
export async function auditar(id: string, a?: Camino) {
  if (a && !CAMINOS.includes(a)) return;
  const db = supabaseServidor();
  const { data: lead, error } = await db.from("leads").select("camino, detalle_puntaje").eq("id", id).single();
  if (error || !lead) return;

  const corregido = !!a && a !== lead.camino;
  const auditoria = { decision: corregido ? "corregido" : "aprobado", de: lead.camino, a: corregido ? a : lead.camino, fecha: new Date().toISOString() };
  const { error: e2 } = await db
    .from("leads")
    .update({
      detalle_puntaje: { ...lead.detalle_puntaje, auditoria },
      ...(corregido ? { camino: a, minutos_ahorrados: MINUTOS[a!] } : {}),
    })
    .eq("id", id);
  if (e2) console.error("auditar:", e2.message);
  refresh();
}

