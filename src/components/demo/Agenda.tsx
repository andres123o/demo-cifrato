"use client";

// Agendamiento. Los horarios son de mentira: no hay calendario real detrás
// y nunca se agenda nada en el sistema de Cifrato.
import { useMemo, useState } from "react";
import { Acciones, BotonPrimario } from "./ui";

export type ConfigAgenda = {
  titulo: string;
  duracionMin: number;
  diasHaciaAdelante: number;
  descripcion: string[];
  textoBoton: string;
  horas: string[]; // "HH:MM" en 24 h, hora de Bogotá
};

const DIAS_SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function hora12(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "a. m." : "p. m."}`;
}

export const fechaLarga = (d: Date) => d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });

function mismoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Información de la reunión, encima del calendario.
export function InfoReunion({ config }: { config: ConfigAgenda }) {
  return (
    <div className="mb-4 flex items-start gap-3.5 border-b border-respuesta/10 pb-4 bajo:mb-3 bajo:pb-3 sm:mb-6 sm:pb-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-respuesta text-[13px] font-bold text-primario">EC</span>
      <div className="min-w-0">
        <p className="text-[17px] font-bold leading-tight text-respuesta">{config.titulo}</p>
        <p className="mt-1 text-[13.5px] text-ayuda">
          Equipo comercial de Cifrato · {config.duracionMin} minutos · Google Meet · Bogota (GMT-05)
        </p>
        <p className="mt-2 hidden text-[13.5px] leading-[19px] text-pregunta sm:line-clamp-2 bajo:hidden">{config.descripcion[0]}</p>
      </div>
    </div>
  );
}

export function SelectorHorario({
  config,
  correo,
  onElegir,
  onAtras,
  onAgendar,
}: {
  config: ConfigAgenda;
  correo: string;
  onElegir: (texto: string | undefined) => void;
  onAtras: () => void;
  onAgendar: (cuando: Date) => void;
}) {
  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const limite = useMemo(() => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + config.diasHaciaAdelante);
    return d;
  }, [hoy, config.diasHaciaAdelante]);
  const disponible = (d: Date) => d > hoy && d <= limite && d.getDay() !== 0 && d.getDay() !== 6;

  // Arranca con el primer día disponible ya elegido: un clic menos.
  let primerDia: Date | null = null;
  for (let i = 1; i <= 31 && !primerDia; i++) {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    if (disponible(d)) primerDia = d;
  }

  const [mes, setMes] = useState(() => new Date((primerDia ?? hoy).getFullYear(), (primerDia ?? hoy).getMonth(), 1));
  const [dia, setDia] = useState<Date | null>(primerDia);
  const [hora, setHora] = useState<string | null>(null);

  function elegir(d: Date | null, h: string | null) {
    setDia(d);
    setHora(h);
    onElegir(d && h ? `${fechaLarga(d)}, ${hora12(h)}` : undefined);
  }

  const celdas: (Date | null)[] = [];
  for (let i = 0; i < (mes.getDay() + 6) % 7; i++) celdas.push(null); // semana empieza en lunes
  const diasMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= diasMes; d++) celdas.push(new Date(mes.getFullYear(), mes.getMonth(), d));

  const hayAntes = new Date(mes.getFullYear(), mes.getMonth(), 0) > hoy;
  const hayDespues = new Date(mes.getFullYear(), mes.getMonth() + 1, 1) <= limite;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!dia || !hora) return;
        const [h, m] = hora.split(":").map(Number);
        const cuando = new Date(dia);
        cuando.setHours(h, m);
        onAgendar(cuando);
      }}
    >
      <h2 className="text-[22px] font-bold leading-[1.25] tracking-[-0.015em] text-respuesta bajo:hidden sm:text-[26px]">Elige día y hora</h2>
      <div className="mt-6 flex flex-col gap-6 bajo:mt-4 bajo:gap-4 sm:mt-8 lg:flex-row lg:gap-8">
        <div className="lg:w-[284px] lg:shrink-0">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[15px] font-bold text-respuesta first-letter:uppercase">
              {MESES[mes.getMonth()]} {mes.getFullYear()}
            </p>
            <div className="flex">
              <BotonMes etiqueta="Mes anterior" activo={hayAntes} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>
                ‹
              </BotonMes>
              <BotonMes etiqueta="Mes siguiente" activo={hayDespues} onClick={() => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>
                ›
              </BotonMes>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center">
            {DIAS_SEMANA.map((d) => (
              <span key={d} className="pb-1 text-[11.5px] font-bold uppercase tracking-wide text-ayuda">
                {d}
              </span>
            ))}
            {celdas.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  disabled={!disponible(d)}
                  aria-pressed={!!dia && mismoDia(d, dia)}
                  aria-label={fechaLarga(d)}
                  onClick={() => elegir(d, null)}
                  className={
                    "mx-auto my-0.5 flex h-9 w-9 bajo:my-0 bajo:h-8 bajo:w-8 items-center justify-center rounded-full text-[14px] outline-none transition-colors focus-visible:ring-4 focus-visible:ring-primario/30 " +
                    (dia && mismoDia(d, dia)
                      ? "bg-respuesta font-bold text-white"
                      : disponible(d)
                        ? "bg-primario/[0.12] font-bold text-primario-oscuro hover:bg-primario/25"
                        : "cursor-default text-respuesta/25")
                  }
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-2 text-[15px] font-bold text-respuesta first-letter:uppercase">{dia ? fechaLarga(dia) : "Elige un día para ver los horarios disponibles."}</p>
          {dia && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:grid lg:grid-cols-2 lg:overflow-visible">
              {config.horas.map((h) => (
                <button
                  key={h}
                  type="button"
                  aria-pressed={hora === h}
                  onClick={() => elegir(dia, h)}
                  className={
                    "h-11 shrink-0 whitespace-nowrap rounded-xl border-2 px-4 text-[15px] font-bold lg:px-1 lg:text-[14px] bajo:h-10 bajo:px-3 bajo:text-[14px] outline-none transition-colors focus-visible:ring-4 focus-visible:ring-primario/30 " +
                    (hora === h
                      ? "border-primario bg-primario text-white"
                      : "border-respuesta/10 bg-white text-respuesta hover:border-primario/60")
                  }
                >
                  {hora12(h)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className={"mt-4 bajo:mt-3 text-[14px] text-ayuda transition-opacity sm:mt-6 " + (hora ? "opacity-100" : "opacity-0")}>
        La invitación llegará a <strong className="text-respuesta">{correo}</strong>
      </p>
      <Acciones atras={onAtras}>
        {hora ? <BotonPrimario>{config.textoBoton}</BotonPrimario> : null}
      </Acciones>
    </form>
  );
}

function BotonMes({ etiqueta, activo, onClick, children }: { etiqueta: string; activo: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      disabled={!activo}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-[22px] leading-none text-pregunta outline-none hover:bg-respuesta/5 focus-visible:ring-4 focus-visible:ring-primario/30 disabled:cursor-default disabled:text-respuesta/20 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
