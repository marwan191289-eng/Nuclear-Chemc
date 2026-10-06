import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectDir, "dist");

const DEFAULT_PRODUCTION_URL = "https://nuclear-chemc.vercel.app";
const rawConfiguredUrl = process.env.VITE_PUBLIC_SITE_URL?.trim();

let siteUrl = DEFAULT_PRODUCTION_URL;
if (
  rawConfiguredUrl &&
  !rawConfiguredUrl.includes("nuclear-knowledge-hub.vercel.app") &&
  !rawConfiguredUrl.includes("localhost")
) {
  try {
    const parsed = new URL(rawConfiguredUrl);
    if (parsed.protocol === "https:") {
      siteUrl = parsed.origin;
    }
  } catch {
    siteUrl = DEFAULT_PRODUCTION_URL;
  }
}

const pageData = [
  {
    route: "share",
    title: "Nuclear Knowledge Hub — مركز المعرفة النووية | م. شلتوت",
    description: "منصة تعليمية متخصصة في الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية بإشراف المهندس محمود إسماعيل شلتوت لطلاب الجامعات بالسعودية والخليج.",
  },
  {
    route: "courses",
    title: "دورات الكيمياء النووية والمفاعلات | مركز المعرفة النووية",
    description: "استكشف دورات الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية بإشراف المهندس محمود إسماعيل شلتوت لطلاب الجامعات بالسعودية والخليج.",
  },
  {
    route: "simulator",
    title: "محاكي المفاعل النووي واضمحلال النظائر | مركز المعرفة النووية",
    description: "جرّب المحاكاة التفاعلية لقلب المفاعل النووي (U-235) وحسابات عمر النصف واضمحلال النظائر المشعة لطلاب الهندسة والعلوم بالسعودية والخليج.",
  },
  {
    route: "instructor",
    title: "المهندس محمود إسماعيل شلتوت | مدرب الكيمياء النووية",
    description: "تعرّف على خبرة المهندس محمود إسماعيل شلتوت (+12 سنة) في تدريس الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية بالسعودية والخليج.",
  },
  {
    route: "booking",
    title: "حجز جلسة خاصة في الكيمياء النووية | المهندس محمود شلتوت",
    description: "احجز جلسة فردية 1-on-1 أو استشارة أكاديمية مباشرة مع المهندس محمود إسماعيل شلتوت في الكيمياء النووية وهندسة المفاعلات والسلامة الإشعاعية.",
  },
  {
    route: "student-portal",
    title: "بوابة الطالب والدروس النووية | مركز المعرفة النووية",
    description: "تابع الدروس والمقررات والتقدم الدراسي والتمارين التفاعلية في بوابة الطالب بمركز المعرفة النووية بإشراف المهندس محمود إسماعيل شلتوت.",
    private: true,
  },
  {
    route: "admin",
    title: "لوحة تحكم الإدارة والمشرفين | مركز المعرفة النووية",
    description: "بوابة الإدارة المعتمدة للمهندس والمشرف لإدارة الحجوزات والمواعيد والدورات والتقارير الأكاديمية في مركز المعرفة النووية.",
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

const socialImage = `${siteUrl}/og-image.jpg`;

for (const page of pageData) {
  let html = rootHtml.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = updateMeta(html, "name", "description", page.description);
  html = updateMeta(html, "name", "robots", page.private ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  html = updateMeta(html, "property", "og:title", page.title);
  html = updateMeta(html, "property", "og:description", page.description);
  html = updateMeta(html, "name", "twitter:title", page.title);
  html = updateMeta(html, "name", "twitter:description", page.description);
  html = html.replace(
    /<h1[^>]*>[^<]*<\/h1>/,
    `<h1>${escapeHtml(page.title)}</h1>`,
  );

  const canonicalPath = page.route === "share" ? "/share" : `/${page.route}`;
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${page.route === "share" ? `${siteUrl}/` : canonicalUrl}" />`,
  );
  html = updateMeta(html, "property", "og:url", canonicalUrl);
  html = updateMeta(html, "property", "twitter:url", canonicalUrl);
  html = updateMeta(html, "name", "twitter:url", canonicalUrl);
  html = updateMeta(html, "property", "og:image", socialImage);
  html = updateMeta(html, "property", "og:image:secure_url", socialImage);
  html = updateMeta(html, "name", "twitter:image", socialImage);

  const routeDirectory = path.join(outputDir, page.route);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(path.join(routeDirectory, "index.html"), html);
}

const publicRoutes = ["", "courses", "simulator", "instructor", "booking"];
const urls = publicRoutes
  .map((route) => {
    const location = route ? `${siteUrl}/${route}` : `${siteUrl}/`;
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
  `Sitemap: ${siteUrl}/sitemap.xml`,
  "",
].join("\n");

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "sitemap.xml"), sitemap);
await writeFile(path.join(outputDir, "robots.txt"), robots);

let html = rootHtml;
html = html
  .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${siteUrl}/$2`)
  .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${siteUrl}/$2`);
html = updateMeta(html, "property", "og:image", socialImage);
html = updateMeta(html, "property", "og:image:secure_url", socialImage);
html = updateMeta(html, "name", "twitter:image", socialImage);
await writeFile(indexPath, html);

console.info(`Generated static route SEO HTML, sitemap.xml, and robots.txt for ${siteUrl}.`);
