import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals", 
    "next/typescript",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "jest.config.js",
      "*.config.js",
      "coverage/**",
    ],
  },
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      
      // React specific rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // Using TypeScript
      "react/display-name": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General code quality
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      
      // Code style
      "indent": ["error", 2, { "SwitchCase": 1 }],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "never"],
      "comma-dangle": ["error", "always-multiline"],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
    },
  },
];

export default eslintConfig;
