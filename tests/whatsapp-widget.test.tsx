// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WhatsAppWidget } from "@/components/site/whatsapp/WhatsAppWidget";

describe("WhatsAppWidget", () => {
  beforeEach(() => {
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  it("muestra inicialmente solo el botón flotante", () => {
    render(<WhatsAppWidget />);
    expect(screen.getByLabelText(/abrir chat/i)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre y cierra el chat desde el botón", () => {
    render(<WhatsAppWidget />);
    const toggle = screen.getByLabelText(/abrir chat/i);

    fireEvent.click(toggle);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Asesoría inmobiliaria y jurídica")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Cerrar chat"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("abre wa.me con el mensaje escrito al enviar", () => {
    render(<WhatsAppWidget />);
    fireEvent.click(screen.getByLabelText(/abrir chat/i));

    const input = screen.getByLabelText(/escribe tu mensaje/i);
    fireEvent.change(input, { target: { value: "Buenas tardes" } });
    fireEvent.click(screen.getByLabelText("Enviar mensaje"));

    expect(window.open).toHaveBeenCalledWith(
      `https://wa.me/573118870533?text=${encodeURIComponent("Buenas tardes")}`,
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("envía el mensaje por defecto si la caja está vacía", () => {
    render(<WhatsAppWidget />);
    fireEvent.click(screen.getByLabelText(/abrir chat/i));
    fireEvent.click(screen.getByLabelText("Enviar mensaje"));

    const url = vi.mocked(window.open).mock.calls[0][0] as string;
    expect(url.startsWith("https://wa.me/573118870533?text=")).toBe(true);
  });

  it("cierra con la tecla Escape", () => {
    render(<WhatsAppWidget />);
    fireEvent.click(screen.getByLabelText(/abrir chat/i));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});