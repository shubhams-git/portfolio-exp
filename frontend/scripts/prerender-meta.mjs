import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const SITE = "https://portfolio-of-shubham.vercel.app";
const OG_IMAGE = `${SITE}/meta/og-default.png`;

const pages = [
  {
    route: "/projects/rizzbot",
    title: "RizzBot — Case Study | Shubham Sharma",
    description:
      "RizzBot case study: a full-stack AI chatbot built with React, Node.js, MongoDB, and OpenAI — featuring multi-turn conversations, prompt orchestration, and session persistence.",
    keywords:
      "RizzBot, React, TypeScript, Node.js, MongoDB, OpenAI API, AI chatbot, case study, Shubham Sharma",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "RizzBot",
      description:
        "A full-stack AI chatbot with multi-turn conversations, prompt orchestration, and real-time session management.",
      url: `${SITE}/projects/rizzbot`,
      author: { "@type": "Person", name: "Shubham Sharma", url: SITE },
      keywords: "React, TypeScript, Node.js, MongoDB, OpenAI API",
    },
  },
  {
    route: "/projects/weather-app",
    title: "Weather App — Case Study | Shubham Sharma",
    description:
      "Weather App case study: an interactive data visualization project built with React, FastAPI, and D3 — featuring real-time weather charts, responsive design, and performant rendering.",
    keywords:
      "Weather App, React, TypeScript, FastAPI, D3, data visualization, case study, Shubham Sharma",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "Weather App",
      description:
        "Interactive weather dashboard with real-time D3 visualizations, FastAPI backend, and responsive data-driven charts.",
      url: `${SITE}/projects/weather-app`,
      author: { "@type": "Person", name: "Shubham Sharma", url: SITE },
      keywords: "React, TypeScript, FastAPI, D3",
    },
  },
  {
    route: "/projects/ai-financial-forecasting",
    title: "AI Financial Forecasting — Case Study | Shubham Sharma",
    description:
      "AI Financial Forecasting case study: a Python ML pipeline for time-series prediction, served via Flask API, and deployed on Azure with containerized infrastructure.",
    keywords:
      "AI Financial Forecasting, Python, Flask, Azure, Pandas, machine learning, case study, Shubham Sharma",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: "AI Financial Forecasting",
      description:
        "Financial time-series prediction system with a Python ML pipeline, Flask API, and Azure cloud deployment.",
      url: `${SITE}/projects/ai-financial-forecasting`,
      author: { "@type": "Person", name: "Shubham Sharma", url: SITE },
      keywords: "Python, Flask, Azure, Pandas",
    },
  },
];

const template = readFileSync(join(DIST, "index.html"), "utf-8");

for (const page of pages) {
  const canonical = `${SITE}${page.route}`;

  let html = template;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${page.title}</title>`
  );

  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${page.description}" />`
  );

  html = html.replace(
    /<meta name="keywords" content="[^"]*" \/>/,
    `<meta name="keywords" content="${page.keywords}" />`
  );

  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonical}" />`
  );

  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${page.title}" />`
  );

  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${page.description}" />`
  );

  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonical}" />`
  );

  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${page.title}" />`
  );

  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${page.description}" />`
  );

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Work", item: `${SITE}/#work` },
      { "@type": "ListItem", position: 3, name: page.jsonLd.name, item: canonical },
    ],
  };

  const pageJsonLd = `
    <script type="application/ld+json">
    ${JSON.stringify(page.jsonLd)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(breadcrumbLd)}
    </script>`;

  html = html.replace("</head>", `${pageJsonLd}\n  </head>`);

  const dir = join(DIST, ...page.route.split("/").filter(Boolean));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf-8");

  console.log(`[prerender-meta] ${page.route} → ${dir}/index.html`);
}

console.log(`[prerender-meta] Generated ${pages.length} route-specific HTML files`);
