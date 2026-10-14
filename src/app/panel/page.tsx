import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Panel, EsqueletoPanel } from "@/components/panel/Panel";
import { supabaseServidor } from "@/lib/supabase";
import type { Lead } from "@/lib/panel";

export const metadata: Metadata = {
  title: "Panel de precalificación · Prototipo",
};

// Los datos cambian con cada interesado y cada auditoría: se leen en cada visita.
// La hora de lectura viaja con los datos, para que servidor y navegador calculen igual "Hace 2 h".
async function leer() {
  await connection();
  const { data, error } = await supabaseServidor().from("leads").select("*").order("creado", { ascending: false });
  if (error) throw new Error(error.message);
  return { leads: (data ?? []) as Lead[], ahora: Date.now() };
}

async function DatosPanel() {
  const { leads, ahora } = await leer();
  return <Panel leads={leads} ahora={ahora} />;
}

export default function PaginaPanel() {
  return (
    <Suspense fallback={<EsqueletoPanel />}>
      <DatosPanel />
    </Suspense>
  );
}
