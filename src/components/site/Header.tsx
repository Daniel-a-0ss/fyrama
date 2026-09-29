"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";

const CLOSE_DELAY_MS = 220;

function isGroup(item: NavItem) {
  return Boolean(item.children && item.children.length > 0);
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openGroup = useCallback(
    (label: string) => {
      clearCloseTimer();
      setOpenMenu((current) => (current === label ? current : label));
    },
    [clearCloseTimer]
  );

  const scheduleCloseGroup = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => {
      setOpenMenu(null);
      closeTimer.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    clearCloseTimer();
    setOpen(false);
    setOpenMenu(null);
    setMobileMenu(null);
  }, [pathname, clearCloseTimer]);

  useEffect(() => {
    if (!openMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        clearCloseTimer();
        setOpenMenu(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearCloseTimer();
        setOpenMenu(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu, clearCloseTimer]);

  const overHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        overHero
          ? "bg-transparent"
          : "border-b border-bone-200/80 bg-bone-50/85 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="Fyrama — inicio">
          <Logo tone={overHero ? "light" : "dark"} />
        </Link>

        <nav
          ref={navRef}
          className="hidden items-center xl:flex"
          aria-label="Principal"
        >
          <ul className="flex items-center gap-3 2xl:gap-6">
            {NAV_ITEMS.map((item) => {
              const group = isGroup(item);
              const isCta = item.label === "Contáctanos";
              const activeMenu = openMenu === item.label;
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => group && openGroup(item.label)}
                  onMouseLeave={() => group && scheduleCloseGroup()}
                  onFocus={() => group && openGroup(item.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      clearCloseTimer();
                      setOpenMenu(null);
                    }
                  }}
                >
                  {group ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={activeMenu}
                        onClick={() => openGroup(item.label)}
                        className={cn(
                          "inline-flex h-16 items-center gap-1.5 whitespace-nowrap px-1 text-[13px] font-medium transition-colors xl:text-sm",
                          activeMenu
                            ? overHero
                              ? "text-white"
                              : "text-pine-900"
                            : overHero
                              ? "text-bone-100/90 hover:text-white"
                              : "text-ink-700 hover:text-pine-900"
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "size-3.5 transition-transform",
                            activeMenu && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                      {activeMenu && (
                        <div
                          role="menu"
                          className={cn(
                            "animate-fade-in absolute left-1/2 top-full max-w-[calc(100vw-2rem)] -translate-x-1/2 pt-2",
                            item.children!.length > 5 ? "w-[40rem]" : "w-[20rem]"
                          )}
                        >
                          <div className="w-full rounded-2xl border border-bone-200/70 bg-bone-50 p-4 shadow-fyrama-lg">
                            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                              {item.label}
                            </p>
                            <ul
                              className={cn(
                                "grid gap-y-1",
                                item.children!.length > 5
                                  ? "grid-cols-2 gap-x-3"
                                  : ""
                              )}
                            >
                              {item.children!.map((c) => (
                                <li key={c.href + c.label}>
                                  <Link
                                    role="menuitem"
                                    href={c.href}
                                    onClick={() => {
                                      clearCloseTimer();
                                      setOpenMenu(null);
                                    }}
                                    className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm leading-snug text-ink-700 transition-colors hover:bg-pine-50 hover:text-pine-900"
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href ?? "/"}
                      className={cn(
                        "inline-flex items-center whitespace-nowrap text-[13px] font-medium transition-colors xl:text-sm",
                        isCta
                          ? overHero
                            ? "ml-4 h-10 rounded-full bg-white/10 px-5 text-bone-50 ring-1 ring-white/30 transition-colors hover:bg-white/20"
                            : "ml-4 h-10 rounded-full bg-pine-950 px-5 text-bone-50 transition-colors hover:bg-pine-800"
                          : cn(
                              "h-16 px-1",
                              overHero
                                ? "text-bone-100/90 hover:text-white"
                                : "text-ink-700 hover:text-pine-900"
                            )
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle
            className={cn(
              "grid size-11 place-items-center rounded-xl transition-colors",
              overHero
                ? "text-white hover:bg-white/10"
                : "text-ink-700 hover:bg-bone-100"
            )}
          />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-xl transition-colors xl:hidden",
              overHero ? "text-white" : "text-ink-900"
            )}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="animate-fade-in xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div
            className="fixed inset-0 top-16 bg-pine-950/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-x-0 top-16 z-10 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-bone-200 bg-bone-50 px-4 pb-6 pt-3 shadow-fyrama-lg"
            aria-label="Principal móvil"
          >
            <ul className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const group = isGroup(item);
                const isCta = item.label === "Contáctanos";
                return (
                  <li key={item.label}>
                    {group ? (
                      <div>
                        <button
                          type="button"
                          aria-expanded={mobileMenu === item.label}
                          onClick={() =>
                            setMobileMenu((v) =>
                              v === item.label ? null : item.label
                            )
                          }
                          className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-3.5 text-base font-medium text-ink-800 hover:bg-bone-100"
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              "size-4 text-ink-400 transition-transform",
                              mobileMenu === item.label && "rotate-180"
                            )}
                            aria-hidden
                          />
                        </button>
                        {mobileMenu === item.label && (
                          <ul className="mt-1.5 space-y-0.5 border-l-2 border-pine-200 pl-4">
                            {item.children!.map((c) => (
                              <li key={c.href + c.label}>
                                <Link
                                  href={c.href}
                                  onClick={() => {
                                    setMobileMenu(null);
                                    setOpen(false);
                                  }}
                                  className="block rounded-lg px-3 py-2.5 text-sm text-ink-600 hover:bg-bone-100 hover:text-ink-900"
                                >
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href ?? "/"}
                        onClick={() => {
                          setMobileMenu(null);
                          setOpen(false);
                        }}
                        className={cn(
                          "block rounded-xl px-3 py-3.5 text-base font-medium text-ink-800 hover:bg-bone-100",
                          isCta &&
                            "mt-3 bg-pine-950 text-center text-bone-50 hover:bg-pine-800"
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}