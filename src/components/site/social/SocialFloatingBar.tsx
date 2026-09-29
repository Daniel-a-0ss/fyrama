import { Facebook, Instagram } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/site/whatsapp/WhatsAppIcon";
import { TikTokIcon } from "@/components/site/social/TikTokIcon";

const items = [
  {
    label: "WhatsApp",
    href: buildWhatsAppUrl(),
    brand: "#25d366",
    Icon: WhatsAppIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/fyrama.co",
    brand: "#1877f2",
    Icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/fyrama.co",
    brand: "#e4405f",
    Icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@fyrama.co",
    brand: "#111111",
    Icon: TikTokIcon,
  },
];

export function SocialFloatingBar() {
  return (
    <div
      aria-label="Redes sociales"
      className="pointer-events-none fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-[calc(1.25rem+env(safe-area-inset-left))] z-[80] flex flex-row gap-2"
    >
      {items.map(({ label, href, brand, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="group pointer-events-auto relative grid size-10 shrink-0 place-items-center rounded-full text-white shadow-fyrama transition-all hover:size-11 sm:size-11 sm:hover:size-12"
          style={{ backgroundColor: brand }}
        >
          <Icon className="size-[18px]" aria-hidden />
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-pine-950 px-3 py-1.5 text-xs font-medium text-bone-50 shadow-fyrama group-hover:block">
            {label}
          </span>
        </a>
      ))}
    </div>
  );
}