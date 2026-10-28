// @vitest-environment jsdom
import { describe, expect, it, afterEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MobileFiltersSheet } from "@/components/search/MobileFiltersSheet";

// FilterBar navega con useRouter, igual que en el resto de la suite.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(cleanup);

const CITIES = ["Armenia", "Bogota", "Medellin"];
const EMPTY = {};

describe("botón de filtros de la vitrina", () => {
  it("abre el panel de filtros al pulsarlo", () => {
    render(
      <MobileFiltersSheet cities={CITIES} current={EMPTY} activeCount={0} />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Cerrar filtros")).toBeInTheDocument();
  });

  it("el panel ofrece las ciudades recibidas", () => {
    const { container } = render(
      <MobileFiltersSheet cities={CITIES} current={EMPTY} activeCount={0} />
    );
    fireEvent.click(screen.getByRole("button", { name: /filtros/i }));

    // El input de ciudad se apoya en un <datalist> para el autocompletado.
    const input = screen.getByPlaceholderText("Ciudad o municipio");
    const listId = input.getAttribute("list");
    expect(listId).toBeTruthy();

    const valores = Array.from(
      container.querySelectorAll(`datalist#${listId} option`)
    ).map((o) => o.getAttribute("value"));
    expect(valores).toEqual(CITIES);
  });

  it("se cierra con el botón de cerrar y con el fondo", () => {
    render(
      <MobileFiltersSheet cities={CITIES} current={EMPTY} activeCount={0} />
    );
    fireEvent.click(screen.getByRole("button", { name: /filtros/i }));
    fireEvent.click(screen.getByLabelText("Cerrar filtros"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /filtros/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("dialog").firstElementChild!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("el botón no se ve en escritorio, donde ya está la barra lateral", () => {
    render(
      <MobileFiltersSheet cities={CITIES} current={EMPTY} activeCount={0} />
    );

    // El panel que abre el botón es `lg:hidden`; si el botón no lleva el mismo
    // `lg:hidden`, en escritorio se abre un panel invisible y parece inerte.
    expect(screen.getByRole("button", { name: /filtros/i })).toHaveClass(
      "lg:hidden"
    );
  });

  it("muestra cuántos filtros hay activos", () => {
    render(
      <MobileFiltersSheet cities={CITIES} current={EMPTY} activeCount={3} />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
