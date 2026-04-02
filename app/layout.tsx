import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyra Salon & Academy — Pune's Premier Luxury Salon",
  description:
    "Experience luxury hair & beauty treatments at Cyra Salon & Academy, Koregaon Park, Pune. Keratin, balayage, bridal packages & more.",
  keywords: "salon pune, hair salon koregaon park, keratin treatment pune, bridal makeup pune, cyra salon",
  openGraph: {
    title: "Cyra Salon & Academy",
    description: "Pune's Premier Luxury Salon & Academy",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#BFA06A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* All required fonts — Cinzel Decorative for brand, Marcellus for sub-brand, Jost for body */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Marcellus&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Theme init — default LIGHT, only apply dark if explicitly stored */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('cyra_theme');
                  if(t === 'dark') document.documentElement.classList.add('dark');
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#1C1710",
              border: "1px solid rgba(191,160,106,0.3)",
              fontFamily: "'Jost', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            },
            success: {
              iconTheme: { primary: "#BFA06A", secondary: "#FFFFFF" },
            },
          }}
        />
      </body>
    </html>
  );
}
