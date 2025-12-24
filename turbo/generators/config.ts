import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // ============================================
  // Package Generator (existing)
  // ============================================
  plop.setGenerator("init", {
    description: "Generate a new package for the myapp Monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the package? (You can skip the `@myapp/` prefix)",
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
    ],
    actions: [
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          if (answers.name.startsWith("@myapp/")) {
            answers.name = answers.name.replace("@myapp/", "");
          }
        }
        return "Config sanitized";
      },
      {
        type: "add",
        path: "packages/{{ name }}/eslint.config.ts",
        templateFile: "templates/eslint.config.ts.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
      },
      {
        type: "modify",
        path: "packages/{{ name }}/package.json",
        async transform(content, answers) {
          if ("deps" in answers && typeof answers.deps === "string") {
            const pkg = JSON.parse(content) as PackageJson;
            for (const dep of answers.deps.split(" ").filter(Boolean)) {
              const version = await fetch(
                `https://registry.npmjs.org/-/package/${dep}/dist-tags`,
              )
                .then((res) => res.json())
                .then((json) => json.latest);
              if (!pkg.dependencies) pkg.dependencies = {};
              pkg.dependencies[dep] = `^${version}`;
            }
            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          // execSync("pnpm dlx sherif@latest --fix", {
          //   stdio: "inherit",
          // });
          execSync("pnpm i", { stdio: "inherit" });
          execSync(
            `pnpm prettier --write packages/${answers.name}/** --list-different`,
          );
          return "Package scaffolded";
        }
        return "Package not scaffolded";
      },
    ],
  });

  // ============================================
  // Feature Generator (FSD)
  // ============================================
  plop.setGenerator("feature", {
    description: "Generate a new feature slice in @myapp/features",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name (kebab-case, e.g. 'payment-flow'):",
        validate: (input: string) =>
          /^[a-z][a-z0-9-]*$/.test(input) ||
          "Use kebab-case (e.g. payment-flow)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/features/src/features/{{ name }}/index.ts",
        templateFile: "templates/feature/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/features/{{ name }}/ui/index.ts",
        templateFile: "templates/feature/ui/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/features/{{ name }}/model/index.ts",
        templateFile: "templates/feature/model/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/features/{{ name }}/lib/index.ts",
        templateFile: "templates/feature/lib/index.ts.hbs",
      },
      () => {
        console.log("\n✅ Feature created!");
        console.log("   Add export to packages/features/src/features/index.ts");
        console.log('   Add to package.json exports: "./features/{{ name }}"');
        return "Feature scaffolded";
      },
    ],
  });

  // ============================================
  // Entity Generator (FSD)
  // ============================================
  plop.setGenerator("entity", {
    description: "Generate a new entity slice in @myapp/features",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Entity name (kebab-case, e.g. 'wallet'):",
        validate: (input: string) =>
          /^[a-z][a-z0-9-]*$/.test(input) || "Use kebab-case (e.g. wallet)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/features/src/entities/{{ name }}/index.ts",
        templateFile: "templates/entity/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/entities/{{ name }}/ui/index.ts",
        templateFile: "templates/entity/ui/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/entities/{{ name }}/model/index.ts",
        templateFile: "templates/entity/model/index.ts.hbs",
      },
      () => {
        console.log("\n✅ Entity created!");
        console.log("   Add export to packages/features/src/entities/index.ts");
        console.log('   Add to package.json exports: "./entities/{{ name }}"');
        return "Entity scaffolded";
      },
    ],
  });

  // ============================================
  // Widget Generator (FSD)
  // ============================================
  plop.setGenerator("widget", {
    description: "Generate a new widget slice in @myapp/features",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Widget name (kebab-case, e.g. 'user-profile'):",
        validate: (input: string) =>
          /^[a-z][a-z0-9-]*$/.test(input) ||
          "Use kebab-case (e.g. user-profile)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/features/src/widgets/{{ name }}/index.ts",
        templateFile: "templates/widget/index.ts.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/widgets/{{ name }}/ui/index.ts",
        templateFile: "templates/widget/ui/index.ts.hbs",
      },
      () => {
        console.log("\n✅ Widget created!");
        console.log("   Add export to packages/features/src/widgets/index.ts");
        console.log('   Add to package.json exports: "./widgets/{{ name }}"');
        return "Widget scaffolded";
      },
    ],
  });

  // ============================================
  // Page Generator (FSD - Shared)
  // ============================================
  plop.setGenerator("page", {
    description: "Generate a new shared page in @myapp/features",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Page name (kebab-case, e.g. 'dashboard'):",
        validate: (input: string) =>
          /^[a-z][a-z0-9-]*$/.test(input) || "Use kebab-case (e.g. dashboard)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/features/src/pages/{{ name }}/index.tsx",
        templateFile: "templates/page/index.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/pages/{{ name }}/{{ name }}-page.tsx",
        templateFile: "templates/page/page.tsx.hbs",
      },
      {
        type: "add",
        path: "packages/features/src/pages/{{ name }}/ui/index.ts",
        templateFile: "templates/page/ui/index.ts.hbs",
      },
      () => {
        console.log("\n✅ Page created!");
        console.log("   Add export to packages/features/src/pages/index.ts");
        console.log('   Add to package.json exports: "./pages/{{ name }}"');
        return "Page scaffolded";
      },
    ],
  });
}
