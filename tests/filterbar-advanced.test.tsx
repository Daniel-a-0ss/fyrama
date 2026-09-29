// @vitest-environment jsdom
import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterBar } from "@/components/search/FilterBar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

it("muestra los filtros avanzados al pulsar el toggle", () => {
  render(<FilterBar cities={["Bogotá"]} initial={{}} />);
  const btn = screen.getByRole("button", { name: /ver filtros avanzados/i });
  fireEvent.click(btn);
  expect(screen.getByText("Área mínima (m²)")).toBeInTheDocument();
  expect(screen.getByText("Características adicionales")).toBeInTheDocument();
});