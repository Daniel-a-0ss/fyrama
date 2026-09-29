// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Pagination, buildPageUrl, pageOfRange } from "@/components/ui/Pagination";
import { StatusBadge } from "@/components/ui/Badge";

afterEach(cleanup);

describe("pageOfRange", () => {
  it("lista todas las páginas si hay pocas", () => {
    expect(pageOfRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("colapsa rangos grandes con elipsis", () => {
    expect(pageOfRange(5, 100)).toEqual([1, "…", 4, 5, 6, "…", 100]);
    expect(pageOfRange(1, 100)).toEqual([1, 2, "…", 100]);
  });
});

describe("buildPageUrl", () => {
  it("añade page y conserva parámetros", () => {
    expect(buildPageUrl("/viviendas", { ciudad: "armenia" }, 3)).toBe(
      "/viviendas?ciudad=armenia&page=3"
    );
  });

  it("no añade parámetros vacíos", () => {
    expect(buildPageUrl("/viviendas", { zona: "" }, 1)).toBe("/viviendas?page=1");
  });
});

describe("Pagination", () => {
  it("no renderiza si hay una sola página", () => {
    const { container } = render(
      <Pagination current={1} total={1} basePath="/viviendas" />
    );
    expect(container.innerHTML).toBe("");
  });

  it("marca la página actual como aria-current", () => {
    render(<Pagination current={2} total={3} basePath="/viviendas" />);
    const current = screen.getByRole("link", { name: "2" });
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Página anterior" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Página siguiente" })).toBeDefined();
  });

  it("deshabilita la paginación en el borde inicial", () => {
    render(<Pagination current={1} total={5} basePath="/viviendas" />);
    expect(screen.queryByRole("link", { name: "Página anterior" })).toBeNull();
    expect(screen.getByRole("link", { name: "Página siguiente" })).toBeDefined();
  });
});

describe("StatusBadge", () => {
  it("muestra la etiqueta correcta por status", () => {
    const { rerender } = render(<StatusBadge status="PUBLISHED" />);
    expect(screen.getByText("Publicado")).toBeDefined();
    rerender(<StatusBadge status="DRAFT" />);
    expect(screen.getByText("Borrador")).toBeDefined();
  });

  it("reproduce labels desconocidos tal cual", () => {
    render(<StatusBadge status="ARCHIVADO" />);
    expect(screen.getByText("ARCHIVADO")).toBeDefined();
  });
});