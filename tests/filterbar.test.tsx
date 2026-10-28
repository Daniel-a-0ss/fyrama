// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FilterBar } from "@/components/search/FilterBar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

it("muestra los filtros basicos del buscador", () => {
  render(<FilterBar cities={["Bogotá"]} initial={{}} />);
  expect(screen.getByPlaceholderText(/ciudad o municipio/i)).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: /tipo de inmueble/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /buscar/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /limpiar/i })).toBeInTheDocument();
});

it("no ofrece precio, habitaciones ni baños en el buscador", () => {
  render(<FilterBar cities={["Bogotá"]} initial={{}} />);
  expect(screen.queryByRole("combobox", { name: /precio mínimo/i })).toBeNull();
  expect(screen.queryByRole("combobox", { name: /precio máximo/i })).toBeNull();
  expect(screen.queryByRole("combobox", { name: /habitaciones/i })).toBeNull();
  expect(screen.queryByRole("combobox", { name: /baños/i })).toBeNull();
  expect(screen.queryByText(/cualquier precio/i)).toBeNull();
});

it("ya no ofrece filtros avanzados", () => {
  render(<FilterBar cities={["Bogotá"]} initial={{}} />);
  expect(screen.queryByRole("button", { name: /filtros avanzados/i })).toBeNull();
  expect(screen.queryByText(/área mínima/i)).toBeNull();
  expect(screen.queryByText(/características adicionales/i)).toBeNull();
  expect(screen.queryByText(/estrato/i)).toBeNull();
  expect(screen.queryByText(/parqueaderos/i)).toBeNull();
});

it("ofrece Venta, Arrendamiento y Permuta en el buscador", () => {
  render(<FilterBar cities={["Bogotá"]} initial={{}} />);
  expect(
    screen.getByRole("radio", { name: "Venta", hidden: true })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("radio", { name: "Arrendamiento", hidden: true })
  ).toBeInTheDocument();
  const permuta = screen.getByRole("link", { name: "Permuta" });
  expect(permuta).toHaveAttribute("href", "/permuta");
});
