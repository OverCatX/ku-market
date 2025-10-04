import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
});

export default [

  ...compat.extends("eslint:recommended"),


  ...compat.extends("plugin:@typescript-eslint/recommended"),

  {
    files: ["**/*.ts"], // apply กับไฟล์ ts ทั้งหมด
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