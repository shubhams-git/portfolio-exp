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
      "Best fit for product engineering, full-stack delivery, practical AI integrations, and backend-heavy web systems.",
    valueProposition:
      "Full-stack developer building product-focused applications across React, Node.js, Python, cloud platforms, and practical AI systems.",
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
      note: "Latest resume including Philotimo Global experience.",
    },
    { label: "Contact", href: "#contact", variant: "secondary", kind: "internal" },
  ],
  projects: [
    {
      slug: "rizzbot",
      index: "01",
      name: "RizzBot",
      category: "MERN + TS + AI",
      summary: "AI-driven conversational agent with a product-led full-stack delivery focus.",
      problem:
        "Create a recruiter-legible AI product that demonstrates applied LLM integration rather than a thin prompt wrapper.",
      role: "Full-Stack Developer",
      coreStack: ["React", "TypeScript", "Node.js", "MongoDB", "OpenAI API"],
      architectureChallenge:
        "Maintaining responsive multi-turn conversation flows while keeping server-side orchestration and state handling simple enough to ship reliably.",
      impact:
        "Delivered a credible AI product case study that proves practical full-stack integration across UI, API, and model workflows.",
      proofPoints: [
        "Multi-turn orchestration shaped as a recruiter-readable product.",
        "Typed client and backend flow instead of prompt-wrapper theatrics.",
        "Case-study framing that shows UI, API, and AI layers together.",
      ],
      deliverySignals: [
        { label: "Mode", value: "Full-stack AI", detail: "UI + orchestration + API delivery" },
        { label: "Focus", value: "Product legibility", detail: "Built to read clearly in interviews" },
        { label: "Surface", value: "MERN / TS", detail: "Interactive interface with backend control" },
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
        title: "Conversational product system with practical AI orchestration.",
        problemScope:
          "The challenge was to build an AI experience that felt like an actual product surface rather than a demo shell, while keeping interaction latency and context handling disciplined.",
        architecturalSolution:
          "The implementation combines a typed React client, an orchestration layer for prompt and session management, and a backend that keeps model interactions predictable and debuggable.",
        metrics: [
          { label: "Interface Mode", value: "Multi-turn AI" },
          { label: "Primary Focus", value: "Prompt + UX flow" },
          { label: "Delivery Shape", value: "Full-stack case study" },
        ],
        appliedStack: ["React", "TypeScript", "Node.js", "MongoDB", "OpenAI API"],
      },
      caseStudy: {
        headline: "A conversational AI product framed as a usable full-stack system, not a novelty demo.",
        seoDescription:
          "RizzBot case study: a recruiter-readable full-stack AI product focused on prompt orchestration, session handling, and practical delivery.",
        overview:
          "RizzBot was positioned as proof that applied AI work can still be product-focused. The goal was to present a clear frontend experience, a manageable backend integration path, and prompt orchestration that felt intentional rather than improvised.",
        challenge: [
          "LLM projects often collapse into shallow demos with weak user flows.",
          "Prompt handling, message context, and response clarity all need to remain understandable from both product and engineering perspectives.",
        ],
        recruiterHighlights: [
          "Demonstrates applied AI integration instead of template-level prompt wrapping.",
          "Shows full-stack thinking across interface design, backend orchestration, and system clarity.",
          "Balances engineering ambition with a delivery shape that remains explainable in interviews.",
        ],
        architectureSummary:
          "The system is structured around a typed client, a thin orchestration API layer, and a controllable model interaction path so prompts, state transitions, and fallbacks remain inspectable.",
        architectureLayers: [
          {
            label: "Client Surface",
            detail: "React UI manages user input, conversational rendering, and explicit interaction states.",
          },
          {
            label: "Application Logic",
            detail: "Typed request flow normalizes prompts, session data, and frontend expectations before model execution.",
          },
          {
            label: "Model Integration",
            detail: "Backend orchestration keeps prompt structure and output handling stable enough to support iteration.",
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
          "The implementation focus is orchestration discipline: keep the AI surface useful, typed, and product-readable.",
      },
    },
    {
      slug: "weather-app",
      index: "02",
      name: "Weather App",
      category: "React + FastAPI + D3",
      summary: "Weather visualization interface focused on performant data rendering and clarity.",
      problem:
        "Turn noisy weather data into a lightweight, understandable interface without overwhelming the user.",
      role: "Frontend / Data Visualization Developer",
      coreStack: ["React", "TypeScript", "FastAPI", "D3"],
      architectureChallenge:
        "Balancing interactive visualization with a rendering strategy that stays performant across common devices and screen sizes.",
      impact:
        "Produced a technical showcase that combines interface craft, API integration, and data presentation in one product narrative.",
      proofPoints: [
        "Turned dense weather feeds into a calmer visual hierarchy.",
        "Kept charting interactive without tipping into dashboard clutter.",
        "Made API-driven rendering feel responsive and lightweight.",
      ],
      deliverySignals: [
        { label: "Mode", value: "Frontend + data viz", detail: "React surface with D3 rendering" },
        { label: "Focus", value: "Clarity under density", detail: "Readable chart behavior" },
        { label: "Surface", value: "FastAPI / D3", detail: "API-fed visual system" },
      ],
      visual: {
        assetUrl: weatherVisualUrl,
        alt: "Weather analytics panel with chart rails and a forecast curve inside a dark dashboard layout",
        tone: "cool",
        objectPosition: "50% 42%",
        zoom: 1.08,
      },
      preview: {
        title: "Weather data translated into a readable visual system.",
        problemScope:
          "Raw weather feeds tend to be dense, repetitive, and unfriendly to scan. The project goal was to convert those signals into a cleaner technical product experience.",
        architecturalSolution:
          "A React interface works with a lightweight backend and D3 rendering layer so visual depth does not collapse under frequent state changes or dense chart content.",
        metrics: [
          { label: "Visualization Layer", value: "D3" },
          { label: "Data Path", value: "API-driven" },
          { label: "Primary Goal", value: "Readability + speed" },
        ],
        appliedStack: ["React", "TypeScript", "FastAPI", "D3"],
      },
      caseStudy: {
        headline: "A weather interface designed to make messy time-series data feel legible and responsive.",
        seoDescription:
          "Weather App case study: a React, FastAPI, and D3 project focused on data visualization clarity, performance, and readable UI structure.",
        overview:
          "The Weather App pushes beyond simple API consumption. It focuses on transforming a stream of measurements into a cleaner, more useful visual system that balances density with readability.",
        challenge: [
          "Weather products can overload the user with metrics without establishing hierarchy.",
          "Data visualizations often become slow or visually noisy when interactions and updates stack up.",
        ],
        recruiterHighlights: [
          "Connects frontend engineering with data visualization rather than separating them into silos.",
          "Shows judgment in balancing interface clarity against information density.",
          "Reflects practical API-driven product thinking instead of isolated chart experimentation.",
        ],
        architectureSummary:
          "The project splits fetching, state handling, and chart rendering responsibilities so the UI remains responsive while D3 handles the denser visualization logic.",
        architectureLayers: [
          {
            label: "UI Layer",
            detail: "React coordinates layout, state transitions, and recruiter-readable content framing.",
          },
          {
            label: "Visualization Layer",
            detail: "D3 handles the chart primitives where custom rendering is more effective than generic component abstractions.",
          },
          {
            label: "API Layer",
            detail: "FastAPI exposes structured weather data that stays predictable for the frontend render pipeline.",
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
          "The product value comes from information hierarchy as much as the charting implementation itself.",
      },
    },
    {
      slug: "ai-financial-forecasting",
      index: "03",
      name: "AI Financial Forecasting",
      category: "Python + Flask + Azure",
      summary: "Predictive modeling project that packages ML experimentation into an accessible application layer.",
      problem:
        "Bridge the gap between experimental forecasting models and a deployable interface that communicates outputs clearly.",
      role: "Backend / Applied AI Developer",
      coreStack: ["Python", "Flask", "Azure", "Pandas"],
      architectureChallenge:
        "Structuring the application so data processing, model inference, and API delivery stay understandable and deployable.",
      impact:
        "Extends the portfolio beyond CRUD and frontend polish into model-backed systems and cloud-hosted delivery.",
      proofPoints: [
        "Moved forecasting logic out of notebook territory into a deployable service.",
        "Wrapped model output in an application layer that people can inspect.",
        "Showed backend and cloud delivery discipline beyond frontend polish.",
      ],
      deliverySignals: [
        { label: "Mode", value: "Applied AI backend", detail: "Service, inference, and delivery" },
        { label: "Focus", value: "Deployment readiness", detail: "Clear API boundary around ML output" },
        { label: "Surface", value: "Python / Azure", detail: "Model-backed application layer" },
      ],
      visual: {
        assetUrl: forecastingVisualUrl,
        alt: "Forecasting surface with radial grid lines, trend indicators, and a model output panel",
        tone: "warm",
        objectPosition: "50% 46%",
        zoom: 1.03,
      },
      preview: {
        title: "Model-backed forecasting exposed through a usable application layer.",
        problemScope:
          "Forecasting work often stays trapped in notebooks. This project focuses on making model output deployable, inspectable, and understandable from a product perspective.",
        architecturalSolution:
          "A Python service layer packages the processing and inference path, while cloud deployment and API delivery keep the system usable beyond local experimentation.",
        metrics: [
          { label: "Model Context", value: "Forecasting" },
          { label: "Deployment Target", value: "Azure" },
          { label: "Primary Value", value: "Applied AI delivery" },
        ],
        appliedStack: ["Python", "Flask", "Azure", "Pandas"],
      },
      caseStudy: {
        headline: "Forecasting logic moved from isolated experimentation into a deliverable, inspectable application surface.",
        seoDescription:
          "AI Financial Forecasting case study: a model-backed system showing Python service design, API delivery, and cloud deployment thinking.",
        overview:
          "The project is designed to show that model-backed systems still need product structure. It packages data handling, inference, and deployment into a form that can be reviewed like software rather than a research artifact.",
        challenge: [
          "Model experiments are easy to start but hard to communicate as actual products.",
          "Inference outputs need enough surrounding structure to be deployable and understandable.",
        ],
        recruiterHighlights: [
          "Extends the portfolio beyond UI work into service and model-backed system design.",
          "Shows an applied-AI delivery mindset rather than notebook-only experimentation.",
          "Demonstrates cloud-hosted API thinking with a clearer product boundary around ML output.",
        ],
        architectureSummary:
          "The application separates data preparation, forecasting execution, and API exposure so the resulting system can be deployed and reasoned about in layers.",
        architectureLayers: [
          {
            label: "Data Pipeline",
            detail: "Input datasets are normalized and shaped before they ever reach the model boundary.",
          },
          {
            label: "Forecast Service",
            detail: "The application layer exposes a predictable inference contract instead of notebook-only logic.",
          },
          {
            label: "Cloud Delivery",
            detail: "Azure deployment keeps the model-backed service accessible as a usable system rather than a local experiment.",
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
          "The backend value is not just running a model, but exposing it through a system that others can inspect and use.",
      },
    },
  ],
  technicalStack: [
    {
      id: "01",
      title: "Frontend",
      summary: "Interfaces that read clearly, move with restraint, and stay maintainable under pressure.",
      signal: "UI systems / interaction craft",
      evidence: "Portfolio surfaces, React interfaces, and recruiter-readable product framing.",
      items: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    },
    {
      id: "02",
      title: "Backend",
      summary: "Typed service layers and API boundaries that keep product logic explicit.",
      signal: "Services / contracts / orchestration",
      evidence: "Express, FastAPI, and Python-backed delivery across product-facing systems.",
      items: ["Node.js", "Python", "Express", "FastAPI"],
    },
    {
      id: "03",
      title: "Cloud & Infra",
      summary: "Deployment thinking that keeps systems practical instead of purely conceptual.",
      signal: "Delivery / portability / tooling",
      evidence: "AWS, Azure, Docker, and Git integrated into day-to-day product work.",
      items: ["AWS", "Azure", "Docker", "Git"],
    },
    {
      id: "04",
      title: "AI & Integrations",
      summary: "Applied AI work anchored in workflow design, not novelty demos.",
      signal: "LLM integration / MCP / prompts",
      evidence: "OpenAI-backed projects, orchestration patterns, and MCP-connected systems.",
      items: ["OpenAI API", "Prompt Engineering", "MCP"],
    },
    {
      id: "05",
      title: "Databases",
      summary: "Persistence layers chosen for product fit, not checkbox breadth.",
      signal: "Data shape / storage choices",
      evidence: "MongoDB, SQL, and PostgreSQL used where system boundaries demanded them.",
      items: ["MongoDB", "SQL", "PostgreSQL"],
    },
  ],
  experience: [
    {
      company: "Philotimo Global",
      period: "Jun 2025 - Sep 2025",
      focus: "AI / backend APIs / MCP / Xero integration",
      summary:
        "Built backend services and AI-assisted financial workflows in a startup environment, including an MCP-powered chatbot connected to Xero for contextual finance queries and product-facing decision support.",
    },
    {
      company: "Aubot",
      period: "Feb 2024 - May 2024",
      focus: "React / TypeScript frontend development",
      summary:
        "Built responsive React interfaces, collaborated with design and backend teams, and improved component quality and UI performance in a production product environment.",
    },
    {
      company: "Inverloch Bike Hire",
      period: "Dec 2023 - Mar 2024",
      focus: "Full-stack product development",
      summary:
        "Delivered iterative web improvements that strengthened booking workflows and user experience while working closely with a small product team.",
    },
    {
      company: "Manatzura",
      period: "Feb 2023 - Nov 2023",
      focus: "Flutter / IoT app development",
      summary:
        "Developed Flutter dashboards for IoT use cases, integrated AWS-backed data flows, and supported UAT and backend coordination for real-time device data.",
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
