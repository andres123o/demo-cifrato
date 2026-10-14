// Piezas visuales del formulario. Colores y textos del original de Cifrato;
// una pregunta por pantalla, campos grandes y respuestas por teclado.
"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";

export function Pregunta({
  id,
  titulo,
  ayuda,
  error,
  children,
}: {
  id: string;
  titulo: ReactNode;
  ayuda?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <h2 id={`${id}-titulo`} className="text-[22px] font-bold leading-[1.25] tracking-[-0.015em] text-respuesta sm:text-[28px]">
        {titulo}
      </h2>
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-2 text-[15px] leading-[22px] text-ayuda">
          {ayuda}
        </p>
      )}
      <div className="mt-6 bajo:mt-4 sm:mt-8">{children}</div>
      <MensajeError id={id} error={error} />
    </div>
  );
}

// Campo con etiqueta flotante: la etiqueta vive dentro del campo y sube al enfocar o escribir.
// Una línea verde se dibuja desde la izquierda al enfocar; un check aparece cuando el dato es válido.
export function CampoFlotante({
  id,
  etiqueta,
  error,
  valido = false,
  prefijo,
  value,
  ...resto
}: {
  id: string;
  etiqueta: string;
  error?: string;
  valido?: boolean;
  prefijo?: ReactNode;
  value: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "placeholder">) {
  const [enfocado, setEnfocado] = useState(false);
  const arriba = enfocado || value !== "";
  return (
    <div>
      <div
        className={
          "relative flex h-[60px] items-end border-b transition-colors duration-200 bajo:h-[52px] " +
          (error ? "border-error" : "border-respuesta/15 hover:border-respuesta/30")
        }
      >
        <label
          htmlFor={id}
          className={
            "pointer-events-none absolute left-0 origin-left transition-all duration-200 ease-out " +
            (arriba
              ? "top-1 text-[12.5px] font-semibold " + (error ? "text-error" : enfocado ? "text-primario-oscuro" : "text-ayuda")
              : "top-1/2 -translate-y-1/2 text-[17px] font-medium " + (error ? "text-error/80" : "text-respuesta/40"))
          }
        >
          {etiqueta}
        </label>
        {prefijo && (
          <span
            className={
              "mb-2.5 mr-2.5 flex shrink-0 items-center gap-2 text-[18px] font-medium text-respuesta/50 transition-opacity duration-200 " +
              (arriba ? "opacity-100" : "opacity-0")
            }
          >
            {prefijo}
          </span>
        )}
        <input
          id={id}
          value={value}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mb-1.5 h-9 w-full min-w-0 bg-transparent text-[18px] font-medium text-respuesta outline-none"
          {...resto}
        />
        <span
          aria-hidden
          className={
            "mb-3 ml-2 shrink-0 transition-all duration-300 " + (valido && !error ? "scale-100 opacity-100" : "scale-50 opacity-0")
          }
        >
          <IconoCheck className="h-[18px] w-[18px] text-primario" />
        </span>
        <span
          aria-hidden
          className={
            "absolute inset-x-0 -bottom-px h-[2px] origin-left transition-transform duration-300 ease-out " +
            (error ? "bg-error" : "bg-primario") +
            (enfocado ? " scale-x-100" : " scale-x-0")
          }
        />
      </div>
      <MensajeError id={id} error={error} />
    </div>
  );
}

export function MensajeError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-2.5 flex items-center gap-1.5 text-[14px] font-medium text-error bajo:mt-1 bajo:text-[13px]">
      <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 fill-current" aria-hidden>
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.9 4.5h1.8v5h-1.8v-5Zm0 6.5h1.8v1.8h-1.8V13Z" />
      </svg>
      {error}
    </p>
  );
}

export function BotonPrimario({
  children,
  onClick,
  tipo = "submit",
}: {
  children: ReactNode;
  onClick?: () => void;
  tipo?: "submit" | "button";
}) {
  return (
    <button
      type={tipo}
      onClick={onClick}
      className="h-12 rounded-xl bg-primario px-7 text-[16px] font-bold text-white outline-none transition-[background-color,transform] duration-150 hover:bg-primario-oscuro focus-visible:ring-4 focus-visible:ring-primario/30 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

// Fila de acciones: botón principal y Atrás discreto.
export function Acciones({ atras, children }: { atras?: () => void; children?: ReactNode }) {
  return (
    <div className="mt-10 flex items-center gap-4 bajo:mt-5 sm:bajo:mt-6">
      {children}
      {atras && (
        <button
          type="button"
          onClick={atras}
          className="ml-auto h-12 rounded-xl px-3 text-[15px] font-semibold text-pregunta outline-none transition-colors hover:text-respuesta focus-visible:ring-4 focus-visible:ring-primario/30"
        >
          Atrás
        </button>
      )}
    </div>
  );
}

// Opción de lista con tecla (A, B, C…), al estilo de los formularios conversacionales.
export function OpcionTecla({
  tecla,
  texto,
  elegida,
  onElegir,
}: {
  tecla: string;
  texto: string;
  elegida: boolean;
  onElegir: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={elegida}
      onClick={onElegir}
      className={
        "group flex h-[52px] w-full items-center gap-3.5 rounded-xl border-2 px-4 text-left text-[16px] font-semibold outline-none transition-[border-color,background-color] duration-150 focus-visible:ring-4 focus-visible:ring-primario/25 sm:text-[17px] " +
        (elegida
          ? "border-primario bg-primario/[0.08] text-respuesta"
          : "border-respuesta/10 bg-white text-respuesta hover:border-primario/60")
      }
    >
      <span
        className={
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold transition-colors " +
          (elegida ? "bg-primario text-white" : "bg-respuesta/[0.06] text-pregunta group-hover:bg-primario/15 group-hover:text-primario-oscuro")
        }
      >
        {tecla}
      </span>
      <span className="flex-1">{texto}</span>
      {elegida && <IconoCheck className="h-5 w-5 text-primario-oscuro" />}
    </button>
  );
}

export function Chip({ texto, elegida, onClick, rol = "checkbox" }: { texto: string; elegida: boolean; onClick: () => void; rol?: "checkbox" | "radio" }) {
  return (
    <button
      type="button"
      role={rol}
      aria-checked={elegida}
      onClick={onClick}
      className={
        "flex h-10 items-center gap-1.5 rounded-full border-2 px-4 text-[14.5px] font-semibold outline-none transition-[border-color,background-color,color] duration-150 focus-visible:ring-4 focus-visible:ring-primario/25 " +
        (elegida
          ? "border-primario bg-primario text-white"
          : "border-respuesta/10 bg-white text-respuesta hover:border-primario/60")
      }
    >
      {elegida && <IconoCheck className="h-4 w-4 text-white" />}
      {texto}
    </button>
  );
}

export function BanderaColombia() {
  return (
    <svg viewBox="0 0 24 16" className="h-[15px] w-[22px] rounded-[2px] shadow-[0_0_0_1px_rgba(3,19,34,0.1)]" aria-hidden>
      <rect width="24" height="8" fill="#FCD116" />
      <rect y="8" width="24" height="4" fill="#003893" />
      <rect y="12" width="24" height="4" fill="#CE1126" />
    </svg>
  );
}

export function IconoCheck({ className = "h-4 w-4 text-primario-oscuro" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
