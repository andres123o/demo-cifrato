"use client";

// Journeys de retención, desde la firma hasta la renovación, como workflows de HubSpot. El producto
// envía sus eventos a HubSpot; cada evento inscribe la cuenta en su journey y la saca al cumplir el
// objetivo. Menú lateral con los journeys y las reglas; el flujo se ve de entrada. No envía nada.
import { Fragment, createContext, useContext, useState, type ReactNode } from "react";
import { CircleCheck, Clock, Flag, Mail, MessageCircle, Plus, SlidersHorizontal, Split, Target, UserRound, Zap, type LucideIcon } from "lucide-react";
import {
  CAMPANAS,
  REGLAS_FRECUENCIA,
  REGLAS_PERSONA,
  SALUD,
  SENALES_SALUD,
  avance,
  cuentasDe,
  diasDe,
  type Campana,
  type Etapa,
  type PasoCampana,
  type Salud,
} from "@/lib/campanas";
import type { Lead } from "@/lib/panel";

type Pestana = "flujo" | "cuentas";
const REGLAS = "reglas";
const ETAPAS: Etapa[] = ["Configuración", "Uso", "Renovación"];

// Lo que el lienzo necesita saber de cada paso: su número, su día y cuántas cuentas están ahí.
const Contexto = createContext<{ numero: Map<PasoCampana, number>; dias: Map<PasoCampana, number>; aqui: Map<PasoCampana, number> }>({
  numero: new Map(),
  dias: new Map(),
  aqui: new Map(),
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
  const c = CAMPANAS.find((x) => x.id === elegida) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[26px] font-bold tracking-[-0.025em]">Retención</h1>
        <span className="inline-flex items-center gap-2 rounded-full border border-linea bg-tarjeta px-3 py-1.5 text-[13px] font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-primario/60 motion-reduce:hidden" />
            <span className="relative h-2 w-2 rounded-full bg-primario" />
          </span>
          Conectado a HubSpot
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* Menú lateral */}
        <nav aria-label="Journeys" className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {ETAPAS.map((etapa) => (
            <Fragment key={etapa}>
              <span className="hidden px-3 pb-1 pt-4 text-[12px] font-semibold text-tenue first:pt-0 lg:block">{etapa}</span>
              {CAMPANAS.filter((x) => x.etapa === etapa).map((x) => (
                <ItemMenu key={x.id} activo={x.id === c?.id} onClick={() => onElegir(x.id)} derecha={cuentasDe(x, leads, ahora).length}>
                  {x.nombre}
                </ItemMenu>
              ))}
            </Fragment>
          ))}
          <span className="mx-3 my-3 hidden h-px bg-linea lg:block" />
          <ItemMenu activo={elegida === REGLAS} onClick={() => onElegir(REGLAS)} derecha={<SlidersHorizontal className="h-3.5 w-3.5" />}>
            Reglas
          </ItemMenu>
        </nav>

        {c ? <Journey c={c} leads={leads} ahora={ahora} pestana={pestana} onPestana={setPestana} onAbrir={onAbrir} /> : <Reglas />}
      </div>
    </div>
  );
}

function ItemMenu({ activo, onClick, derecha, children }: { activo: boolean; onClick: () => void; derecha: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-current={activo ? "page" : undefined}
      onClick={onClick}
      className={
        "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[14px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-respuesta/20 " +
        (activo ? "bg-tarjeta text-respuesta shadow-[0_1px_3px_rgb(3_19_34/0.1)]" : "text-tenue hover:bg-respuesta/[0.04] hover:text-respuesta")
      }
    >
      <span className="truncate">{children}</span>
      <span className="text-[12.5px] font-semibold text-tenue">{derecha}</span>
    </button>
  );
}

// ── Journey ───────────────────────────────────────────────────────────

