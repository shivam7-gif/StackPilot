import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Framework =
  | "react"
  | "nextjs"
  | "vue"
  | "nuxt"
  | "angular"
  | "svelte"
  | "astro"
  | "springboot"
  | "express"
  | "nestjs"
  | "django"
  | "laravel";

export const PROJECTS_DIR = path.join(__dirname, "../../projects");

export const getScaffoldCommand = (
  framework: Framework,
  projectId: string
): { command: string; cwd: string } => {
  const cwd = PROJECTS_DIR;
  const commands: Record<Framework, string> = {
    // Named scaffold (CLI creates the folder)
    react: `npm create vite@latest ${projectId} -- --template react-ts`,
    vue: `npm create vite@latest ${projectId} -- --template vue-ts`,
    svelte: `npm create vite@latest ${projectId} -- --template svelte-ts`,
    nextjs: `npx create-next-app@latest ${projectId} --typescript --eslint --no-tailwind --src-dir --app --yes --skip-install`,
    angular: `npx @angular/cli@latest new ${projectId} --routing --style=scss --skip-git --skip-install`,
    nestjs: `npx @nestjs/cli@latest new ${projectId} --package-manager npm --skip-git --skip-install`,
    nuxt: `npx nuxi@latest init ${projectId} --no-install --force`,
    laravel: `composer create-project laravel/laravel ${projectId}`,
    springboot: `npx spring-init ${projectId} --dependencies web,data-jpa,lombok`,

    // Dot scaffold (scaffold INTO current dir)
    astro: `npx create-astro@latest . --template minimal --no-install --no-git --yes`,
    express: `npx express-generator --no-view --force ${projectId}`,
    django: `django-admin startproject app .`,
  };

  return { command: commands[framework], cwd };
};
