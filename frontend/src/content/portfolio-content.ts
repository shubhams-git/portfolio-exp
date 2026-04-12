import type { PortfolioContent } from "@/types/portfolio";

const resumeHref = "/resume/Shubham_Sharma_Resume.pdf";
const introMediaUrl = "/media/intro.mp4";
const rizzbotVisualUrl = new URL("../assets/portfolio/rizzbot-matrix.svg", import.meta.url).href;
const weatherVisualUrl = new URL("../assets/portfolio/weather-grid.svg", import.meta.url).href;
const forecastingVisualUrl = new URL("../assets/portfolio/forecast-radar.svg", import.meta.url).href;

export const portfolioContent: PortfolioContent = {
  siteTitle: "The Layered Matrix",
  person: {
    firstName: "Shubham",
    lastName: "Sharma",
    role: "Full-Stack Developer",
    location: "Melbourne, VIC",
    timezone: "Australia/Sydney",
    status: "Open to new opportunities",
    availabilityNote:
      "Strongest in full-stack web development, AI/LLM integrations, and backend systems with Python and Node.js.",
    valueProposition:
      "I build full-stack applications with React, Node.js, and Python — shipping everything from AI-powered products to real-time data platforms, backed by clean architecture and cloud infrastructure.",
    introMediaUrl,
  },
  navigation: [
    { label: "Work", href: "#work" },
    { label: "Stack", href: "#stack" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  heroActions: [
    { label: "View Work", href: "#work", variant: "primary", kind: "internal" },
    {
      label: "Resume",
      href: resumeHref,
      variant: "secondary",
      kind: "download",
      downloadName: "Shubham_Sharma_Resume.pdf",
      note: "Full resume with complete experience and project details.",
    },
    { label: "Contact", href: "#contact", variant: "secondary", kind: "internal" },
  ],
  projects: [
    {
      slug: "rizzbot",
      index: "01",
      name: "RizzBot",
      category: "MERN + TS + AI",
      summary: "A full-stack AI chatbot with multi-turn conversations, prompt orchestration, and real-time session management.",
      problem:
        "Most AI demos are thin wrappers around a single API call. The goal was to build a real conversational product with context-aware responses, persistent sessions, and a polished interface.",
      role: "Full-Stack Developer",
      coreStack: ["React", "TypeScript", "Node.js", "MongoDB", "OpenAI API"],
      architectureChallenge:
        "Managing multi-turn conversation context without ballooning latency or complexity — keeping prompt windows efficient, session state predictable, and the UX responsive across long conversations.",
      impact:
        "A production-grade AI application that handles conversation context, prompt management, and real-time responses across a fully typed React + Node.js + MongoDB stack.",
      proofPoints: [
        "Multi-turn conversation engine with sliding prompt windows and persistent session history.",
        "End-to-end TypeScript across client and server — fully typed from user input to model response.",
        "Integrated UI, API, and AI layers into a cohesive product, not a disconnected demo.",
      ],
      deliverySignals: [
        { label: "Mode", value: "Full-stack AI", detail: "React UI + Node.js API + OpenAI integration" },
        { label: "Focus", value: "Conversation UX", detail: "Multi-turn context and real-time response flow" },
        { label: "Surface", value: "MERN / TS", detail: "MongoDB sessions, Express API, React interface" },
      ],
      featured: true,
      visual: {
        assetUrl: rizzbotVisualUrl,
        alt: "Dark orchestration panel showing a conversational AI interface with layered cards and metrics",
        tone: "signal",
        objectPosition: "50% 44%",
        zoom: 1.04,
      },
      preview: {
        title: "AI chatbot with multi-turn conversation management and full-stack orchestration.",
        problemScope:
          "Building an AI chatbot that goes beyond a single prompt-response loop — handling conversation history, context windowing, and session persistence while keeping responses fast and the interface fluid.",
        architecturalSolution:
          "A typed React frontend manages the conversation UI, an Express orchestration layer handles prompt construction and session state, and MongoDB persists conversation history — all connected through a typed API contract.",
        metrics: [
          { label: "Interface Mode", value: "Multi-turn AI" },
          { label: "Primary Focus", value: "Prompt orchestration + UX" },
          { label: "Stack Depth", value: "Full-stack MERN + OpenAI" },
        ],
        appliedStack: ["React", "TypeScript", "Node.js", "MongoDB", "OpenAI API"],
      },
      caseStudy: {
        headline: "An AI chatbot built as a complete product — conversation engine, session management, and polished interface.",
        seoDescription:
          "RizzBot case study: a full-stack AI chatbot built with React, Node.js, MongoDB, and OpenAI — featuring multi-turn conversations, prompt orchestration, and session persistence.",
        overview:
          "RizzBot started from a simple question: can you build an AI chatbot that actually feels like a product, not a weekend hackathon demo? The answer required careful prompt engineering, a conversation engine that tracks context across turns, and a full-stack architecture that ties the React frontend, Node.js backend, and OpenAI API into a seamless experience.",
        challenge: [
          "Most LLM projects lose depth after the first message — they don't handle follow-ups, context shifts, or long conversations gracefully.",
          "Prompt construction, context windowing, and response quality all degrade under real conversational load unless the architecture is designed for it.",
        ],
        recruiterHighlights: [
          "End-to-end AI integration — from prompt construction and context management on the backend to real-time conversation rendering on the frontend.",
          "Full-stack ownership across React UI, Express API, MongoDB persistence, and OpenAI orchestration.",
          "Production-quality code with TypeScript throughout, clean separation of concerns, and debuggable conversation flows.",
        ],
        architectureSummary:
          "The system separates concerns cleanly: React handles the conversation UI and input management, Express manages prompt construction and session orchestration, and a typed service layer wraps OpenAI interactions to keep model calls predictable and debuggable.",
        architectureLayers: [
          {
            label: "Client Surface",
            detail: "React handles the conversation thread, input management, loading states, and real-time response streaming.",
          },
          {
            label: "Orchestration Layer",
            detail: "Express API builds prompt windows from conversation history, manages session lifecycle, and shapes requests for the model.",
          },
          {
            label: "Model Integration",
            detail: "A typed OpenAI service layer executes completions, parses responses, and persists conversation turns to MongoDB.",
          },
        ],
        codeFile: "rizzbot-session-orchestrator.ts",
        codeSnippet: `export async function createReply(session: SessionState, input: string) {
  const messages = buildPromptWindow(session.history, input);
  const completion = await openAI.responses.create({
    model: "gpt-4.1-mini",
    input: messages,
  });

  return {
    reply: completion.output_text,
    nextState: persistTurn(session, input, completion.output_text),
  };
}`,
        imageCaption:
          "The architecture prioritizes conversation quality — every prompt is constructed from real session context, not templated responses.",
      },
    },
    {
      slug: "weather-app",
      index: "02",
      name: "Weather App",
      category: "React + FastAPI + D3",
      summary: "Interactive weather dashboard with real-time D3 visualizations, FastAPI backend, and responsive data-driven charts.",
      problem:
        "Weather APIs return dense, noisy data that's hard to scan. The goal was to build an interface that transforms raw measurements into clear, interactive visualizations users can actually read.",
      role: "Frontend / Data Visualization Developer",
      coreStack: ["React", "TypeScript", "FastAPI", "D3"],
      architectureChallenge:
        "Keeping D3 visualizations smooth and responsive as data updates stream in — preventing chart jank on frequent re-renders while maintaining interactivity across screen sizes.",
      impact:
        "A performant data visualization app that turns raw weather feeds into interactive, readable charts — demonstrating frontend engineering, API design, and D3 mastery in one project.",
      proofPoints: [
        "Transforms dense time-series weather data into a clear visual hierarchy with temperature curves, precipitation bars, and wind indicators.",
        "Interactive charts that stay smooth under frequent data updates — no jank, no layout shifts.",
        "FastAPI backend delivers structured, normalized data so the frontend renders instantly without client-side data wrangling.",
      ],
      deliverySignals: [
        { label: "Mode", value: "Frontend + data viz", detail: "React interface with D3 chart rendering" },
        { label: "Focus", value: "Performance + clarity", detail: "Smooth updates on dense time-series data" },
        { label: "Surface", value: "FastAPI + D3", detail: "Python API feeding interactive visualizations" },
      ],
      visual: {
        assetUrl: weatherVisualUrl,
        alt: "Weather analytics panel with chart rails and a forecast curve inside a dark dashboard layout",
        tone: "cool",
        objectPosition: "50% 42%",
        zoom: 1.08,
      },
      preview: {
        title: "Real-time weather data visualized through interactive D3 charts and a clean React interface.",
        problemScope:
          "Weather APIs dump raw numbers — temperatures, humidity, wind speed, precipitation — with no visual hierarchy. This project turns that data into interactive charts that make patterns and forecasts immediately obvious.",
        architecturalSolution:
          "React manages layout and state, FastAPI normalizes and serves weather data through clean endpoints, and D3 renders the actual charts — each layer focused on what it does best.",
        metrics: [
          { label: "Visualization", value: "D3 charts + React" },
          { label: "Data Flow", value: "FastAPI → structured JSON" },
          { label: "Performance", value: "Smooth re-renders on live data" },
        ],
        appliedStack: ["React", "TypeScript", "FastAPI", "D3"],
      },
      caseStudy: {
        headline: "Weather data transformed into interactive, real-time visualizations that are fast, readable, and beautiful.",
        seoDescription:
          "Weather App case study: an interactive data visualization project built with React, FastAPI, and D3 — featuring real-time weather charts, responsive design, and performant rendering.",
        overview:
          "This project goes beyond fetching and displaying API data. It takes raw weather measurements — temperature curves, precipitation patterns, wind data — and renders them as interactive D3 visualizations with smooth transitions, responsive layouts, and an information hierarchy that makes complex data scannable at a glance.",
        challenge: [
          "Weather dashboards tend to show everything at once — numbers everywhere, no hierarchy, no focus. The interface needed to surface what matters and let users drill into details on demand.",
          "D3 charts can become sluggish when data updates frequently or the DOM gets heavy. The rendering strategy had to stay performant without sacrificing interactivity or visual quality.",
        ],
        recruiterHighlights: [
          "Demonstrates deep frontend skills — React architecture, D3 integration, and performance optimization working together.",
          "Shows design sensibility in translating raw data into clear, scannable visual hierarchies.",
          "Full vertical integration from Python API design through to interactive chart rendering.",
        ],
        architectureSummary:
          "FastAPI serves normalized weather data through typed endpoints. React manages application state and layout. D3 takes over for chart rendering where its low-level control outperforms component-based abstractions. Each layer has clear boundaries.",
        architectureLayers: [
          {
            label: "UI Layer",
            detail: "React manages layout, data fetching, state transitions, and the overall information hierarchy.",
          },
          {
            label: "Visualization Layer",
            detail: "D3 renders temperature curves, bar charts, and interactive elements where component-level abstractions would limit control.",
          },
          {
            label: "API Layer",
            detail: "FastAPI serves normalized, structured weather data through fast endpoints optimized for frontend consumption.",
          },
        ],
        codeFile: "weather-trend-chart.tsx",
        codeSnippet: `const line = d3
  .line<WeatherPoint>()
  .x((point) => xScale(point.timestamp))
  .y((point) => yScale(point.temperature))
  .curve(d3.curveMonotoneX);

svg.append("path")
  .datum(points)
  .attr("d", line)
  .attr("stroke", "#ffffff")
  .attr("fill", "none");`,
        imageCaption:
          "Clear visual hierarchy turns dense weather data into charts that communicate at a glance.",
      },
    },
    {
      slug: "ai-financial-forecasting",
      index: "03",
      name: "AI Financial Forecasting",
      category: "Python + Flask + Azure",
      summary: "Financial time-series prediction system with a Python ML pipeline, Flask API, and Azure cloud deployment.",
      problem:
        "Financial forecasting models are often stuck in Jupyter notebooks. The goal was to build a production-ready service that runs predictions, serves results through an API, and deploys to the cloud.",
      role: "Backend / Applied AI Developer",
      coreStack: ["Python", "Flask", "Azure", "Pandas"],
      architectureChallenge:
        "Separating data preprocessing, model training, and inference into a clean pipeline that runs reliably in production — not just on a local machine with cached data.",
      impact:
        "A deployed ML service on Azure that processes financial time-series data, generates forecasts, and serves predictions through a clean Flask API.",
      proofPoints: [
        "Complete ML pipeline — data ingestion, normalization, model training, and inference — structured as a deployable service, not a notebook.",
        "Flask API wraps model predictions in structured JSON responses with clear input/output contracts.",
        "Deployed on Azure with containerized infrastructure, environment configuration, and production-grade error handling.",
      ],
      deliverySignals: [
        { label: "Mode", value: "ML backend service", detail: "Data pipeline, model inference, Flask API" },
        { label: "Focus", value: "Production deployment", detail: "From notebook to Azure-hosted service" },
        { label: "Surface", value: "Python + Azure", detail: "Pandas, Flask, containerized deployment" },
      ],
      visual: {
        assetUrl: forecastingVisualUrl,
        alt: "Forecasting surface with radial grid lines, trend indicators, and a model output panel",
        tone: "warm",
        objectPosition: "50% 46%",
        zoom: 1.03,
      },
      preview: {
        title: "Time-series forecasting powered by Python ML, served through Flask, deployed on Azure.",
        problemScope:
          "Financial forecasting models need to move beyond notebooks to be useful. This project packages the entire ML workflow — data processing, model training, inference, and API delivery — into a service that runs in the cloud.",
        architecturalSolution:
          "A Python pipeline handles data normalization and feature engineering. The trained model runs inference through a Flask API. Azure hosts the containerized service with environment-specific configuration.",
        metrics: [
          { label: "Model Type", value: "Time-series forecasting" },
          { label: "Deployment", value: "Azure (containerized)" },
          { label: "Stack", value: "Python + Flask + Pandas" },
        ],
        appliedStack: ["Python", "Flask", "Azure", "Pandas"],
      },
      caseStudy: {
        headline: "A financial forecasting model built as a production service — from data pipeline to Azure deployment.",
        seoDescription:
          "AI Financial Forecasting case study: a Python ML pipeline for time-series prediction, served via Flask API, and deployed on Azure with containerized infrastructure.",
        overview:
          "This project takes a financial forecasting model through the full production lifecycle: data ingestion and normalization with Pandas, model training and evaluation, inference through a Flask API, and cloud deployment on Azure. The focus is on building ML systems that are maintainable, testable, and deployable — not just accurate in a notebook.",
        challenge: [
          "Financial data is messy — missing values, varying formats, time zone inconsistencies. The preprocessing pipeline had to be robust enough for production, not just clean demo data.",
          "Model inference needs to be fast, reliable, and wrapped in a clear API contract so downstream consumers don't need to understand the ML internals.",
        ],
        recruiterHighlights: [
          "Full ML engineering workflow — data processing, model training, API design, and cloud deployment.",
          "Production mindset: containerized deployment, environment configuration, structured error handling, and clean API contracts.",
          "Demonstrates backend and infrastructure skills beyond frontend work — Python services, Azure deployment, and data pipeline design.",
        ],
        architectureSummary:
          "The application is structured as three distinct layers: a Pandas-based data pipeline for ingestion and normalization, a model service for training and inference, and a Flask API that serves predictions with structured responses. Each layer can be tested, debugged, and deployed independently.",
        architectureLayers: [
          {
            label: "Data Pipeline",
            detail: "Pandas handles data ingestion, missing value imputation, normalization, and feature engineering for the forecasting model.",
          },
          {
            label: "Forecast Service",
            detail: "The model service exposes a clean inference API — accepts normalized time-series input, returns structured predictions with confidence intervals.",
          },
          {
            label: "Cloud Deployment",
            detail: "Azure hosts the containerized Flask service with environment-specific configuration, health checks, and production logging.",
          },
        ],
        codeFile: "forecast_service.py",
        codeSnippet: `def generate_forecast(series: pd.Series) -> dict[str, list[float]]:
    model = load_model()
    normalized = normalize_series(series)
    prediction = model.predict(normalized.tail(32).to_numpy())

    return {
        "history": normalized.tail(32).tolist(),
        "forecast": prediction.tolist(),
    }`,
        imageCaption:
          "The value is in the engineering around the model — clean data pipelines, typed API contracts, and cloud-ready deployment.",
      },
    },
  ],
  technicalStack: [
    {
      id: "01",
      title: "Frontend",
      summary: "Building responsive, accessible interfaces with modern React patterns, TypeScript safety, and clean component architecture.",
      signal: "UI engineering / component systems",
      evidence: "Production React apps, interactive D3 visualizations, and TypeScript-first frontends across every project.",
      items: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
    {
      id: "02",
      title: "Backend",
      summary: "Designing APIs, services, and data layers with Node.js and Python — from REST endpoints to AI orchestration pipelines.",
      signal: "API design / services / data flow",
      evidence: "Express and FastAPI services powering AI chatbots, data visualizations, and financial forecasting systems.",
      items: ["Node.js", "Python", "Express", "FastAPI"],
    },
    {
      id: "03",
      title: "Cloud & Infra",
      summary: "Shipping to production with containerized deployments, cloud services, and CI/CD workflows.",
      signal: "Deployment / infrastructure / DevOps",
      evidence: "Azure-deployed ML services, AWS IoT integrations, Docker containers, and Git-driven workflows.",
      items: ["AWS", "Azure", "Docker", "Git"],
    },
    {
      id: "04",
      title: "AI & Integrations",
      summary: "Integrating LLMs into real products — prompt engineering, context management, and MCP-based tool orchestration.",
      signal: "LLM integration / MCP / prompt engineering",
      evidence: "OpenAI-powered chatbots, MCP-connected financial tools, and multi-turn conversation engines.",
      items: ["OpenAI API", "Prompt Engineering", "MCP"],
    },
    {
      id: "05",
      title: "Databases",
      summary: "Choosing the right database for each problem — document stores for flexible schemas, relational databases for structured data.",
      signal: "Data modeling / persistence / queries",
      evidence: "MongoDB for conversation sessions and user data, PostgreSQL and SQL for structured business data and analytics.",
      items: ["MongoDB", "SQL", "PostgreSQL"],
    },
  ],
  experience: [
    {
      company: "Philotimo Global",
      period: "Jun 2025 - Sep 2025",
      focus: "AI integration / backend APIs / MCP / Xero automation",
      summary:
        "Built an MCP-powered AI chatbot that connected to Xero for real-time financial queries and decision support. Designed backend APIs for AI-assisted financial workflows, shipping features end-to-end in a fast-paced startup environment.",
    },
    {
      company: "Aubot",
      period: "Feb 2024 - May 2024",
      focus: "React / TypeScript frontend engineering",
      summary:
        "Developed and shipped React components for a production robotics platform. Improved UI performance and component architecture, collaborating closely with design and backend teams to deliver polished, accessible interfaces.",
    },
    {
      company: "Inverloch Bike Hire",
      period: "Dec 2023 - Mar 2024",
      focus: "Full-stack web development",
      summary:
        "Owned the full development cycle for a booking-driven web platform — building features from database to UI. Streamlined the reservation workflow, improved the mobile experience, and shipped iterative improvements with a small, collaborative team.",
    },
    {
      company: "Manatzura",
      period: "Feb 2023 - Nov 2023",
      focus: "Flutter / IoT / AWS integration",
      summary:
        "Built Flutter dashboards for real-time IoT device monitoring, integrating AWS data streams for live sensor data visualization. Handled UAT coordination and backend integration, working across mobile, cloud, and hardware interfaces.",
    },
  ],
  contactLinks: [
    {
      label: "GitHub",
      href: "https://github.com/shubhams-git",
      kind: "external",
      target: "_blank",
      rel: "noreferrer",
      note: "GitHub profile",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/ss-shubham-sharma/",
      kind: "external",
      target: "_blank",
      rel: "noreferrer",
      note: "LinkedIn profile",
    },
  ],
};
