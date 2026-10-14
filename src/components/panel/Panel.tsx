"use client";

// Panel de operaciones de ingreso. Cuatro vistas: Resumen (cómo se asignó cada interesado y qué viene),
// Excepciones (lo que no era simple y cómo lo resolvió el sistema), Decisiones (el registro completo)
// y Seguimiento (los journeys de retención).
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";
import { Campanas } from "./Campanas";
import { Enrutador } from "./Enrutador";
import { avanceLead, campanaDe } from "@/lib/campanas";
import { Decisiones, Excepciones, type FiltroExcepciones } from "./Listas";
import { ChipDestino, Estado, Nota, Recorrido, Revisar, Senales, Titulo, tonoDe } from "./piezas";
import {
  DESTINOS,
  REGLAS,
  RESULTADOS,
  cuandoReunion,
  destino,
  diaSuave,
  estadoExcepcion,
  haceCuanto,
  hora,
  necesitaRevision,
  razon,
  traza,
  usoRegla,
  type Destino,
  type Lead,
  type Nodo,
} from "@/lib/panel";

type Vista = "resumen" | "excepciones" | "decisiones" | "seguimiento";

export function Panel({ leads, ahora }: { leads: Lead[]; ahora: number }) {
  const [vista, setVista] = useState<Vista>("resumen");
  const [abiertoId, setAbiertoId] = useState<string | null>(null);
  const [nodo, setNodo] = useState<Nodo | null>(null);
  const [campana, setCampana] = useState("bienvenida");
  const [filtroExc, setFiltroExc] = useState<FiltroExcepciones>("abierta");
  const abierto = leads.find((l) => l.id === abiertoId) ?? null;
  const abiertas = leads.filter(necesitaRevision).length;
  const cerrarFicha = useCallback(() => setAbiertoId(null), []);

  function ir(v: Vista) {
    setVista(v);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="min-h-dvh w-full bg-fondo text-respuesta">
      <header className="sticky top-0 z-30 border-b border-linea bg-fondo/85 backdrop-blur-md">
        <div className="flex h-14 w-full items-center gap-6 px-4 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cifrato/logo.svg" alt="Cifrato" width={307} height={56} className="h-[18px] w-auto shrink-0" />
          <nav aria-label="Vistas" className="-mb-px flex h-full items-stretch gap-1 overflow-x-auto [scrollbar-width:none]">
            {(
              [
                ["resumen", "Resumen", 0],
                ["excepciones", "Casos especiales", abiertas],
                ["decisiones", "Decisiones", 0],
                ["seguimiento", "Seguimiento", 0],
              ] as const
            ).map(([k, nombre, n]) => (
              <button
                key={k}
                type="button"
                aria-current={vista === k ? "page" : undefined}
                onClick={() => ir(k)}
                className={
                  "relative flex shrink-0 items-center gap-2 px-3 text-[14px] font-semibold outline-none transition-colors focus-visible:text-respuesta " +
                  (vista === k ? "text-respuesta" : "text-tenue hover:text-respuesta")
                }
              >
                {nombre}
                {n > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-c-humano px-1.5 text-[11.5px] font-bold text-white" aria-label={`${n} esperando revisión`}>
                    {n}
                  </span>
                )}
                {vista === k && <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-respuesta" />}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-20 pt-7 sm:px-6">
        {vista === "resumen" && (
          <Resumen
            leads={leads}
            ahora={ahora}
            onAbrir={setAbiertoId}
            onRevisar={() => {
              setFiltroExc("abierta");
              ir("excepciones");
            }}
          />
        )}
        {vista === "excepciones" && <Excepciones leads={leads} ahora={ahora} filtro={filtroExc} onFiltro={setFiltroExc} onAbrir={setAbiertoId} />}
        {vista === "decisiones" && <Decisiones leads={leads} ahora={ahora} nodo={nodo} onNodo={setNodo} onAbrir={setAbiertoId} />}
        {vista === "seguimiento" && <Campanas leads={leads} ahora={ahora} elegida={campana} onElegir={setCampana} onAbrir={setAbiertoId} />}
      </main>

      {abierto && (
        <Ficha
          lead={abierto}
          ahora={ahora}
          onCerrar={cerrarFicha}
          onVerCampana={(id) => {
            setCampana(id);
            setAbiertoId(null);
            ir("seguimiento");
          }}
        />
      )}
    </div>
  );
}

// ── Resumen ───────────────────────────────────────────────────────────

function Resumen({
  leads,
  ahora,
  onAbrir,
  onRevisar,
}: {
  leads: Lead[];
  ahora: number;
  onAbrir: (id: string) => void;
  onRevisar: () => void;
}) {
  const excepciones = leads.filter((l) => estadoExcepcion(l));
  const solas = excepciones.filter((l) => estadoExcepcion(l) === "resuelta").length;
  const esperando = leads.filter(necesitaRevision).sort((a, b) => a.creado.localeCompare(b.creado));
  const semana = leads
    .filter((l) => l.agendado_para && new Date(l.agendado_para).getTime() > ahora && new Date(l.agendado_para).getTime() < ahora + 7 * 86_400_000)
    .sort((a, b) => a.agendado_para!.localeCompare(b.agendado_para!));
  const estadosExc = (
    [
      ["resuelta", "Resueltas solas", "var(--c-demo)"],
      ["abierta", "Esperando revisión", "var(--c-humano)"],
      ["sin_responder", "Sin responder", "var(--c-neutro)"],
      ["revisadas", "Revisadas por el equipo", "var(--c-descubrimiento)"],
    ] as const
  )
    .map(([k, nombre, color]) => ({
      nombre,
      color,
      n: excepciones.filter((l) => (k === "revisadas" ? ["aprobada", "corregida"].includes(estadoExcepcion(l)!) : estadoExcepcion(l) === k)).length,
    }))
    .filter((x) => x.n > 0);
  const porTipo = (Object.keys(DESTINOS) as Destino[])
    .map((d) => ({ d, n: semana.filter((l) => destino(l) === d).length }))
    .filter((x) => x.n > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Indicador titulo="Reuniones en los próximos 7 días">
          <Valor n={semana.length} />
          <Barra partes={porTipo.map((x) => ({ n: x.n, color: DESTINOS[x.d].color }))} />
          <Leyenda filas={porTipo.map((x) => ({ color: DESTINOS[x.d].color, nombre: DESTINOS[x.d].nombre, n: x.n }))} />
        </Indicador>

        <Indicador titulo="Esperando revisión" accion={esperando.length > 0 ? { texto: "Revisar", onClick: onRevisar } : undefined}>
          <Valor n={esperando.length} unidad={esperando.length === 1 ? "caso" : "casos"} />
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
            <dt className="text-tenue">Más antiguo</dt>
            <dd className="text-right font-semibold">{esperando.length ? haceCuanto(esperando[0].creado, ahora) : "Ninguno"}</dd>
            <dt className="text-tenue">Sin responder</dt>
            <dd className="text-right font-semibold">{excepciones.filter((l) => estadoExcepcion(l) === "sin_responder").length}</dd>
          </dl>
        </Indicador>

        <Indicador titulo="Casos especiales resueltos">
          <Valor n={solas} unidad={`de ${excepciones.length}`} />
          <Barra partes={estadosExc.map((x) => ({ n: x.n, color: x.color }))} />
          <Leyenda filas={estadosExc} />
        </Indicador>
      </div>

      <Tarjeta titulo="Cómo se asignó cada interesado" subtitulo="Pasa el cursor por un punto o tócalo para ver qué es.">
        <Enrutador leads={leads} />
      </Tarjeta>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Tarjeta titulo="Próximas reuniones">
          {semana.length === 0 ? (
            <p className="text-[14px] text-tenue">No hay reuniones esta semana.</p>
          ) : (
            <div className="-mx-2 flex flex-col">
              {agrupar(semana, (l) => diaSuave(l.agendado_para!, ahora)).map(([diaN, lista]) => (
                <div key={diaN} className="border-t border-linea px-2 pb-1 pt-3 first:border-t-0 first:pt-0">
                  <p className="mb-1 text-[13px] font-semibold text-tenue">{diaN}</p>
                  {lista.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onAbrir(l.id)}
                      className="group -mx-2 grid w-[calc(100%+16px)] grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-respuesta/[0.03] focus-visible:bg-respuesta/[0.04]"
                    >
                      <span className="font-mono text-[12.5px] text-tenue">{hora(l.agendado_para!)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-semibold">{l.nombre_empresa}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <ChipDestino d={destino(l)} tamano="sm" />
                        <ChevronRight className="h-4 w-4 text-tenue opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Tarjeta>

        <Tarjeta titulo="Después de la reunión">
          <DespuesReunion leads={leads} />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Reglas activas">
        <div className="hidden grid-cols-[minmax(0,1fr)_110px_130px_130px] gap-6 border-b border-linea pb-2.5 text-[12.5px] font-semibold text-tenue md:grid">
          <span>Regla</span>
          <span className="text-right">Se activó</span>
          <span className="text-right">Correcciones</span>
          <span className="text-right">Cerraron</span>
        </div>
        <ul className="flex flex-col">
          {REGLAS.map((r) => {
            const u = usoRegla(leads, r.motivo);
            return (
              <li key={r.id} className="grid grid-cols-3 gap-x-6 gap-y-2 border-b border-linea py-3.5 last:border-b-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_110px_130px_130px] md:items-center">
                <div className="col-span-3 min-w-0 md:col-span-1">
                  <p className="text-[14px] font-semibold">{r.nombre}</p>
                  <p className="mt-0.5 text-[13px] leading-[19px] text-tenue">
                    {r.condicion}. <span className="text-respuesta/80">{r.accion}.</span>
                  </p>
                </div>
                <Celda k="Se activó" v={u.veces === 1 ? "1 vez" : `${u.veces} veces`} />
                <Celda k="Correcciones" v={u.corregidas ? String(u.corregidas) : "Ninguna"} alerta={u.corregidas > 0} />
                <Celda k="Cerraron" v={u.conResultado ? `${u.cerraron} de ${u.conResultado}` : "Sin resultados"} />
              </li>
            );
          })}
        </ul>
      </Tarjeta>
    </div>
  );
}

function Celda({ k, v, alerta }: { k: string; v: string; alerta?: boolean }) {
  return (
    <div className="text-[13px] md:text-right">
      <span className="block text-[12px] text-tenue md:hidden">{k}</span>
      <span className={"font-semibold " + (alerta ? "text-[rgb(146_84_8)]" : v === "Ninguna" || v === "Sin resultados" ? "font-medium text-tenue" : "")}>{v}</span>
    </div>
  );
}

// Qué pasó después de la reunión, por tipo de reunión: así se sabe si la precalificación acierta.
function DespuesReunion({ leads }: { leads: Lead[] }) {
  const con = leads.filter((l) => l.detalle_puntaje.resultado);
  if (!con.length) return <p className="text-[14px] text-tenue">Aún no hay reuniones con resultado.</p>;
  const estados = Object.keys(RESULTADOS) as (keyof typeof RESULTADOS)[];
  const tipos = (Object.keys(DESTINOS) as Destino[]).filter((d) => con.some((l) => destino(l) === d));
  return (
    <div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px]">
        {estados.map((e) => (
          <li key={e} className="flex items-center gap-1.5 text-tenue">
            <span className="h-2 w-2 rounded-full" style={{ background: RESULTADOS[e].color }} />
            {RESULTADOS[e].nombre}
            <span className="font-mono font-semibold text-respuesta">{con.filter((l) => l.detalle_puntaje.resultado!.estado === e).length}</span>
          </li>
        ))}
      </ul>
      <ul className="mt-5 flex flex-col gap-4">
        {tipos.map((d) => {
          const grupo = con.filter((l) => destino(l) === d);
          const cerraron = grupo.filter((l) => l.detalle_puntaje.resultado!.estado === "cerro").length;
          return (
            <li key={d}>
              <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                <span className="font-semibold">{DESTINOS[d].nombre}</span>
                <span className="text-tenue">
                  {cerraron} de {grupo.length} cerraron
                </span>
              </div>
              <div className="mt-2 flex h-2 gap-[3px] overflow-hidden rounded-full">
                {estados.map((e) => {
                  const n = grupo.filter((l) => l.detalle_puntaje.resultado!.estado === e).length;
                  return n ? <span key={e} style={{ flex: n, background: RESULTADOS[e].color }} /> : null;
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function agrupar<T>(lista: T[], clave: (x: T) => string): [string, T[]][] {
  const m = new Map<string, T[]>();
  for (const x of lista) m.set(clave(x), [...(m.get(clave(x)) ?? []), x]);
  return [...m.entries()];
}

// ── Ficha lateral ─────────────────────────────────────────────────────

function Ficha({ lead: l, ahora, onCerrar, onVerCampana }: { lead: Lead; ahora: number; onCerrar: () => void; onVerCampana: (id: string) => void }) {
  const resultado = l.detalle_puntaje.resultado;
  const campana = campanaDe(l);
  const paso = campana ? avanceLead(l, campana, ahora) : null;
  const cerrar = useRef<HTMLButtonElement>(null);
  const estado = estadoExcepcion(l);
  const reg = l.detalle_puntaje.registro;

  useEffect(() => {
    cerrar.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={onCerrar} className="absolute inset-0 animate-aparecer bg-respuesta/25" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ficha-titulo"
        className="relative flex h-full w-full max-w-[520px] animate-deslizar flex-col overflow-y-auto bg-tarjeta shadow-[-24px_0_60px_-20px_rgb(3_19_34/0.25)]"
      >
        <div className="sticky top-0 z-10 flex items-start gap-4 border-b border-linea bg-tarjeta/95 px-6 py-5 backdrop-blur">
          <div className="min-w-0 flex-1">
            <h2 id="ficha-titulo" className="text-[20px] font-bold leading-tight tracking-[-0.015em]">
              {l.nombre_empresa}
            </h2>
            <p className="mt-1 truncate text-[13.5px] text-tenue">
              {l.nombre} · {l.correo}
            </p>
          </div>
          <button
            ref={cerrar}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ficha"
            className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-tenue outline-none hover:bg-respuesta/[0.05] hover:text-respuesta focus-visible:ring-2 focus-visible:ring-respuesta/20"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-8 px-6 py-6">
          <section>
            <div className="flex flex-wrap items-center gap-2">
              <ChipDestino d={destino(l)} />
              {estado && <Estado e={estado} />}
            </div>
            <div className="mt-3">
              <Nota tono={tonoDe(estado)} grande>
                {razon(l)}
              </Nota>
            </div>
            {l.agendado_para && (
              <p className="mt-1 text-[13.5px] text-tenue">
                Reunión: {cuandoReunion(l.agendado_para, ahora)}
                {DESTINOS[destino(l)].duracion ? `, ${DESTINOS[destino(l)].duracion}` : ""}
              </p>
            )}
            {estado === "abierta" && (
              <div className="mt-4 rounded-xl border border-c-humano/30 bg-c-humano/[0.06] p-4">
                <p className="text-[13.5px] leading-[20px]">
                  El sistema la dejó con un asesor. Confirma o cámbiala de reunión; el cambio queda registrado para ajustar la regla.
                </p>
                <div className="mt-3">
                  <Revisar lead={l} />
                </div>
              </div>
            )}
          </section>

          {resultado && (
            <section>
              <Titulo>Después de la reunión</Titulo>
              <div className="rounded-xl border border-linea p-4">
                <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
                  <span className="h-2 w-2 rounded-full" style={{ background: RESULTADOS[resultado.estado].color }} />
                  {RESULTADOS[resultado.estado].nombre}
                  {resultado.estado !== "cerro" && <span className="font-medium text-tenue">· {resultado.motivo}</span>}
                </p>
                <p className="mt-2.5 text-[14px] leading-[22px]">{resultado.nota}</p>
                <p className="mt-2 text-[12.5px] text-tenue">Anotó el asesor, {haceCuanto(resultado.fecha, ahora).toLowerCase()}</p>
              </div>
            </section>
          )}

          {campana && paso && (
            <section>
              <Titulo
                derecha={
                  <button
                    type="button"
                    onClick={() => onVerCampana(campana.id)}
                    className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-respuesta underline-offset-4 hover:underline"
                  >
                    Ver campaña <ChevronRight className="h-4 w-4" />
                  </button>
                }
              >
                Seguimiento
              </Titulo>
              <p className="text-[15px] font-semibold">{campana.nombre}</p>
              <div className="mt-2 flex h-1.5 gap-[3px]">
                {Array.from({ length: paso.total }, (_, i) => (
                  <span key={i} className={"flex-1 rounded-full " + (i < paso.hechos ? "bg-respuesta" : "bg-respuesta/[0.08]")} />
                ))}
              </div>
              <p className="mt-2.5 text-[13.5px] text-tenue">
                {paso.siguiente
                  ? `Siguiente: ${paso.siguiente.tipo === "mensaje" ? (paso.siguiente.canal === "email" ? "correo" : "WhatsApp") : "tarea del especialista"}, ${paso.siguiente.titulo.toLowerCase()}${paso.enDias ? `, en ${paso.enDias} ${paso.enDias === 1 ? "día" : "días"}` : ""}`
                  : "Completó la secuencia"}
              </p>
            </section>
          )}

          <section>
            <Titulo>Análisis para el equipo</Titulo>
            <p className="rounded-xl bg-fondo/70 p-4 text-[14px] leading-[22px]">{l.resumen_humano}</p>
          </section>

          <section>
            <Titulo>Recorrido</Titulo>
            <Recorrido pasos={traza(l)} />
          </section>

          {l.puntaje !== null && (
            <section>
              <Titulo>Señales</Titulo>
              <Senales lead={l} />
            </section>
          )}

          <section>
            <Titulo>Empresa</Titulo>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px]">
              {reg ? (
                <>
                  <Dato k="Actividad" v={reg.actividad.split(" · ")[1]} ancho />
                  <Dato k="Empleados" v={String(reg.empleados)} />
                  <Dato k="Ciudad" v={reg.ciudad} />
                  <Dato k="NIT" v={reg.nit} />
                  <Dato k="Matriculada" v={`Desde ${reg.desde}`} />
                </>
              ) : (
                <Dato k="Registro" v="No aparece" ancho />
              )}
              <Dato k="Software contable" v={l.erps.join(", ")} ancho />
              <Dato k="Cómo llegó" v={l.fuente} />
              <Dato k="Llenó el formulario" v={haceCuanto(l.creado, ahora)} />
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Dato({ k, v, ancho }: { k: string; v: string; ancho?: boolean }) {
  return (
    <div className={ancho ? "col-span-2" : ""}>
      <dt className="text-[12.5px] text-tenue">{k}</dt>
      <dd className="mt-0.5 font-semibold">{v}</dd>
    </div>
  );
}

function Indicador({ titulo, accion, children }: { titulo: string; accion?: { texto: string; onClick: () => void }; children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-linea bg-tarjeta p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-tenue">{titulo}</h2>
        {accion && (
          <button
            type="button"
            onClick={accion.onClick}
            className="-my-1 inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-semibold text-respuesta outline-none hover:bg-respuesta/[0.05] focus-visible:ring-2 focus-visible:ring-respuesta/20"
          >
            {accion.texto} <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Valor({ n, unidad }: { n: number; unidad?: string }) {
  return (
    <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">
      {n} {unidad && <span className="text-[18px] font-semibold text-tenue">{unidad}</span>}
    </p>
  );
}

function Barra({ partes }: { partes: { n: number; color: string }[] }) {
  return (
    <div className="mt-5 flex h-1.5 gap-[3px] overflow-hidden rounded-full">
      {partes.map((p, i) => (
        <span key={i} style={{ flex: p.n, background: p.color }} />
      ))}
    </div>
  );
}

function Leyenda({ filas }: { filas: { color: string; nombre: string; n: number }[] }) {
  return (
    <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[13px]">
      {filas.map((f) => (
        <div key={f.nombre} className="contents">
          <dt className="flex items-center gap-2 text-tenue">
            <span className="h-2 w-2 rounded-full" style={{ background: f.color }} />
            {f.nombre}
          </dt>
          <dd className="text-right font-mono font-semibold">{f.n}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Tarjeta({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-linea bg-tarjeta p-5 sm:p-6">
      <h2 className="text-[16px] font-bold tracking-[-0.01em]">{titulo}</h2>
      {subtitulo && <p className="mt-1 text-[13.5px] text-tenue">{subtitulo}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function EsqueletoPanel() {
  return (
    <div className="min-h-dvh w-full bg-fondo">
      <div className="h-14 border-b border-linea" />
      <div className="mx-auto flex max-w-[1320px] animate-pulse flex-col gap-5 px-4 pt-7 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-respuesta/[0.04]" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-respuesta/[0.04]" />
      </div>
    </div>
  );
}
