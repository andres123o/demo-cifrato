import type { Metadata } from "next";
import { FormularioDemo } from "@/components/demo/FormularioDemo";

export const metadata: Metadata = {
  title: "Agenda una demo · Prototipo",
};

export default function PaginaDemo() {
  return <FormularioDemo />;
}