function Journey({
  c,
  leads,
  ahora,
  pestana,
  onPestana,
  onAbrir,
}: {
  c: Campana;
  leads: Lead[];
  ahora: number;
  pestana: Pestana;
  onPestana: (p: Pestana) => void;
  onAbrir: (id: string) => void;
}) {
  const cuentas = cuentasDe(c, leads, ahora).map((x) => ({ x, a: avance(c, x.dia) }));
  const aqui = new Map<PasoCampana, number>();
  for (const { a } of cuentas) if (a.ultimo) aqui.set(a.ultimo, (aqui.get(a.ultimo) ?? 0) + 1);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-linea bg-tarjeta">
      <header className="border-b border-linea px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[19px] font-bold tracking-[-0.02em]">{c.nombre}</h2>
            <Interruptor />
          </div>
          <div role="tablist" className="flex rounded-xl bg-respuesta/[0.05] p-1">
            {(
              [
                ["flujo", "Flujo"],
                ["cuentas", `Cuentas ${cuentas.length}`],
              ] as const
            ).map(([k, t]) => (
              <button
                key={k}
                role="tab"
                aria-selected={pestana === k}
                onClick={() => onPestana(k)}
                className={
                  "rounded-lg px-4 py-1.5 text-[13.5px] font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-respuesta/20 " +
                  (pestana === k ? "bg-tarjeta shadow-[0_1px_3px_rgb(3_19_34/0.1)]" : "text-tenue hover:text-respuesta")
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <dl className="mt-4 grid gap-3 text-[13.5px] sm:grid-cols-3">
          <Meta icono={Target} k="Objetivo" v={c.objetivo} codigo={c.meta} />
          <Meta icono={UserRound} k="Pasa al especialista" v={c.persona} />
          <Meta icono={CircleCheck} k="Sale" v="Al cumplir el objetivo, en cualquier paso" />
        </dl>
      </header>

      {pestana === "cuentas" ? (
        cuentas.length === 0 ? (
          <p className="px-6 py-14 text-center text-[14px] text-tenue">Ninguna cuenta en este journey por ahora.</p>
        ) : (
          <ul>
            {cuentas.map(({ x, a }) => {
              const fila = (
                <>
                  <ChipSalud s={x.salud} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold">{x.empresa}</span>
                    <span className="block truncate text-[12.5px] text-tenue">
                      {x.contacto} · {x.tipo}
                    </span>
                  </span>
                  <span className="hidden gap-1 md:flex" aria-label={`${a.hechos} de ${a.total} pasos`}>
                    {Array.from({ length: a.total }, (_, i) => (
                      <span key={i} className={"h-1.5 w-4 rounded-full " + (i < a.hechos ? "bg-respuesta" : "bg-respuesta/[0.1]")} />
                    ))}
                  </span>
                  <span className="col-span-2 flex min-w-0 items-center gap-2 text-[13px] md:col-span-1 md:justify-end">
                    {a.siguiente ? (
                      <>
                        <IconoPaso paso={a.siguiente} />
                        <span className="truncate font-semibold">{a.siguiente.titulo.replace("{{erp}}", "el ERP")}</span>
                        <span className="shrink-0 text-tenue">{a.enDias ? `en ${a.enDias} ${a.enDias === 1 ? "día" : "días"}` : "hoy"}</span>
                      </>
                    ) : (
                      <span className="text-tenue">Sin pasos pendientes</span>
                    )}
                  </span>
                </>
              );
              const clases = "grid w-full grid-cols-[64px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-5 py-3 text-left sm:px-6 md:grid-cols-[64px_minmax(0,1fr)_120px_minmax(0,1fr)]";
              return (
                <li key={x.id} className="border-b border-linea last:border-b-0">
                  {x.leadId ? (
                    <button type="button" onClick={() => onAbrir(x.leadId!)} className={clases + " outline-none transition-colors hover:bg-respuesta/[0.02] focus-visible:bg-respuesta/[0.04]"}>
                      {fila}
                    </button>
                  ) : (
                    <div className={clases}>{fila}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      ) : (
        <div
          className="overflow-x-auto bg-[rgb(245_248_250)] px-4 py-10 [scrollbar-width:thin]"
          style={{ backgroundImage: "radial-gradient(rgb(3 19 34 / 0.08) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
        >
          <Contexto.Provider value={{ numero: numerar(c.pasos), dias: diasDe(c), aqui }}>
            <div className="mx-auto flex w-max min-w-full flex-col items-center">
              <Tarjeta icono={Zap} tono="disparador" encabezado="Desencadenante de inscripción">
                <p className="text-[14px] font-semibold leading-snug">{c.disparador}</p>
                <p className="mt-1.5 text-[12.5px] text-tenue">
                  Evento <Codigo>{c.evento}</Codigo>
                </p>
              </Tarjeta>
              <Pasos pasos={c.pasos} />
            </div>
          </Contexto.Provider>
        </div>
      )}
    </section>
  );
}

function Interruptor() {
  return (
    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-primario-oscuro">
      <span className="relative h-[18px] w-[30px] rounded-full bg-primario">
        <span className="absolute right-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm" />
      </span>
      Activo
    </span>
  );
}

function Meta({ icono: Icono, k, v, codigo }: { icono: LucideIcon; k: string; v: string; codigo?: string }) {
  return (
    <div className="flex gap-2.5">
      <Icono className="mt-0.5 h-4 w-4 shrink-0 text-tenue" />
      <div className="min-w-0">
        <dt className="text-[12.5px] text-tenue">{k}</dt>
        <dd className="mt-0.5 font-semibold leading-snug">
          {v}
          {codigo && (
            <span className="mt-1 block">
              <Codigo>{codigo}</Codigo>
            </span>
          )}
        </dd>
      </div>
    </div>
  );
}

const Codigo = ({ children }: { children: ReactNode }) => (
  <span className="rounded bg-respuesta/[0.06] px-1.5 py-px font-mono text-[11.5px] font-medium text-respuesta">{children}</span>
);

export function ChipSalud({ s }: { s: Salud }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold">
      <span className="h-2 w-2 rounded-full" style={{ background: SALUD[s].color }} />
      {SALUD[s].nombre}
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

// ── Lienzo, al estilo del editor de workflows de HubSpot ──────────────

// Numera las acciones en orden de lectura, como HubSpot (las ramas cuentan, el fin no).
function numerar(pasos: PasoCampana[], m = new Map<PasoCampana, number>()) {
  for (const p of pasos) {
    if (p.tipo === "fin") continue;
    m.set(p, m.size + 1);
    if (p.tipo === "condicion") for (const r of p.ramas) numerar(r.pasos, m);
  }
  return m;
}

// Conector con el botón "+" de HubSpot en la mitad.
function Conector() {
  return (
    <span className="flex flex-col items-center" aria-hidden>
      <span className="h-4 w-px bg-borde-fuerte/50" />
      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-borde-fuerte/40 bg-tarjeta text-tenue">
        <Plus className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="h-4 w-px bg-borde-fuerte/50" />
    </span>
  );
}

function Pasos({ pasos }: { pasos: PasoCampana[] }) {
  return (
    <>
      {pasos.map((p, i) => (
        <Fragment key={i}>
          <Conector />
          <PasoVista paso={p} />
        </Fragment>
      ))}
    </>
  );
}

function PasoVista({ paso: p }: { paso: PasoCampana }) {
  const { numero } = useContext(Contexto);
  const n = numero.get(p);

  if (p.tipo === "espera")
    return (
      <Tarjeta paso={p} icono={Clock} tono="espera" encabezado={`${n}. Retraso`} compacta>
        <p className="text-[13.5px] font-semibold">{p.texto ?? `Esperar ${p.dias} ${p.dias === 1 ? "día" : "días"}`}</p>
      </Tarjeta>
    );
  if (p.tipo === "mensaje")
    return (
      <Tarjeta paso={p} icono={p.canal === "email" ? Mail : MessageCircle} tono={p.canal} encabezado={`${n}. ${p.canal === "email" ? "Enviar correo" : "Enviar WhatsApp"}`}>
        <p className="text-[14px] font-semibold leading-snug">{conVariables(p.titulo)}</p>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-[19px] text-respuesta/70">{conVariables(p.texto)}</p>
      </Tarjeta>
    );
  if (p.tipo === "tarea")
    return (
      <Tarjeta paso={p} icono={UserRound} tono="tarea" encabezado={`${n}. Crear tarea · Especialista`}>
        <p className="text-[14px] font-semibold leading-snug">{p.titulo}</p>
        <p className="mt-1.5 text-[13px] leading-[19px] text-respuesta/70">{p.texto}</p>
      </Tarjeta>
    );
  if (p.tipo === "fin")
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-linea bg-tarjeta px-3 py-1.5 text-[12.5px] font-semibold text-tenue">
        <Flag className="h-3.5 w-3.5" />
        {p.titulo}
      </span>
    );

  // Rama si/entonces: se abre en ramas que se vuelven a unir abajo.
  return (
    <div className="flex flex-col items-center">
      <Tarjeta paso={p} icono={Split} tono="rama" encabezado={`${n}. Rama si/entonces`} compacta>
        <p className="text-[14px] font-semibold">{p.pregunta}</p>
      </Tarjeta>
      <span className="h-4 w-px bg-borde-fuerte/50" />
      <div className="flex items-stretch gap-8">
        {p.ramas.map((r, i) => (
          <div key={r.nombre} className="relative flex flex-col items-center">
            <span className="absolute top-0 h-px bg-borde-fuerte/50" style={{ left: i === 0 ? "50%" : "-16px", right: i === p.ramas.length - 1 ? "50%" : "-16px" }} />
            <span className="h-4 w-px bg-borde-fuerte/50" />
            <span className="rounded-md border border-linea bg-tarjeta px-2.5 py-0.5 text-[12px] font-bold">{r.nombre}</span>
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
  espera: "bg-respuesta/[0.07] text-respuesta",
  rama: "bg-[rgb(124_92_200/0.12)] text-[rgb(92_64_170)]",
};

// Tarjeta de acción: encabezado con el tipo y número de acción, cuerpo con el contenido.
function Tarjeta({
  paso,
  icono: Icono,
  tono,
  encabezado,
  compacta,
  children,
}: {
  paso?: PasoCampana;
  icono: LucideIcon;
  tono: keyof typeof TONOS;
  encabezado: string;
  compacta?: boolean;
  children: ReactNode;
}) {
  const { dias, aqui } = useContext(Contexto);
  const dia = paso ? dias.get(paso) : undefined;
  const n = paso ? (aqui.get(paso) ?? 0) : 0;
  return (
    <div className={"relative overflow-hidden rounded-xl border border-linea bg-tarjeta shadow-[0_1px_3px_rgb(3_19_34/0.06)] " + (compacta ? "w-[260px]" : "w-[320px]")}>
      <div className="flex items-center gap-2 border-b border-linea px-3.5 py-2">
        <span className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-md " + TONOS[tono]}>
          <Icono className="h-3.5 w-3.5" strokeWidth={2.2} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-tenue">{encabezado}</span>
        {dia !== undefined && <span className="shrink-0 text-[11.5px] font-semibold text-tenue">Día {dia}</span>}
      </div>
      <div className="px-3.5 py-3">{children}</div>
      {n > 0 && (
        <div className="border-t border-linea px-3.5 py-2 text-[12.5px] font-semibold text-tenue">{n === 1 ? "1 cuenta aquí" : `${n} cuentas aquí`}</div>
      )}
    </div>
  );
}

// Resalta {{variables}} como en el editor de plantillas.
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

// ── Reglas ────────────────────────────────────────────────────────────

function Reglas() {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-3">
      <Caja titulo="Salud de la cuenta">
        <ul className="flex flex-col gap-2.5 text-[14px]">
          {SENALES_SALUD.map((s) => (
            <li key={s} className="flex gap-2.5">
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primario-oscuro" />
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-col gap-2 border-t border-linea pt-4">
          {(Object.keys(SALUD) as Salud[]).map((s) => (
            <div key={s} className="flex items-center justify-between text-[13.5px]">
              <ChipSalud s={s} />
              <span className="text-tenue">{SALUD[s].regla}</span>
            </div>
          ))}
        </div>
      </Caja>

      <Caja titulo="Cuándo entra el especialista">
        <ul className="flex flex-col gap-4">
          {REGLAS_PERSONA.map((r) => (
            <li key={r.salud} className="flex flex-col gap-1">
              <ChipSalud s={r.salud} />
              <span className="text-[14px] leading-snug">{r.texto}</span>
            </li>
          ))}
        </ul>
      </Caja>

      <Caja titulo="Frecuencia y control">
        <ul className="flex flex-col gap-3 text-[14px] leading-snug">
          {REGLAS_FRECUENCIA.map((r) => (
            <li key={r} className="flex gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-respuesta/40" />
              {r}
            </li>
          ))}
        </ul>
      </Caja>
    </div>
  );
}

function Caja({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-linea bg-tarjeta p-5">
      <h3 className="mb-4 text-[15px] font-bold">{titulo}</h3>
      {children}
    </section>
  );
}
