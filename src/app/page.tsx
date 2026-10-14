import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm text-ayuda">
        Prototipo independiente de Andrés Olaya. No es un sitio oficial de Cifrato.
      </p>
      <h1 className="text-2xl font-semibold text-respuesta">Precalificación automática para Cifrato</h1>
      <Link href="/demo" className="rounded-[6px] bg-primario px-4 py-2 font-medium text-white">
        Ver el formulario de demo
      </Link>
    </main>
  );
}
