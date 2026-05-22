const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const nextPlugin = require("eslint-config-next");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextPlugin,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
