import { defineConfig } from "eslint/config";

import { baseConfig } from "@mint-up/eslint-config/base";
import { reactConfig } from "@mint-up/eslint-config/react";

export default defineConfig(
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  baseConfig,
  reactConfig,
);
