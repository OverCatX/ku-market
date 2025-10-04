import { FlatCompat } from "@eslint/eslintrc";

// ต้องใส่ recommendedConfig เป็น object
const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
  recommendedConfig: {
    extends: ["eslint:recommended"],
  },
});

export default [
  ...compat.extends("eslint:recommended"),
  ...compat.extends("plugin:@typescript-eslint/recommended"),

  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
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