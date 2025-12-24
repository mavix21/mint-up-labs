import { defineConfig } from "eslint/config";

import { baseConfig } from "@mint-up/eslint-config/base";

export default defineConfig(
  {
    ignores: ["artifacts/**", "cache/**"],
  },
  baseConfig,
  {
    files: ["test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
);
