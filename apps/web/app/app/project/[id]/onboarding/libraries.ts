export interface LibraryItem {
  id: string;
  name: string;
  pkg: string;
  description: string;
  category:
    | "UI Components"
    | "Styling"
    | "Routing"
    | "State Management"
    | "Forms & Validation"
    | "Authentication"
    | "Database & ORM"
    | "AI & LLM"
    | "API & Networking"
    | "Testing"
    | "Dev Tooling";
  type: "prod" | "dev";
  version: string;
  frameworks: string[];
}

export const LIBRARY_CATALOG: LibraryItem[] = [
  // UI Components
  {
    id: "lucide-react",
    name: "Lucide React",
    pkg: "lucide-react",
    description: "Clean, consistent SVG icon set for modern React components",
    category: "UI Components",
    type: "prod",
    version: "^1.55.0",
    frameworks: ["react", "nextjs"],
  },
  {
    id: "radix-dialog",
    name: "Radix UI Dialog",
    pkg: "@radix-ui/react-dialog",
    description: "Unstyled, accessible modal dialog primitive for React",
    category: "UI Components",
    type: "prod",
    version: "^1.1.2",
    frameworks: ["react", "nextjs"],
  },
  {
    id: "clsx-twmerge",
    name: "Clsx & Tailwind Merge",
    pkg: "clsx tailwind-merge",
    description: "Utility for conditionally constructing className strings with Tailwind conflict resolution",
    category: "UI Components",
    type: "prod",
    version: "^2.5.0",
    frameworks: ["react", "nextjs", "vue"],
  },

  // Styling
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    pkg: "tailwindcss",
    description: "Utility-first CSS framework for rapid UI synthesis",
    category: "Styling",
    type: "dev",
    version: "^4.0.0",
    frameworks: ["react", "nextjs", "vue", "svelte"],
  },
  {
    id: "sass",
    name: "Sass (SCSS)",
    pkg: "sass",
    description: "Modern CSS preprocessor with variables, nesting, and mixins",
    category: "Styling",
    type: "dev",
    version: "^1.80.0",
    frameworks: ["react", "nextjs", "vue"],
  },

  // Routing
  {
    id: "react-router-dom",
    name: "React Router",
    pkg: "react-router-dom",
    description: "Standard declarative client-side routing library for React applications",
    category: "Routing",
    type: "prod",
    version: "^7.0.0",
    frameworks: ["react", "vite"],
  },

  // State Management
  {
    id: "zustand",
    name: "Zustand",
    pkg: "zustand",
    description: "Small, fast and scalable bearbones state-management solution using simplified flux principles",
    category: "State Management",
    type: "prod",
    version: "^5.0.0",
    frameworks: ["react", "nextjs"],
  },
  {
    id: "tanstack-query",
    name: "TanStack React Query",
    pkg: "@tanstack/react-query",
    description: "Powerful asynchronous state management, server cache, and data fetching",
    category: "State Management",
    type: "prod",
    version: "^5.60.0",
    frameworks: ["react", "nextjs", "vue"],
  },

  // Forms & Validation
  {
    id: "react-hook-form",
    name: "React Hook Form",
    pkg: "react-hook-form",
    description: "Performant, flexible form validation with easy-to-use hooks",
    category: "Forms & Validation",
    type: "prod",
    version: "^7.54.0",
    frameworks: ["react", "nextjs"],
  },
  {
    id: "zod",
    name: "Zod",
    pkg: "zod",
    description: "TypeScript-first schema declaration and static type inference validation library",
    category: "Forms & Validation",
    type: "prod",
    version: "^3.24.0",
    frameworks: ["react", "nextjs", "express", "nestjs"],
  },

  // Authentication
  {
    id: "jsonwebtoken",
    name: "JSON Web Token (JWT)",
    pkg: "jsonwebtoken",
    description: "Compact, URL-safe means of representing claims between two parties",
    category: "Authentication",
    type: "prod",
    version: "^9.0.2",
    frameworks: ["express", "nestjs"],
  },
  {
    id: "bcryptjs",
    name: "Bcrypt.js",
    pkg: "bcryptjs",
    description: "Optimized bcrypt password-hashing algorithm in pure JavaScript",
    category: "Authentication",
    type: "prod",
    version: "^2.4.3",
    frameworks: ["express", "nestjs", "nextjs"],
  },

  // Database & ORM
  {
    id: "prisma",
    name: "Prisma ORM",
    pkg: "@prisma/client prisma",
    description: "Next-generation Node.js and TypeScript ORM for PostgreSQL, MySQL, and SQLite",
    category: "Database & ORM",
    type: "prod",
    version: "^6.2.0",
    frameworks: ["express", "nestjs", "nextjs"],
  },
  {
    id: "drizzle-orm",
    name: "Drizzle ORM",
    pkg: "drizzle-orm drizzle-kit",
    description: "Lightweight, performant TypeScript ORM with zero boilerplate",
    category: "Database & ORM",
    type: "prod",
    version: "^0.38.0",
    frameworks: ["express", "nestjs", "nextjs"],
  },
  {
    id: "pg",
    name: "pg (node-postgres)",
    pkg: "pg @types/pg",
    description: "Non-blocking PostgreSQL client for Node.js",
    category: "Database & ORM",
    type: "prod",
    version: "^8.13.0",
    frameworks: ["express", "nestjs"],
  },
  {
    id: "mongoose",
    name: "Mongoose",
    pkg: "mongoose",
    description: "Elegant MongoDB object modeling for Node.js",
    category: "Database & ORM",
    type: "prod",
    version: "^8.9.0",
    frameworks: ["express", "nestjs"],
  },

  // AI & LLM
  {
    id: "openai",
    name: "OpenAI SDK",
    pkg: "openai",
    description: "Official Node.js client library for OpenAI and OpenRouter compatible APIs",
    category: "AI & LLM",
    type: "prod",
    version: "^4.77.0",
    frameworks: ["react", "nextjs", "express", "nestjs"],
  },
  {
    id: "groq-sdk",
    name: "Groq SDK",
    pkg: "groq-sdk",
    description: "Ultra-fast LPU inference client for open weights models (Llama, Gemma)",
    category: "AI & LLM",
    type: "prod",
    version: "^0.9.0",
    frameworks: ["react", "nextjs", "express", "nestjs"],
  },

  // API & Networking
  {
    id: "axios",
    name: "Axios",
    pkg: "axios",
    description: "Promise-based HTTP client for browser and Node.js with interceptors",
    category: "API & Networking",
    type: "prod",
    version: "^1.7.9",
    frameworks: ["react", "nextjs", "vue", "express", "nestjs"],
  },
  {
    id: "socket-io-client",
    name: "Socket.IO Client",
    pkg: "socket.io-client",
    description: "Real-time bidirectional event-based communication client",
    category: "API & Networking",
    type: "prod",
    version: "^4.8.1",
    frameworks: ["react", "nextjs", "vue"],
  },

  // Testing
  {
    id: "vitest",
    name: "Vitest",
    pkg: "vitest",
    description: "Next generation testing framework powered by Vite with native TypeScript support",
    category: "Testing",
    type: "dev",
    version: "^3.0.0",
    frameworks: ["react", "nextjs", "vue", "express"],
  },

  // Dev Tooling
  {
    id: "tsx",
    name: "tsx",
    pkg: "tsx",
    description: "TypeScript Execute: execute TypeScript files on the fly with Node.js",
    category: "Dev Tooling",
    type: "dev",
    version: "^4.19.0",
    frameworks: ["express", "nestjs"],
  },
  {
    id: "prettier",
    name: "Prettier",
    pkg: "prettier",
    description: "Opinionated code formatter supporting JS, TS, HTML, and CSS",
    category: "Dev Tooling",
    type: "dev",
    version: "^3.4.0",
    frameworks: ["react", "nextjs", "vue", "express", "nestjs"],
  },
];
