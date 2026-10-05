import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectDir, "dist");
const configuredUrl = process.env.VITE_PUBLIC_SITE_URL?.trim();

let siteUrl = null;
if (configuredUrl) {
  try {
    const parsed = new URL(configuredUrl);
    if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash) {
      throw new Error("The public site URL must be an HTTPS origin without a path.");
    }
    siteUrl = parsed.origin;
  } catch (error) {
    console.warn(`Invalid VITE_PUBLIC_SITE_URL: ${error.message}. Using relative URLs.`);
    siteUrl = null;
  }
}

const pageData = [
  {
    route: "courses",
    title: "دورات الكيمياء النووية وهندسة المفاعلات | مركز المعرفة",
    description: "استكشف دورات الكيمياء النووية والمفاعلات والسلامة الإشعاعية لطلاب الجامعات في السعودية والخليج.",
  },
  {
    route: "simulator",
    title: "محاكاة المفاعل النووي التعليمية | مركز المعرفة",
    description: "جرّب محاكاة تعليمية مبسطة للمفاعل النووي وعوامل التحكم والتفاعلات المتسلسلة.",
  },
  {
    route: "instructor",
    title: "المهندس محمود شلتوت | مدرب الكيمياء النووية",
    description: "تعرّف على خبرة المهندس محمود شلتوت (12+ سنة) ومجالات تدريسه في الكيمياء النووية والمفاعلات والسلامة الإشعاعية.",
  },
  {
    route: "booking",
    title: "حجز جلسة تعليمية في الكيمياء النووية | مركز المعرفة",
    description: "احجز جلسة تعليمية فردية في الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية.",
  },
  {
    route: "student-portal",
    title: "بوابة الطالب والدروس النووية | مركز المعرفة",
    description: "تابع الدروس والمقررات والتقدم الدراسي في بوابة مركز المعرفة النووية.",
    private: true,
  },
  {
    route: "admin",
    title: "دخول الإدارة | مركز المعرفة النووية",
    description: "دخول آمن لإدارة مركز المعرفة النووية.",
    private: true,
  },
];

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const updateMeta = (html, kind, name, content) => {
  const key = kind === "property" ? "property" : "name";
  const pattern = new RegExp(`<meta\\s+${key}="${name}"[^>]*>`);
  const replacement = `<meta ${key}="${name}" content="${escapeHtml(content)}" />`;
  return html.replace(pattern, replacement);
};

const indexPath = path.join(outputDir, "index.html");
const rootHtml = await readFile(indexPath, "utf8");
await mkdir(outputDir, { recursive: true });

for (const page of pageData) {
  let html = rootHtml.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = updateMeta(html, "name", "description", page.description);
  html = updateMeta(html, "name", "robots", page.private ? "noindex, nofollow" : "index, follow");
  html = updateMeta(html, "property", "og:title", page.title);
  html = updateMeta(html, "property", "og:description", page.description);
  html = updateMeta(html, "name", "twitter:title", page.title);
  html = updateMeta(html, "name", "twitter:description", page.description);

  const canonicalPath = `/${page.route}`;
  const canonicalUrl = siteUrl ? `${siteUrl}${canonicalPath}` : canonicalPath;
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  );
  html = updateMeta(html, "property", "og:url", canonicalUrl);

  if (siteUrl) {
    const socialImage = `${siteUrl}/og-image.png`;
    html = updateMeta(html, "property", "og:image", socialImage);
    html = updateMeta(html, "name", "twitter:image", socialImage);
  }
  const routeDirectory = path.join(outputDir, page.route);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, "index.html"), html);
}

const publicRoutes = ["", "courses", "simulator", "instructor", "booking"];
const baseForSitemap = siteUrl || "https://nuclear-knowledge-hub.vercel.app";
const urls = publicRoutes
  .map((route) => {
    const location = route ? `${baseForSitemap}/${route}` : `${baseForSitemap}/`;
    const priority = route ? "0.8" : "1.0";
    return `  <url><loc>${location}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
  })
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robots = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /admin",
  "Disallow: /student-portal",
  `Sitemap: ${baseForSitemap}/sitemap.xml`,
  "",
].join("\n");

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "sitemap.xml"), sitemap);
await writeFile(path.join(outputDir, "robots.txt"), robots);

if (siteUrl) {
  let html = rootHtml;
  html = html
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${siteUrl}/$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${siteUrl}/$2`);
  html = updateMeta(html, "property", "og:image", `${siteUrl}/og-image.png`);
  html = updateMeta(html, "name", "twitter:image", `${siteUrl}/og-image.png`);
  await writeFile(indexPath, html);
}
console.info("Generated static route SEO HTML, sitemap.xml, and robots.txt.");
