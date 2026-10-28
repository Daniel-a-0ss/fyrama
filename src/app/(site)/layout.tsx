import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppWidget } from "@/components/site/whatsapp/WhatsAppWidget";
import { SocialFloatingBar } from "@/components/site/social/SocialFloatingBar";
import { getNavItems } from "@/lib/services/nav";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const items = await getNavItems();

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header items={items} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <SocialFloatingBar />
      <WhatsAppWidget />
    </>
  );
}
