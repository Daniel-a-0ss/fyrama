import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppWidget } from "@/components/site/whatsapp/WhatsAppWidget";
import { SocialFloatingBar } from "@/components/site/social/SocialFloatingBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <SocialFloatingBar />
      <WhatsAppWidget />
    </>
  );
}