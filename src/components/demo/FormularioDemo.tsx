"use client";

// Formulario de demo en pantalla completa: a la izquierda se arma la ficha del interesado,
// a la derecha va una pregunta a la vez. Nada de scroll de página.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { InfoReunion, SelectorHorario, type ConfigAgenda } from "./Agenda";
import { IlustracionCifrato } from "./IlustracionCifrato";
import { aclarar, marcarAgendado, precalificarYGuardar } from "@/app/demo/acciones";
import type { Camino, DudaPublica } from "@/lib/puntaje";
import {
  Acciones,
  BanderaColombia,
  BotonPrimario,
  Chip,
  CampoFlotante,
  IconoCheck,
  OpcionTecla,
  Pregunta,
} from "./ui";
import {
  OPCIONES_ERP,
  OPCIONES_FACTURAS,
  OPCIONES_FUENTE,
  OPCIONES_TIPO_EMPRESA,
  REGEX_CELULAR,
  REGEX_CORREO,
  decidirDestino,
  type DatosContacto,
  type DatosEmpresa,
  type Destino,
  type RangoFacturas,
  type TipoEmpresa,
} from "@/lib/demo/formulario";

const PREGUNTAS = ["datos", "fuente", "tipo", "empresa", "erp", "facturas"] as const;
type PasoPregunta = (typeof PREGUNTAS)[number];
// Tras la última pregunta, el sistema precalifica solo (pantalla "analizando") y muestra la agenda que corresponde.
// Si los datos se contradicen, después de agendar viene una aclaración corta ("aclarar") y el sistema reasigna.
type Paso = PasoPregunta | "analizando" | "agenda" | "aclarar" | "ajustando" | "aviso" | "final";
type Errores = Record<string, string | undefined>;

const OTRO = "Otro";
const LETRAS = "ABCDEFGH";
const AVANCE_MS = 260; // pausa para ver la opción marcada antes de avanzar

function configAgenda(destino: Destino, empresa: string, camino: Camino | null): ConfigAgenda | null {
  if (destino.tipo === "descubrimiento" && camino === "demo_directa") {
    return {
      titulo: `Demo Cifrato <> ${empresa}`,
      duracionMin: 45,
      diasHaciaAdelante: 7,
      descripcion: ["🟢 Te mostramos Cifrato funcionando con tus propios casos y resolvemos tus dudas de implementación."],
      textoBoton: "Agendar Demo",
      horas: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
    };
  }
  if (destino.tipo === "demo_grupal" || (destino.tipo === "descubrimiento" && camino === "sesion_grupal")) {
    return CONFIG_GRUPAL;
  }
  if (destino.tipo === "descubrimiento") {
    return {
      titulo: `Descubrimiento Cifrato <> ${empresa}`,
      duracionMin: 30,
      diasHaciaAdelante: 7,
      descripcion: ["🟢 Nos reunimos para entender tu contexto, tus retos y las oportunidades de mejora en tu operación."],
      textoBoton: "Agendar Reunión",
      horas: ["08:00", "08:30", "09:30", "10:00", "11:00", "14:00", "15:00", "16:30"],
    };
  }
  return null;
}

const CONFIG_GRUPAL: ConfigAgenda = {
  titulo: "Demo grupal de Cifrato",
      duracionMin: 45,
      diasHaciaAdelante: 14,
      descripcion: [
        "Únete a este demo grupal y descubre cómo Cifrato automatiza la causación de facturas conectando la DIAN con tu software contable.",
        "En pocos minutos verás cómo eliminar la digitación manual, validar la información automáticamente y llegar al cierre con control total.",
      ],
      textoBoton: "Agendar Demo",
      horas: ["10:00", "15:00"],
};

