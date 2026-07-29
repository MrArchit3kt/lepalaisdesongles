import {
  defineConfig,
  globalIgnores,
} from "eslint/config";

import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig =
  defineConfig([
    ...nextVitals,
    ...nextTypeScript,

    globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "next-env.d.ts",
      "src/generated/**",
      "**/*.before-*",
      "**/*.bak",
      ".block-*-backup-*/**",
    ]),
  ]);

export default eslintConfig;
