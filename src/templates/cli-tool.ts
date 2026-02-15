import type { GtmTemplate } from "./index.js";

export const cliToolTemplate: GtmTemplate = {
  category: "cli-tool",
  description: "GTM template for CLI tools — command-line utilities, terminal apps, and shell tools",
  positioning: {
    category: "CLI Tool",
    for: "Power users, DevOps engineers, and developers who live in the terminal",
    who_need: "A fast, reliable command-line tool for [task]",
    this_product: "[Product] is a CLI tool that [core value proposition]",
    that_provides: "Streamlined terminal workflows with scriptable automation",
    unlike: "GUI-based alternatives that are slow and hard to automate",
    our_product: "Fast, composable, and works seamlessly in existing shell workflows",
  },
  messaging: {
    tagline: "Power at your fingertips",
    elevator_pitch: "A fast CLI tool that [key benefit]. Installs in one command, runs everywhere, and plays nice with your existing scripts and pipelines.",
    value_props: [
      "Blazing fast — designed for terminal-native speed",
      "Scriptable and composable with pipes and shell tools",
      "Cross-platform with zero configuration",
    ],
    proof_points: [
      "X installs via brew/npm/cargo",
      "Y% faster than [alternative]",
      "Used in CI pipelines at [companies]",
    ],
    objection_handling: {
      "Why not just use a shell script?": "You could, but this handles edge cases, cross-platform support, and error handling that would take hundreds of lines of bash.",
      "Does it work on my OS?": "Cross-platform: macOS, Linux, and Windows. Available via homebrew, npm, apt, and direct binary download.",
      "Will it break my existing scripts?": "Follows Unix conventions — stdin/stdout/stderr, exit codes, and quiet/verbose modes. Drop-in compatible.",
    },
  },
  icp: {
    title: "DevOps engineers, backend developers, system administrators",
    company_size: "Individual power users to platform teams",
    industry: "Software development, infrastructure, DevOps",
    pain_points: [
      "Current tools are slow or have poor CLI interfaces",
      "Need to automate repetitive terminal tasks",
      "GUI tools don't integrate with CI/CD pipelines",
    ],
    buying_triggers: [
      "Setting up new CI/CD pipelines",
      "Migrating to new infrastructure",
      "Team standardizing on shared tooling",
    ],
    evaluation_criteria: [
      "Installation simplicity (one command)",
      "Speed and performance",
      "Unix philosophy compatibility",
      "Cross-platform support",
    ],
  },
  channels: ["GitHub", "HackerNews", "Reddit", "Terminal-focused communities", "Homebrew", "Twitter/X"],
  pricing: {
    model: "free / open-source",
    tiers: [
      { name: "Free", price: "Free", features: ["Full CLI functionality", "All platforms", "MIT license", "Community support"] },
    ],
    rationale: "CLI tools thrive on adoption. Free and open-source maximizes distribution. Revenue can come from enterprise support, SaaS companion products, or sponsorships.",
  },
  timeline: [
    {
      phase: "Pre-launch",
      duration: "2 weeks",
      activities: [
        "Write README with install instructions for all platforms",
        "Create man page or --help documentation",
        "Record terminal demo with asciinema or GIF",
        "Package for homebrew, npm, or cargo",
        "Set up CI for cross-platform builds and releases",
        "Write comparison benchmarks vs alternatives",
      ],
    },
    {
      phase: "Launch",
      duration: "1 week",
      activities: [
        "Post Show HN with terminal demo",
        "Share on r/commandline, r/programming, r/devops",
        "Tweet demo with asciinema recording",
        "Submit homebrew formula or package",
        "Post in DevOps Slack/Discord communities",
      ],
    },
    {
      phase: "Post-launch",
      duration: "4 weeks",
      activities: [
        "Respond to issues and feature requests",
        "Add shell completions (bash, zsh, fish)",
        "Write integration guides for CI/CD platforms",
        "Publish performance benchmarks blog post",
        "Add to awesome-cli-apps and similar lists",
      ],
    },
  ],
  contentHints: {
    landing_page: "Show a terminal recording as the hero. Emphasize speed with benchmarks. Installation should be one command, front and center.",
    readme: "Lead with install + first usage. Show the --help output. Include an asciinema or GIF demo. Benchmark table if applicable.",
    blog_post: "Technical deep-dive on implementation. Show benchmarks and comparisons. Explain design decisions for performance.",
    social_post: "Terminal GIF or asciinema recording is a must. Show a real-world use case. Keep it concise and technical.",
    email: "One-line install command at the top. Show a real usage example. Link to the repo.",
  },
  launchChecklist: [
    { category: "pre-launch", title: "Write README with multi-platform install guide", priority: "critical" },
    { category: "pre-launch", title: "Record terminal demo (asciinema/GIF)", priority: "critical" },
    { category: "pre-launch", title: "Package for distribution (brew/npm/cargo/apt)", priority: "critical" },
    { category: "pre-launch", title: "Set up CI for cross-platform builds", priority: "high" },
    { category: "pre-launch", title: "Write benchmark comparisons", priority: "high" },
    { category: "pre-launch", title: "Create man page or comprehensive --help", priority: "medium" },
    { category: "launch", title: "Post Show HN with terminal demo", priority: "critical" },
    { category: "launch", title: "Share on r/commandline and r/programming", priority: "high" },
    { category: "launch", title: "Submit package to homebrew/npm", priority: "high" },
    { category: "launch", title: "Tweet with terminal recording", priority: "medium" },
    { category: "post-launch", title: "Add shell completions (bash, zsh, fish)", priority: "high" },
    { category: "post-launch", title: "Write CI/CD integration guides", priority: "medium" },
    { category: "post-launch", title: "Submit to awesome-cli-apps lists", priority: "low" },
  ],
};