function validar(paso: Paso, c: DatosContacto, fuenteOtro: string, e: DatosEmpresa): Errores {
  switch (paso) {
    case "datos":
      return {
        nombre: c.nombre.trim().length < 3 ? "Escribe tu nombre completo." : undefined,
        celular: !c.celular
          ? "Escribe tu número de celular."
          : !REGEX_CELULAR.test(c.celular)
            ? "Revisa tu número celular: son 10 dígitos y empieza por 3."
            : undefined,
        correo: !c.correo.trim()
          ? "Escribe tu correo electrónico."
          : !REGEX_CORREO.test(c.correo.trim())
            ? "Revisa tu correo: debe verse como nombre@empresa.com."
            : undefined,
      };
    case "fuente":
      return { fuente: !c.fuente ? "Elige una opción." : c.fuente === OTRO && !fuenteOtro.trim() ? "Cuéntanos dónde nos conociste." : undefined };
    case "tipo":
      return { tipo: !e.tipoEmpresa ? "Elige una opción." : undefined };
    case "empresa":
      return { empresa: !e.nombreEmpresa.trim() ? "Escribe el nombre de tu empresa o el tuyo como contador." : undefined };
    case "erp":
      return { erp: e.erps.length === 0 ? "Elige al menos un software." : undefined };
    case "facturas":
      return { facturas: !e.facturas ? "Elige un rango." : undefined };
    default:
      return {};
  }
}

