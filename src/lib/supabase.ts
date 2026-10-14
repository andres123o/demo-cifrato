import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la clave secreta: solo se usa en el servidor, nunca llega al navegador.
export function supabaseServidor() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clave) throw new Error("Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local");
  return createClient(url, clave, { auth: { persistSession: false } });
}
