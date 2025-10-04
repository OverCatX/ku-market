import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
  recommendedConfig: {},
});

export default [
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,  // ✅ ต้องเป็น object parser
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];