import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const SITE_URL = "https://www.cyrasalon.in"; // update if domain differs

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cyra Salon & Academy — Pune's Premier Luxury Salon",
    template: "%s | Cyra Salon & Academy",
  },
  description:
    "Experience luxury hair & beauty treatments at Cyra Salon & Academy, Koregaon Park, Pune. Specialising in Keratin, Balayage, Bridal packages, Hair Spa & professional beauty courses.",
  keywords: [
    "salon pune", "hair salon koregaon park", "keratin treatment pune",
    "balayage pune", "bridal makeup pune", "hair spa pune",
    "beauty academy pune", "cyra salon", "luxury salon pune",
  ],
  authors: [{ name: "Cyra Salon & Academy" }],
  creator: "Cyra Salon & Academy",
  publisher: "Cyra Salon & Academy",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Cyra Salon & Academy — Pune's Premier Luxury Salon",
    description:
      "Luxury hair & beauty treatments in Koregaon Park, Pune. Keratin, Balayage, Bridal & more.",
    url: SITE_URL,
    siteName: "Cyra Salon & Academy",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyra Salon & Academy — Pune's Premier Luxury Salon",
    description:
      "Luxury hair & beauty treatments in Koregaon Park, Pune. Keratin, Balayage, Bridal & more.",
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
      {/* Local Business structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HairSalon",
              "name": "Cyra Salon & Academy",
              "description": "Luxury hair & beauty salon and professional academy in Koregaon Park, Pune.",
              "url": "https://www.cyrasalon.in",
              "telephone": "+91-XXXXXXXXXX",
              "priceRange": "₹₹₹",
              "image": "https://www.cyrasalon.in/og-image.jpg",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Koregaon Park",
                "addressLocality": "Pune",
                "addressRegion": "Maharashtra",
                "postalCode": "411001",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "18.5362",
                "longitude": "73.8940"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
                ],
                "opens": "10:00",
                "closes": "20:00"
              },
              "sameAs": []
            }),
          }}
        />
        {/* Geo meta */}
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Pune" />
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
