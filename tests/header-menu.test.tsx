// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Header } from "@/components/site/Header";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";

/** El layout real pasa el menú armado desde la base de datos. Estos tests
 *  reproducen esa situación con los dos grupos de servicios ya despliegueables. */
const ITEMS: NavItem[] = NAV_ITEMS.map((item) =>
  item.label === "Servicios jurídicos"
    ? {
        ...item,
        children: [
          { label: "Acciones de tutela", href: "/asesoria-juridica#servicio-acciones-de-tutela" },
          { label: "Estudio de títulos", href: "/asesoria-juridica#servicio-estudio-de-titulos" },
        ],
      }
    : item.label === "Servicios inmobiliarios"
      ? {
          ...item,
          children: [
            { label: "Inmuebles en venta", href: "/servicios-inmobiliarios#servicio-inmobiliario-inmuebles-en-venta" },
          ],
        }
      : item
);

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
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

describe("Header menú desplegable", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("abre el panel al pulsar Nuestra empresa", () => {
    render(<Header items={ITEMS} />);
    const btn = screen.getByRole("button", { name: /nosotros/i });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("abre Servicios jurídicos", () => {
    render(<Header items={ITEMS} />);
    const btn = screen.getByRole("button", { name: /servicios jurídicos/i });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /tutela/i })).toBeInTheDocument();
  });

  it("abre Servicios inmobiliarios", () => {
    render(<Header items={ITEMS} />);
    const btn = screen.getByRole("button", { name: /servicios inmobiliarios/i });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("se cierra al hacer clic fuera", () => {
    render(<Header items={ITEMS} />);
    const btn = screen.getByRole("button", { name: /nosotros/i });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("abre Vitrina inmobiliaria con venta, arrendamiento y permuta", () => {
    render(<Header items={ITEMS} />);
    const btn = screen.getByRole("button", { name: /vitrina inmobiliaria/i });
    fireEvent.click(btn);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Venta" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Arrendamiento" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Permuta" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Venta$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Arrendamiento$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Permuta$/ })).not.toBeInTheDocument();
  });

  it("mantiene el panel pegado al botón, sin hueco que lo cierre", () => {
    render(<Header items={ITEMS} />);
    const btn = screen.getByRole("button", { name: /nosotros/i });
    fireEvent.click(btn);
    const menu = screen.getByRole("menu");
    expect(menu.className).toContain("top-full");
    expect(menu.className).not.toContain("calc(100%+");
    expect(btn.closest("li")).toContainElement(menu);
  });

  it("no se cierra al pasar el cursor del botón al panel", () => {
    vi.useFakeTimers();
    render(<Header items={ITEMS} />);
    const item = screen.getByRole("button", { name: /nosotros/i }).closest("li")!;
    fireEvent.mouseEnter(item);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.mouseLeave(item);
    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("cierra el panel al elegir una opción", () => {
    render(<Header items={ITEMS} />);
    fireEvent.click(screen.getByRole("button", { name: /vitrina inmobiliaria/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Permuta" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
