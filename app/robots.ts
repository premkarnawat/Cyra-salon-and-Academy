import type { MetadataRoute } from "next";

const SITE_URL = "https://www.cyrasalon.com"; // update if domain differs

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
