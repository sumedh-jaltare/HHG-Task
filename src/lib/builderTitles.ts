export type TitleCategory =
  | "frontend"
  | "backend"
  | "ai"
  | "design"
  | "fullstack"
  | "devops"
  | "product"
  | "creative"
  | "general";

const TITLES: Record<TitleCategory, readonly string[]> = {
  frontend: [
    "Frontend Wave Maker",
    "UI Coast Builder",
    "Interface Maker",
    "Client Tide Hacker",
  ],
  backend: [
    "Backend Builder",
    "Server Coast Maker",
    "API Tide Shipper",
    "Systems Beach Hacker",
  ],
  ai: [
    "AI Beach Hacker",
    "Model Coast Maker",
    "Neural Tide Builder",
    "AI Sandbox Shipper",
  ],
  design: [
    "Interface Maker",
    "Visual Wave Builder",
    "Design Coast Hacker",
    "Frame Craft Maker",
  ],
  fullstack: [
    "Full-Stack Shipper",
    "End-to-End Builder",
    "Stack Wave Maker",
    "Full-Stack Coast Hacker",
  ],
  devops: [
    "Cloud Deployer",
    "Infra Tide Shipper",
    "Platform Coast Maker",
    "Ops Beach Builder",
  ],
  product: [
    "Product Shipmate",
    "Product Coast Maker",
    "Roadmap Tide Builder",
    "Product Wave Shipper",
  ],
  creative: [
    "Creative Code Maker",
    "Creative Coast Hacker",
    "Playful Tide Builder",
    "Creative Frame Maker",
  ],
  general: [
    "Beach Builder",
    "Coast Maker",
    "Tide Shipper",
    "Sandbox Builder",
    "Palm Hacker",
    "Night Shipper",
    "Frame Maker",
    "Susegad Builder",
  ],
};

function hashSeed(text: string) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function classifyRole(role: string): TitleCategory {
  const r = role.trim().toLowerCase();
  if (!r) return "general";

  if (
    /front|react|next|vue|svelte|css|ui eng|web client|typescript ui/.test(r)
  ) {
    return "frontend";
  }
  if (/back|server|node|api|django|rails|spring|golang|rust|java/.test(r)) {
    return "backend";
  }
  if (/\bai\b|ml|machine|llm|model|data sci|deep learn/.test(r)) {
    return "ai";
  }
  if (/design|ux|ui\/ux|figma|visual|brand|product design/.test(r)) {
    return "design";
  }
  if (/full.?stack|fullstack|end.to.end/.test(r)) {
    return "fullstack";
  }
  if (/devops|sre|cloud|infra|platform|k8s|kubernetes|aws|azure|gcp/.test(r)) {
    return "devops";
  }
  if (/product|pm\b|growth|founder/.test(r)) {
    return "product";
  }
  if (/creative|artist|maker|technolog|interactive|gen art/.test(r)) {
    return "creative";
  }
  if (/solidity|web3|chain|crypto|smart contract/.test(r)) {
    return "backend";
  }
  return "general";
}

export function suggestBuilderTitle(options: {
  name?: string;
  role?: string;
  exclude?: string;
}): string {
  const name = options.name?.trim() ?? "";
  const role = options.role?.trim() ?? "";
  const category = classifyRole(role);
  const pool = [...TITLES[category]];
  const filtered = options.exclude
    ? pool.filter((title) => title !== options.exclude)
    : pool;
  const choices = filtered.length > 0 ? filtered : pool;
  const seed = hashSeed(`${name}|${role}|${category}`);
  const jitter = Math.floor(Math.random() * choices.length);
  const index = (seed + jitter) % choices.length;
  return choices[index] ?? TITLES.general[0];
}

/** @deprecated Prefer suggestBuilderTitle — kept for any leftover callers. */
export function pickRandomTitle(exclude?: string): string {
  return suggestBuilderTitle({ exclude });
}
