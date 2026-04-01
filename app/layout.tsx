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
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Jost:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Theme init script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('cyra_theme');
                  var p = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var theme = t || p;
                  if(theme === 'dark') document.documentElement.classList.add('dark');
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
              background: "#1C1914",
              color: "#F0E8D8",
              border: "1px solid rgba(191,160,106,0.25)",
              fontFamily: "'Jost', sans-serif",
              fontSize: "14px",
              borderRadius: "12px",
            },
            success: {
              iconTheme: { primary: "#BFA06A", secondary: "#0C0B09" },
            },
          }}
        />
      </body>
    </html>
  );
}
