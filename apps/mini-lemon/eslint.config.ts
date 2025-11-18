import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@mint-up/eslint-config/base";
import { nextjsConfig } from "@mint-up/eslint-config/nextjs";
import { reactConfig } from "@mint-up/eslint-config/react";

export default defineConfig(
  {
    ignores: [".next/**"],
  },
  baseConfig,
  reactConfig,
  nextjsConfig,
  restrictEnvAccess,
);