export function FormularioDemo() {
  const [paso, setPaso] = useState<Paso>("datos");
  const [contacto, setContacto] = useState<DatosContacto>({ nombre: "", celular: "", correo: "", fuente: "" });
  const [fuenteOtro, setFuenteOtro] = useState("");
  const [empresa, setEmpresa] = useState<DatosEmpresa>({ tipoEmpresa: "", nombreEmpresa: "", erps: [], facturas: "" });
  const [intento, setIntento] = useState(false);
  const [destino, setDestino] = useState<Destino | null>(null);
  const [horario, setHorario] = useState<string | undefined>();
  const [agendado, setAgendado] = useState<Date | null>(null);
  const leadId = useRef<string | null>(null);
  const [camino, setCamino] = useState<Camino | null>(null);
  const [caminoAgendado, setCaminoAgendado] = useState<Camino | null>(null);
  const [dudas, setDudas] = useState<DudaPublica[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [indiceDuda, setIndiceDuda] = useState(0);
  const dudaActual = dudas[indiceDuda];
  const zona = useRef<HTMLDivElement>(null);

  const errores = intento ? validar(paso, contacto, fuenteOtro, empresa) : {};
  const indice = PREGUNTAS.indexOf(paso as PasoPregunta);
  const agenda = destino ? configAgenda(destino, empresa.nombreEmpresa.trim(), camino) : null;
  const digitos = contacto.celular.replace(/^\+57/, "");

  function irA(p: Paso) {
    setIntento(false);
    setPaso(p);
  }

  function siguiente(desde: Paso, empresaActual = empresa) {
    if (desde === "facturas") {
      const d = decidirDestino(empresaActual);
      setDestino(d);
      setHorario(undefined);
      irA("analizando");
      // El análisis toma milisegundos; la pausa mínima deja ver qué está haciendo el sistema.
      const pausa = new Promise((listo) => window.setTimeout(listo, 1800));
      Promise.all([precalificarYGuardar(contacto, fuenteOtro, empresaActual), pausa]).then(([r]) => {
        leadId.current = r.id;
        setCamino(r.camino);
        setDudas(r.dudas);
        setRespuestas({});
        setIndiceDuda(0);
        irA(configAgenda(d, empresaActual.nombreEmpresa.trim(), r.camino) ? "agenda" : "aviso");
      });
      return;
    }
    const i = PREGUNTAS.indexOf(desde as PasoPregunta);
    irA(PREGUNTAS[i + 1]);
  }

  // La "IA" (simulada con reglas) interpreta las respuestas en el servidor y reasigna la reunión.
  function terminarAclaracion(r: Record<string, string>) {
    irA("ajustando");
    const pausa = new Promise((listo) => window.setTimeout(listo, 1200));
    Promise.all([aclarar(leadId.current!, r), pausa]).then(([res]) => {
      if (res.camino) setCamino(res.camino);
      irA("final");
    });
  }

  // Al responder, pasa a la siguiente pregunta o, si era la última, reasigna la reunión.
  function responderDuda(o: string) {
    const nuevas = { ...respuestas, [dudaActual.id]: o };
    setRespuestas(nuevas);
    window.setTimeout(() => {
      if (indiceDuda + 1 < dudas.length) setIndiceDuda(indiceDuda + 1);
      else terminarAclaracion(nuevas);
    }, AVANCE_MS);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const err = validar(paso, contacto, fuenteOtro, empresa);
    const primero = Object.keys(err).find((k) => err[k]);
    if (primero) {
      setIntento(true);
      document.getElementById(primero)?.focus();
      return;
    }
    siguiente(paso);
  }

  // Elegir una opción única avanza sola, tras una pausa corta para ver la marca.
  function elegirYAvanzar(cambio: () => DatosEmpresa | void, desde: Paso) {
    const nueva = cambio();
    window.setTimeout(() => siguiente(desde, nueva ?? empresa), AVANCE_MS);
  }

  function elegirTipo(t: TipoEmpresa) {
    elegirYAvanzar(() => {
      // La pregunta de facturas cambia con el tipo, así que se reinicia.
      const nueva = { ...empresa, tipoEmpresa: t, facturas: "" as const };
      setEmpresa(nueva);
      return nueva;
    }, "tipo");
  }

  function elegirFacturas(f: RangoFacturas) {
    elegirYAvanzar(() => {
      const nueva = { ...empresa, facturas: f };
      setEmpresa(nueva);
      return nueva;
    }, "facturas");
  }

  // Al cambiar de paso, enfocar el primer campo (no en la carga, para no abrir el teclado del celular).
  const pasoAnterior = useRef(paso);
  useEffect(() => {
    if (pasoAnterior.current === paso) return;
    pasoAnterior.current = paso;
    zona.current?.scrollTo({ top: 0 });
    zona.current?.querySelector<HTMLElement>("input, [role=radio], [role=checkbox]")?.focus({ preventScroll: true });
  }, [paso]);

  // Atajos de teclado: A, B, C… para las preguntas de opciones.
  useEffect(() => {
    const opciones =
      paso === "tipo" ? OPCIONES_TIPO_EMPRESA : paso === "facturas" ? OPCIONES_FACTURAS : paso === "aclarar" && dudaActual ? dudaActual.opciones : null;
    if (!opciones) return;
    function tecla(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).tagName === "INPUT") return;
      const i = LETRAS.indexOf(e.key.toUpperCase());
      if (i < 0 || i >= opciones!.length) return;
      if (paso === "aclarar") responderDuda(opciones![i]);
      else if (paso === "tipo") elegirTipo(opciones![i] as TipoEmpresa);
      else elegirFacturas(opciones![i] as RangoFacturas);
    }
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  const pasos: { paso: PasoPregunta | "agenda"; etiqueta: string; valor?: string }[] = [
    { paso: "datos", etiqueta: "Contacto", valor: indice !== 0 ? contacto.nombre : undefined },
    { paso: "fuente", etiqueta: "Origen", valor: contacto.fuente === OTRO ? fuenteOtro : contacto.fuente },
    { paso: "tipo", etiqueta: "Tipo", valor: empresa.tipoEmpresa },
    { paso: "empresa", etiqueta: "Empresa", valor: indice > 3 || indice < 0 ? empresa.nombreEmpresa : undefined },
    { paso: "erp", etiqueta: "Software", valor: indice > 4 || indice < 0 ? empresa.erps.join(", ") : undefined },
    { paso: "facturas", etiqueta: "Facturas", valor: empresa.facturas },
    { paso: "agenda", etiqueta: "Agenda", valor: agendado ? horario : undefined },
  ];
  const posicion =
    paso === "final" ? pasos.length : paso === "aclarar" || paso === "ajustando" ? pasos.length : paso === "aviso" || paso === "analizando" ? pasos.length - 1 : pasos.findIndex((p) => p.paso === paso);

  // Si la aclaración cambió el tipo de reunión, se le avisa en la pantalla final.
  const agendaInicial = destino ? configAgenda(destino, empresa.nombreEmpresa.trim(), caminoAgendado) : null;
  const cambio = agenda && agendaInicial && agenda.titulo !== agendaInicial.titulo ? agenda : null;

  let contenido: ReactNode = null;
  if (paso === "datos") {
    contenido = (
      <form noValidate onSubmit={enviar}>
        <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-respuesta sm:text-[34px]">Agenda una demo</h1>
        <div className="mt-8 flex flex-col gap-6 bajo:mt-4 bajo:gap-3 sm:mt-10">
          <CampoFlotante
            id="nombre"
            etiqueta="Nombre completo"
            autoComplete="name"
            value={contacto.nombre}
            error={errores.nombre}
            valido={contacto.nombre.trim().length >= 3}
            onChange={(e) => setContacto({ ...contacto, nombre: e.target.value })}
          />
          <CampoFlotante
            id="celular"
            etiqueta="Celular"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            prefijo={
              <>
                <BanderaColombia />
                +57
              </>
            }
            value={[digitos.slice(0, 3), digitos.slice(3, 6), digitos.slice(6)].filter(Boolean).join(" ")}
            error={errores.celular}
            valido={REGEX_CELULAR.test(contacto.celular)}
            onChange={(e) => {
              let d = e.target.value.replace(/\D/g, "");
              if (d.length > 10 && d.startsWith("57")) d = d.slice(2);
              d = d.slice(0, 10);
              setContacto({ ...contacto, celular: d ? `+57${d}` : "" });
            }}
          />
          <CampoFlotante
            id="correo"
            etiqueta="Correo electrónico"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={contacto.correo}
            error={errores.correo}
            valido={REGEX_CORREO.test(contacto.correo.trim())}
            onChange={(e) => setContacto({ ...contacto, correo: e.target.value })}
          />
        </div>
        <Acciones>
          <BotonPrimario>Siguiente</BotonPrimario>
        </Acciones>
      </form>
    );
  } else if (paso === "fuente") {
    contenido = (
      <form noValidate onSubmit={enviar}>
        <Pregunta id="fuente" titulo="¿Cómo te enteraste de Cifrato?" error={errores.fuente}>
          <div role="radiogroup" aria-labelledby="fuente-titulo" className="flex flex-wrap gap-2">
            {[...OPCIONES_FUENTE, OTRO].map((o) => (
              <Chip
                key={o}
                rol="radio"
                texto={o}
                elegida={contacto.fuente === o}
                onClick={() => {
                  setContacto({ ...contacto, fuente: o });
                  if (o !== OTRO) window.setTimeout(() => siguiente("fuente"), AVANCE_MS);
                }}
              />
            ))}
          </div>
          {contacto.fuente === OTRO && (
            <div className="mt-4">
              <CampoFlotante
                id="fuenteOtro"
                etiqueta="¿Dónde nos conociste?"
                value={fuenteOtro}
                error={errores.fuente}
                valido={fuenteOtro.trim().length > 1}
                onChange={(e) => setFuenteOtro(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </Pregunta>
        <Acciones atras={() => irA("datos")}>{contacto.fuente === OTRO && <BotonPrimario>Siguiente</BotonPrimario>}</Acciones>
      </form>
    );
  } else if (paso === "tipo") {
    contenido = (
      <div>
        <Pregunta id="tipo" titulo="Tipo de empresa" error={errores.tipo}>
          <div role="radiogroup" aria-labelledby="tipo-titulo" className="flex flex-col gap-2.5">
            {OPCIONES_TIPO_EMPRESA.map((o, i) => (
              <OpcionTecla key={o} tecla={LETRAS[i]} texto={o} elegida={empresa.tipoEmpresa === o} onElegir={() => elegirTipo(o)} />
            ))}
          </div>
        </Pregunta>
        <Acciones atras={() => irA("fuente")} />
      </div>
    );
  } else if (paso === "empresa") {
    contenido = (
      <form noValidate onSubmit={enviar}>
        <Pregunta
          id="empresa"
          titulo="Nombre de tu empresa o nombre como contador"
          error={errores.empresa}
        >
          <CampoFlotante
            id="empresa"
            etiqueta="Nombre"
            autoComplete="organization"
            value={empresa.nombreEmpresa}
            valido={empresa.nombreEmpresa.trim().length > 1}
            onChange={(e) => setEmpresa({ ...empresa, nombreEmpresa: e.target.value })}
          />
        </Pregunta>
        <Acciones atras={() => irA("tipo")}>
          <BotonPrimario>Siguiente</BotonPrimario>
        </Acciones>
      </form>
    );
  } else if (paso === "erp") {
    contenido = (
      <form noValidate onSubmit={enviar}>
        <Pregunta
          id="erp"
          titulo="¿Qué software contable (ERP) utilizas en las empresas que manejas?"
          ayuda={
            <>
              Selecciona todos los que apliquen. <em>Por ahora, Cifrato</em>{" "}
              <strong className="font-bold not-italic text-respuesta">solo tiene integración</strong> <em>con estos sistemas:</em>
            </>
          }
          error={errores.erp}
        >
          <div role="group" aria-labelledby="erp-titulo" className="flex flex-wrap gap-2">
            {OPCIONES_ERP.map((o) => (
              <Chip
                key={o}
                texto={o}
                elegida={empresa.erps.includes(o)}
                onClick={() =>
                  setEmpresa({
                    ...empresa,
                    erps: empresa.erps.includes(o) ? empresa.erps.filter((x) => x !== o) : [...empresa.erps, o],
                  })
                }
              />
            ))}
          </div>
        </Pregunta>
        <Acciones atras={() => irA("empresa")}>
          <BotonPrimario>Siguiente</BotonPrimario>
        </Acciones>
      </form>
    );
  } else if (paso === "facturas") {
    contenido = (
      <div>
        <Pregunta
          id="facturas"
          error={errores.facturas}
          titulo={
            empresa.tipoEmpresa === "Empresa individual" ? (
              "¿Cuántas facturas electrónicas de compra causa mensualmente tu empresa?"
            ) : (
              <span className="text-[20px] sm:text-[24px]">
                Teniendo en cuenta <span className="text-primario-oscuro">solo los sistemas contables integrados con Cifrato,</span> ¿en qué rango{" "}
                <span className="text-primario-oscuro">mensual</span> está el total de facturas electrónicas de compra y venta que causas mes a mes?
              </span>
            )
          }
        >
          <div role="radiogroup" aria-labelledby="facturas-titulo" className="grid gap-2.5 sm:grid-cols-2">
            {OPCIONES_FACTURAS.map((o, i) => (
              <OpcionTecla key={o} tecla={LETRAS[i]} texto={o} elegida={empresa.facturas === o} onElegir={() => elegirFacturas(o)} />
            ))}
          </div>
        </Pregunta>
        <Acciones atras={() => irA("erp")} />
      </div>
    );
  } else if (paso === "agenda" && agenda) {
    contenido = (
      <>
        <InfoReunion config={agenda} />
        <SelectorHorario
          config={agenda}
          correo={contacto.correo}
          onElegir={setHorario}
          onAtras={() => irA("facturas")}
          onAgendar={(cuando) => {
            setAgendado(cuando);
            if (leadId.current) marcarAgendado(leadId.current, cuando.toISOString());
            setCaminoAgendado(camino);
            irA(dudas.length && leadId.current ? "aclarar" : "final");
          }}
        />
      </>
    );
  } else if (paso === "aclarar" && dudaActual) {
    // Una pregunta por pantalla; la segunda entra con la misma animación que las del formulario.
    const n = dudas.indexOf(dudaActual);
    contenido = (
      <div key={dudaActual.id} className="animate-entrar motion-reduce:animate-none">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-primario-oscuro">
          <IconoCheck className="h-4 w-4" />
          Tu reunión quedó agendada
        </p>
        <p className="mt-5 text-[14px] font-medium text-ayuda">
          {dudas.length > 1 ? `Para preparar tu reunión · ${n + 1} de ${dudas.length}` : "Para preparar tu reunión"}
        </p>
        <Pregunta id="aclarar" titulo={dudaActual.pregunta}>
          <div role="radiogroup" aria-labelledby="aclarar-titulo" className="flex flex-col gap-2.5">
            {dudaActual.opciones.map((o, i) => (
              <OpcionTecla key={o} tecla={LETRAS[i]} texto={o} elegida={respuestas[dudaActual.id] === o} onElegir={() => responderDuda(o)} />
            ))}
          </div>
        </Pregunta>
        {n > 0 && <Acciones atras={() => setIndiceDuda(n - 1)} />}
      </div>
    );
  } else if (paso === "ajustando") {
    contenido = (
      <div aria-live="polite">
        <h2 className="text-[22px] font-bold leading-[1.25] tracking-[-0.015em] text-respuesta sm:text-[28px]">Ajustando tu reunión…</h2>
      </div>
    );
  } else if (paso === "analizando") {
    contenido = (
      <div aria-live="polite">
        <h2 className="text-[22px] font-bold leading-[1.25] tracking-[-0.015em] text-respuesta sm:text-[28px]">Preparando tu reunión…</h2>
        <ul className="mt-8 flex flex-col gap-4">
          {["Verificando tu empresa", "Revisando tu volumen y software contable", "Eligiendo la reunión ideal para ti"].map((t, i) => (
            <li
              key={t}
              className="flex animate-entrar items-center gap-3 text-[16px] font-medium text-pregunta [animation-fill-mode:both] motion-reduce:animate-none"
              style={{ animationDelay: `${i * 450}ms` }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primario/15">
                <IconoCheck className="h-3.5 w-3.5 text-primario-oscuro" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (paso === "aviso" && destino?.tipo === "erp_no_soportado") {
    contenido = (
      <Aviso icono="⚠️" titulo="Gracias por tu interés en Cifrato" onAtras={() => irA("facturas")} onTerminar={() => irA("final")}>
        <p>
          Hoy solo integramos con <strong className="text-respuesta">Siigo, Helisa, Siesa, Alegra, Loggro, World Office, ContaI y Odoo.</strong>
        </p>
        <p>Aún así, registraremos tu información y el ERP que usas para tenerte en cuenta cuando lancemos nuevas integraciones.</p>
      </Aviso>
    );
  } else if (paso === "aviso") {
    contenido = (
      <Aviso icono="👋" titulo="Gracias por tu interés en Cifrato." onAtras={() => irA("facturas")} onTerminar={() => irA("final")}>
        <p>
          Por el volumen de facturas que manejas no es posible tener una reunión, pero puedes comenzar de inmediato con nuestro{" "}
          <strong className="text-respuesta">flujo de auto-onboarding</strong>, pensado para que actives la automatización sin esperas y a tu ritmo.
        </p>
        <ul className="flex flex-col gap-2">
          {["3 días gratuitos", "Procesa hasta 50 facturas de prueba", "Configura Cifrato en minutos siguiendo nuestros tutoriales"].map((t) => (
            <li key={t} className="flex items-center gap-2.5 font-semibold text-respuesta">
              <IconoCheck className="h-5 w-5 text-primario-oscuro" />
              {t}
            </li>
          ))}
        </ul>
        <p className="font-semibold text-respuesta">📌 Después del periodo gratuito puedes contactarnos para el precio del paquete a tu medida.</p>
      </Aviso>
    );
  } else if (paso === "final") {
    contenido = (
      <div className="flex flex-col items-start">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primario">
          <IconoCheck className="h-8 w-8 text-white" />
        </span>
        <h1 className="mt-6 text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-respuesta sm:text-[36px]">
          {agendado ? "¡Gracias!" : "Gracias por tu información."}
        </h1>
        {agendado && (
          <>
            {/* La reunión que quedó; si la aclaración la cambió, solo se nota en "en el mismo horario". */}
            {agenda && (
              <p className="mt-3 text-[18px] font-semibold text-respuesta">
                {agenda.titulo} ({agenda.duracionMin} min){cambio ? ", en el mismo horario." : ""}
              </p>
            )}
            <p className="mt-1.5 text-[16px] font-medium text-pregunta first-letter:uppercase">{horario} · Google Meet</p>
            <p className="mt-2 text-[15px] text-pregunta">
              La invitación llegará al correo <strong className="text-respuesta">{contacto.correo}</strong>
            </p>
            {camino && MENSAJE_CAMINO[camino] && (
              <p className="mt-6 max-w-[460px] border-l-2 border-primario pl-4 text-[15px] leading-[22px] text-pregunta">{MENSAJE_CAMINO[camino]}</p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid h-dvh overflow-hidden md:grid-cols-[minmax(360px,44%)_1fr]">
      {/* Panel oscuro fijo: logo e ilustración animada de Cifrato */}
      <aside
        className="relative hidden flex-col overflow-hidden bg-[#0a0b0d] px-10 py-10 text-white md:flex xl:px-14"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/cifrato/logo-blanco.svg" alt="Cifrato" width={307} height={56} className="h-7 w-auto self-start" />
        <div className="flex flex-1 items-center justify-center py-8">
          <IlustracionCifrato className="!h-auto aspect-[1300/706] w-full max-w-[440px]" />
        </div>
      </aside>

      {/* Zona de la pregunta */}
      <section className="flex h-dvh min-w-0 flex-col bg-fondo">
        <header className="mx-auto w-full max-w-[620px] px-6 pt-4 sm:px-12 md:pt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cifrato/logo.svg" alt="Cifrato" width={307} height={56} className="mb-4 h-6 w-auto bajo:mb-2 md:hidden" />
          <IndicadorAvance pasos={pasos} posicion={posicion} editable={paso !== "final"} onIr={(p) => (PREGUNTAS as readonly string[]).includes(p) && irA(p)} />
        </header>
        <div ref={zona} className="flex-1 overflow-y-auto">
          <div className="flex min-h-full items-center">
            <div key={paso} className="mx-auto w-full max-w-[620px] animate-entrar px-6 py-6 bajo:py-2 sm:py-8 motion-reduce:animate-none sm:px-12">
              {contenido}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Avance minimalista arriba de la pregunta: solo puntos; el actual es una barrita verde.
// Los puntos ya respondidos se pueden tocar para volver a esa pregunta.
function IndicadorAvance<P extends string>({
  pasos,
  posicion,
  editable,
  onIr,
}: {
  pasos: { paso: P; etiqueta: string; valor?: string }[];
  posicion: number;
  editable: boolean;
  onIr: (p: P) => void;
}) {
  return (
    <nav aria-label="Avance" className="flex h-6 items-center">
      <ol className="flex items-center">
        {pasos.map((p, i) => {
          const hecho = i < posicion;
          const esActual = i === posicion;
          return (
            <li key={p.paso}>
              <button
                type="button"
                disabled={!hecho || !editable}
                onClick={() => onIr(p.paso)}
                title={hecho && p.valor ? `${p.etiqueta}: ${p.valor}` : p.etiqueta}
                aria-label={p.etiqueta}
                aria-current={esActual ? "step" : undefined}
                className="group flex h-6 items-center px-[3px] outline-none disabled:cursor-default"
              >
                <span
                  className={
                    "block h-[5px] rounded-full transition-all duration-500 ease-out group-focus-visible:ring-2 group-focus-visible:ring-primario/40 " +
                    (esActual
                      ? "w-5 bg-primario"
                      : hecho
                        ? "w-[5px] bg-primario/70 group-hover:bg-primario"
                        : "w-[5px] bg-respuesta/15")
                  }
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Lo que ve la persona al terminar, según cómo quedó su reunión.
const MENSAJE_CAMINO: Partial<Record<Camino, string>> = {
  descubrimiento: "Antes de la reunión analizaremos tu operación para llegar con propuestas concretas.",
  persona: "Un asesor especializado revisará tu caso antes de la reunión para llegar con respuestas.",
};

function Aviso({
  icono,
  titulo,
  children,
  onAtras,
  onTerminar,
}: {
  icono: string;
  titulo: string;
  children: ReactNode;
  onAtras: () => void;
  onTerminar: () => void;
}) {
  return (
    <div>
      <span className="text-[36px]" aria-hidden>
        {icono}
      </span>
      <h1 className="mt-3 text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-respuesta sm:text-[30px]">{titulo}</h1>
      <div className="mt-5 flex flex-col gap-4 text-[15.5px] leading-[23px] text-pregunta">{children}</div>
      <Acciones atras={onAtras}>
        <BotonPrimario tipo="button" onClick={onTerminar}>
          Terminar
        </BotonPrimario>
      </Acciones>
    </div>
  );
}
