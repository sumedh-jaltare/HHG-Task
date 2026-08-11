export const BUILDER_TITLES = [
  "Coastal Code Wizard",
  "Beachside Ship Captain",
  "Sunset Deploy Master",
  "Palm Tree Full-Stacker",
  "Late Night Merge Surfer",
  "Goa Growth Hacker",
  "Tide & Terminal",
  "Founder of Chaos, CEO of Vibes",
  "Monsoon Protocol Priest",
  "Feni-Fueled Founder",
  "Sandbox Sovereign",
  "Anjuna API Alchemist",
  "Vagator Velocity",
  "Chapora Chain Wizard",
  "Mandrem Merge Mage",
  "Palolem Pixel Pirate",
  "Calangute Commit King",
  "Candolim Cache Queen",
  "Morjim Mainnet Surfer",
  "Arambol Async Artist",
  "Susegad Systems Lead",
  "Coconut Kernel Hacker",
  "Cashew Cluster Admin",
  "High Tide Hotfix",
  "Low Tide Low-Latency",
  "Night Market Noderunner",
  "Shack Stack Architect",
  "Scooter-Side Shipper",
  "Rain Dance Release",
  "Spice Route Scripter",
  "Fort Aguada Fork",
  "Mandovi Miner",
  "Lighthouse Log Lord",
  "Beach Breakpoint",
  "Old Goa Onchain",
  "Panjim Prompt Pilot",
  "Salcete Solidity Sage",
  "Bardez Bounty Hunter",
  "Divar Deploy DJ",
  "Baga Bug Squasher",
  "Colva Compiler",
  "Dona Paula Debugger",
] as const;

export function pickRandomTitle(exclude?: string): string {
  const pool = exclude
    ? BUILDER_TITLES.filter((title) => title !== exclude)
    : BUILDER_TITLES;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? BUILDER_TITLES[0];
}
