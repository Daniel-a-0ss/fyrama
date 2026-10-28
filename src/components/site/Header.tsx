"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Menu, PhoneCall, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";

const CLOSE_DELAY_MS = 220;

function isGroup(item: NavItem) {
  return Boolean(item.children && item.children.length > 0);
}

export function Header({ items = NAV_ITEMS }: { items?: NavItem[] }) {
  const pathname = usePathname();
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bone-200/80 bg-bone-50">
      <div className="mx-auto flex h-32 max-w-[96rem] items-center justify-between gap-2 pl-3 pr-4 sm:pl-5 sm:pr-6 lg:pl-6 lg:pr-8 2xl:pl-8 2xl:pr-10">
        <Link href="/" className="shrink-0" aria-label="Fyrama — inicio">
          <Logo />
        </Link>

        <nav
          ref={navRef}
          className="hidden items-center xl:flex"
          aria-label="Principal"
        >
          <ul className="flex items-center gap-0.5 2xl:gap-6">
            {items.map((item) => {
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
                          "inline-flex h-32 items-center gap-1 whitespace-nowrap px-0.5 text-[13px] font-medium transition-colors 2xl:gap-1.5 2xl:px-1 2xl:text-base",
                          activeMenu
                            ? "text-pine-900"
                            : "text-ink-700 hover:text-pine-900"
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "size-3 transition-transform 2xl:size-3.5",
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
                            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
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
                        "whitespace-nowrap transition-colors",
                        isCta
                          ? "group ml-2 inline-flex h-10 items-center gap-1.5 rounded-full bg-pine-950 px-4 text-[13px] font-semibold text-bone-50 shadow-fyrama ring-1 ring-inset ring-white/15 transition-all hover:-translate-y-0.5 hover:bg-pine-800 hover:shadow-fyrama-lg 2xl:ml-3 2xl:h-12 2xl:gap-2 2xl:px-6 2xl:text-base"
                          : "h-32 px-0.5 text-[13px] font-medium text-ink-700 hover:text-pine-900 2xl:px-1 2xl:text-base"
                      )}
                    >
                      {isCta && (
                        <PhoneCall
                          className="size-3.5 shrink-0 text-gold-400 transition-colors group-hover:text-gold-300 2xl:size-4"
                          aria-hidden
                        />
                      )}
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-xl text-ink-900 transition-colors hover:bg-bone-100 xl:hidden"
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
            className="fixed inset-0 top-32 bg-pine-950/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-x-0 top-32 z-10 max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-bone-200 bg-bone-50 px-4 pb-6 pt-3 shadow-fyrama-lg"
            aria-label="Principal móvil"
          >
            <ul className="space-y-1.5">
              {items.map((item) => {
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