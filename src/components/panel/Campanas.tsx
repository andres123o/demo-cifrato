"use client";

// Campañas de seguimiento. El sistema escribe en HubSpot dónde quedó cada interesado y lo que anotó
// el asesor; los workflows de HubSpot se activan con esos datos. Aquí se ve cada campaña encendida,
// quiénes están dentro y su flujo. Es una muestra: no envía nada.
import { Fragment, createContext, useContext, useState, type ReactNode } from "react";
import { Clock, Flag, Mail, MessageCircle, RefreshCw, Split, UserRound, Zap, type LucideIcon } from "lucide-react";
import { CAMPANAS, PROPIEDADES, avance, campanaDe, diasDe, type Campana, type PasoCampana } from "@/lib/campanas";
import { destino, type Lead } from "@/lib/panel";
import { ChipDestino } from "./piezas";

type Pestana = "personas" | "flujo";

// Lo que el lienzo necesita saber de cada paso: su día y quiénes están ahí ahora.
const Contexto = createContext<{ dias: Map<PasoCampana, number>; aqui: Map<PasoCampana, Lead[]>; conDias: boolean }>({
  dias: new Map(),
  aqui: new Map(),
  conDias: true,
});

export function Campanas({
  leads,
  ahora,
  elegida,
  onElegir,
  onAbrir,
}: {
  leads: Lead[];
  ahora: number;
  elegida: string;
  onElegir: (id: string) => void;
  onAbrir: (id: string) => void;
}) {
  const [pestana, setPestana] = useState<Pestana>("flujo");
  const enCampana = (c: Campana) => leads.filter((l) => campanaDe(l, ahora)?.id === c.id);
  const c = CAMPANAS.find((x) => x.id === elegida) ?? CAMPANAS[0];
  const personas = enCampana(c).map((l) => ({ l, a: avance(l, c, ahora) }));

  const aqui = new Map<PasoCampana, Lead[]>();
  for (const { l, a } of personas) if (a.ultimo) aqui.set(a.ultimo, [...(aqui.get(a.ultimo) ?? []), l]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold tracking-[-0.025em]">Campañas de seguimiento</h1>
        <span className="inline-flex items-center gap-2 rounded-full border border-linea bg-tarjeta px-3 py-1.5 text-[13px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primario/60 motion-reduce:hidden" />
            <span className="relative h-2 w-2 rounded-full bg-primario" />
          </span>
          Conectado a HubSpot
        </span>
      </div>

      {/* Campañas encendidas */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPANAS.map((x) => {
          const n = enCampana(x).length;
          const sel = x.id === c.id;
          const canales = new Set(JSON.stringify(x.pasos).match(/"canal":"(\w+)"/g)?.map((m) => m.split('"')[3]));
          return (
            <button
              key={x.id}
              type="button"
              aria-pressed={sel}
              onClick={() => onElegir(x.id)}
              className={
                "flex flex-col rounded-2xl border bg-tarjeta p-4 text-left outline-none transition-[border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-respuesta/20 " +
                (sel ? "border-respuesta shadow-[0_6px_24px_-12px_rgb(3_19_34/0.3)]" : "border-linea hover:border-borde")
              }
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-tenue">{x.grupo}</span>
                <Interruptor />
              </span>
              <span className="mt-2.5 text-[15px] font-bold leading-tight">{x.nombre}</span>
              <span className="mt-4 flex items-end justify-between">
                <span className="text-[24px] font-bold leading-none tracking-[-0.02em]">
                  {n} <span className="text-[13px] font-semibold tracking-normal text-tenue">{n === 1 ? "persona" : "personas"}</span>
                </span>
                <span className="flex gap-1 text-tenue">
                  {canales.has("whatsapp") && <MessageCircle className="h-4 w-4" aria-label="WhatsApp" />}
                  {canales.has("email") && <Mail className="h-4 w-4" aria-label="Correo" />}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Campaña elegida */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-linea bg-tarjeta">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-linea px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[19px] font-bold tracking-[-0.02em]">{c.nombre}</h2>
          </div>
          <div role="tablist" className="flex rounded-xl bg-respuesta/[0.05] p-1">
            {(
              [
                ["flujo", "Flujo"],
                ["personas", `Personas ${personas.length}`],
              ] as const
            ).map(([k, t]) => (
              <button
                key={k}
                role="tab"
                aria-selected={pestana === k}
                onClick={() => setPestana(k)}
                className={
                  "rounded-lg px-4 py-1.5 text-[13.5px] font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-respuesta/20 " +
                  (pestana === k ? "bg-tarjeta shadow-[0_1px_3px_rgb(3_19_34/0.1)]" : "text-tenue hover:text-respuesta")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {pestana === "personas" ? (
          <div>
            <dl className="grid gap-4 border-b border-linea px-5 py-4 text-[13.5px] sm:grid-cols-2 sm:px-6">
              <Meta k="Objetivo" v={c.objetivo} />
              <Meta k="Sale cuando" v={c.sale} />
            </dl>
            {personas.length === 0 ? (
              <p className="px-6 py-14 text-center text-[14px] text-tenue">Nadie en esta campaña por ahora.</p>
            ) : (
              <ul>
                {personas.map(({ l, a }) => (
                  <li key={l.id} className="border-b border-linea last:border-b-0">
                    <button
                      type="button"
                      onClick={() => onAbrir(l.id)}
                      className="grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3 text-left outline-none transition-colors hover:bg-respuesta/[0.02] focus-visible:bg-respuesta/[0.04] sm:px-6 md:grid-cols-[32px_minmax(0,1fr)_120px_minmax(0,1fr)]"
                    >
                      <Iniciales nombre={l.nombre} />
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold">{l.nombre_empresa}</span>
                        <span className="mt-0.5 block">
                          <ChipDestino d={destino(l)} tamano="sm" />
                        </span>
                      </span>
                      <span className="flex gap-1" aria-label={`${a.hechos} de ${a.total} pasos`}>
                        {Array.from({ length: a.total }, (_, i) => (
                          <span key={i} className={"h-1.5 w-4 rounded-full " + (i < a.hechos ? "bg-respuesta" : "bg-respuesta/[0.1]")} />
                        ))}
                      </span>
                      <span className="col-span-3 flex min-w-0 items-center gap-2 text-[13px] md:col-span-1 md:justify-end">
                        {a.siguiente ? (
                          <>
                            <IconoPaso paso={a.siguiente} />
                            <span className="truncate font-semibold">{a.siguiente.titulo}</span>
                            <span className="shrink-0 text-tenue">{a.enDias ? `en ${a.enDias} ${a.enDias === 1 ? "día" : "días"}` : "hoy"}</span>
                          </>
                        ) : (
                          <span className="text-tenue">Sin pasos pendientes</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-2 border-b border-linea px-5 py-3.5 sm:px-6">
              <span className="mr-1 text-[13px] font-semibold text-tenue">Datos que envía el sistema a HubSpot</span>
              {PROPIEDADES.map((p) => (
                <span key={p} className="rounded-md bg-respuesta/[0.05] px-2 py-0.5 font-mono text-[11.5px]">
                  {p}
                </span>
              ))}
            </div>
            <div
              className="overflow-x-auto bg-fondo/60 px-4 py-10 [scrollbar-width:thin]"
              style={{ backgroundImage: "radial-gradient(rgb(3 19 34 / 0.09) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            >
              <Contexto.Provider value={{ dias: diasDe(c), aqui, conDias: c.id !== "antes" && c.id !== "aclaracion" }}>
                <div className="mx-auto flex w-max min-w-full flex-col items-center">
                  <Nodo icono={Zap} tono="disparador" etiqueta="Se activa cuando" titulo={c.disparador} />
                  <Pasos pasos={c.pasos} />
                </div>
              </Contexto.Provider>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Interruptor() {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-primario-oscuro">
      Activa
      <span className="relative h-[18px] w-[30px] rounded-full bg-primario">
        <span className="absolute right-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm" />
      </span>
    </span>
  );
}

function IconoPaso({ paso: p }: { paso: PasoCampana }) {
  const Icono = p.tipo === "mensaje" ? (p.canal === "email" ? Mail : MessageCircle) : UserRound;
  const tono = p.tipo === "mensaje" ? p.canal : "tarea";
  return (
    <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-md " + TONOS[tono]}>
      <Icono className="h-3.5 w-3.5" strokeWidth={2.2} />
    </span>
  );
}

// ── Lienzo ────────────────────────────────────────────────────────────

const Linea = ({ alto = "h-7" }: { alto?: string }) => <span className={"w-px bg-borde-fuerte/50 " + alto} />;

function Pasos({ pasos }: { pasos: PasoCampana[] }) {
  return (
    <>
      {pasos.map((p, i) =>
        p.tipo === "espera" ? (
          // La espera va sobre la línea, no como una caja más.
          <Fragment key={i}>
            <Linea alto="h-3" />
            <span className="flex items-center gap-1.5 py-1 text-[12.5px] font-medium text-tenue">
              <Clock className="h-3.5 w-3.5" />
              {p.texto ?? `Esperar ${p.dias} ${p.dias === 1 ? "día" : "días"}`}
            </span>
            <Linea alto="h-3" />
            {pasos[i + 1]?.tipo === "espera" && <Linea alto="h-1" />}
          </Fragment>
        ) : (
          <Fragment key={i}>
            {pasos[i - 1]?.tipo !== "espera" && <Linea />}
            <PasoVista paso={p} />
          </Fragment>
        ),
      )}
    </>
  );
}

function PasoVista({ paso: p }: { paso: PasoCampana }) {
  if (p.tipo === "mensaje")
    return <Nodo paso={p} icono={p.canal === "email" ? Mail : MessageCircle} tono={p.canal} etiqueta={p.canal === "email" ? "Correo" : "WhatsApp"} titulo={p.titulo} texto={p.texto} />;
  if (p.tipo === "tarea") return <Nodo paso={p} icono={UserRound} tono="tarea" etiqueta="Tarea del asesor" titulo={p.titulo} texto={p.texto} />;
  if (p.tipo === "actualizar") return <Nodo icono={RefreshCw} tono="actualizar" etiqueta="Actualiza HubSpot" titulo={p.titulo} />;
  if (p.tipo === "fin")
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-respuesta/[0.06] px-3 py-1.5 text-[12.5px] font-semibold text-tenue">
        <Flag className="h-3.5 w-3.5" />
        {p.titulo}
      </span>
    );
  if (p.tipo !== "condicion") return null;

  // Condición: se abre en ramas y se vuelven a unir abajo.
  return (
    <div className="flex flex-col items-center">
      <span className="flex items-center gap-2 rounded-full border border-[rgb(124_92_200/0.3)] bg-[rgb(124_92_200/0.07)] px-4 py-2 text-[13.5px] font-semibold text-[rgb(92_64_170)]">
        <Split className="h-4 w-4 rotate-90" />
        {p.pregunta}
      </span>
      <Linea alto="h-4" />
      <div className="flex items-stretch gap-8">
        {p.ramas.map((r, i) => (
          <div key={r.nombre} className="relative flex flex-col items-center">
            <span className="absolute top-0 h-px bg-borde-fuerte/50" style={{ left: i === 0 ? "50%" : "-16px", right: i === p.ramas.length - 1 ? "50%" : "-16px" }} />
            <Linea alto="h-4" />
            <span className="rounded-full bg-respuesta px-2.5 py-0.5 text-[11.5px] font-bold text-white">{r.nombre}</span>
            <Pasos pasos={r.pasos} />
            <span className="min-h-5 w-px flex-1 bg-borde-fuerte/50" />
            <span className="absolute bottom-0 h-px bg-borde-fuerte/50" style={{ left: i === 0 ? "50%" : "-16px", right: i === p.ramas.length - 1 ? "50%" : "-16px" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const TONOS = {
  disparador: "bg-respuesta text-white",
  email: "bg-[rgb(47_84_128/0.12)] text-[rgb(47_84_128)]",
  whatsapp: "bg-primario/[0.14] text-primario-oscuro",
  tarea: "bg-c-humano/[0.14] text-[rgb(146_84_8)]",
  actualizar: "bg-respuesta/[0.07] text-respuesta",
};

function Nodo({
  paso,
  icono: Icono,
  tono,
  etiqueta,
  titulo,
  texto,
}: {
  paso?: PasoCampana;
  icono: LucideIcon;
  tono: keyof typeof TONOS;
  etiqueta: string;
  titulo: string;
  texto?: string;
}) {
  const { dias, aqui, conDias } = useContext(Contexto);
  const dia = paso ? dias.get(paso) : undefined;
  const gente = paso ? (aqui.get(paso) ?? []) : [];
  return (
    <div className="relative w-[320px] rounded-2xl border border-linea bg-tarjeta p-4 shadow-[0_1px_2px_rgb(3_19_34/0.04)]">
      <div className="flex items-center gap-2.5">
        <span className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " + TONOS[tono]}>
          <Icono className="h-4 w-4" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold text-tenue">{etiqueta}</span>
          <span className="block text-[14.5px] font-bold leading-tight">{titulo}</span>
        </span>
        {conDias && dia !== undefined && <span className="shrink-0 rounded-md bg-respuesta/[0.05] px-2 py-0.5 text-[11.5px] font-semibold text-tenue">Día {dia}</span>}
      </div>
      {texto && <p className="mt-3 line-clamp-2 text-[13px] leading-[19px] text-respuesta/70">{conVariables(texto)}</p>}
      {gente.length > 0 && (
        <div className="mt-3 flex items-center gap-2 border-t border-linea pt-3">
          <span className="flex -space-x-1.5">
            {gente.slice(0, 3).map((l) => (
              <Iniciales key={l.id} nombre={l.nombre} pequeno />
            ))}
          </span>
          <span className="text-[12.5px] font-semibold text-tenue">{gente.length === 1 ? "1 persona aquí" : `${gente.length} personas aquí`}</span>
        </div>
      )}
    </div>
  );
}

// Resalta {{variables}} como en un editor de plantillas.
function conVariables(texto: string): ReactNode {
  return texto.split(/(\{\{\w+\}\})/).map((t, i) =>
    /^\{\{\w+\}\}$/.test(t) ? (
      <span key={i} className="rounded bg-respuesta/[0.07] px-1 py-px font-mono text-[11.5px] text-respuesta">
        {t.slice(2, -2)}
      </span>
    ) : (
      t
    ),
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[12.5px] text-tenue">{k}</dt>
      <dd className="mt-0.5 font-semibold">{v}</dd>
    </div>
  );
}

function Iniciales({ nombre, pequeno }: { nombre: string; pequeno?: boolean }) {
  const ini = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (
    <span
      className={
        "flex items-center justify-center rounded-full bg-[rgb(230_233_237)] font-bold text-respuesta " +
        (pequeno ? "h-6 w-6 text-[10px] ring-2 ring-tarjeta" : "h-8 w-8 text-[12px]")
      }
    >
      {ini}
    </span>
  );
}

