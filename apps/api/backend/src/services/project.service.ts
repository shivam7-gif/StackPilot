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
    react: `npm create vite@latest ${projectId} -- --template react-ts`,
    vue: `npm create vite@latest ${projectId} -- --template vue-ts`,
    svelte: `npm create vite@latest ${projectId} -- --template svelte-ts`,
    astro: `npm create astro@latest ${projectId} -- --template minimal --no-install --no-git`,
    nextjs: `npx create-next-app@latest ${projectId} --typescript --eslint --no-tailwind --src-dir --app --yes --skip-install`,
    nuxt: `npx nuxi@latest init ${projectId} --no-install`,
    angular: `npx @angular/cli@latest new ${projectId} --routing --style=scss --skip-git --skip-install`,
    express: `npx express-generator --no-view ${projectId}`,
    nestjs: `npx @nestjs/cli@latest new ${projectId} --package-manager npm --skip-git`,
    springboot: `npx spring-init ${projectId} --dependencies web,data-jpa,lombok`,
    django: `django-admin startproject ${projectId}`,
    laravel: `composer create-project laravel/laravel ${projectId}`,
  };

  return { command: commands[framework], cwd };
};
