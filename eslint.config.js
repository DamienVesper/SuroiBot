// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    stylistic.configs.customize({
        indent: 4,
        semi: true,
        commaDangle: "never"
    }),
    {
        languageOptions: {
            parserOptions: {
                project: "tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
                warnOnUnsupportedTypeScriptVersion: false
            }
        },
        plugins: {
            ["@stylistic"]: stylistic
        },
        rules: {
            // ESLint
            curly: ["warn", "multi-or-nest"],
            ["prefer-arrow-callback"]: "warn",
            ["prefer-template"]: "warn",
            yoda: ["error", "never", { onlyEquality: true }],

            // Stylistic
            ["@stylistic/arrow-parens"]: ["warn", "as-needed"],
            ["@stylistic/brace-style"]: ["warn", "1tbs", { allowSingleLine: true }],
            ["@stylistic/indent"]: ["warn", 4, { SwitchCase: 1 }],
            ["@stylistic/linebreak-style"]: ["warn", "unix"],
            ["@stylistic/max-statements-per-line"]: "off",
            ["@stylistic/member-delimiter-style"]: ["warn", { singleline: { delimiter: "comma" }, multiline: { delimiter: "none" } }],
            ["@stylistic/quotes"]: ["warn", "double", { avoidEscape: true }],
            ["@stylistic/space-before-function-paren"]: ["warn", "always"],

            // @typescript-eslint
            ["@typescript-eslint/array-type"]: ["warn", { default: "array-simple" }],
            ["@typescript-eslint/consistent-type-definitions"]: "off",
            ["@typescript-eslint/explicit-function-return-type"]: ["warn", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
                allowDirectConstAssertionInArrowFunctions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: false,
                allowFunctionsWithoutTypeParameters: false,
                allowedNames: [],
                allowIIFEs: false
            }],
            ["@typescript-eslint/no-confusing-void-expression"]: "off",
            ["@typescript-eslint/no-this-alias"]: "off",
            ["@typescript-eslint/no-unused-vars"]: ["error", {
                vars: "all",
                args: "none"
            }],
            ["@typescript-eslint/restrict-template-expressions"]: ["error", {
                allowAny: true,
                allowBoolean: true,
                allowNullish: true,
                allowNumber: true,
                allowRegExp: true
            }],
            ["@typescript-eslint/use-unknown-in-catch-callback-variable"]: "off",

            ["no-cond-assign"]: "off",
            ["no-return-assign"]: "off",
            ["@typescript-eslint/prefer-nullish-coalescing"]: "off",
            ["@typescript-eslint/require-await"]: "off",
            ["@typescript-eslint/prefer-reduce-type-parameter"]: "off",
            ["@typescript-eslint/no-unnecessary-condition"]: "off",
            ["@typescript-eslint/no-explicit-any"]: "off",
            ["@typescript-eslint/no-non-null-assertion"]: "off",
            ["@typescript-eslint/no-unsafe-argument"]: "off",
            ["@typescript-eslint/no-unsafe-member-access"]: "off",
            ["@typescript-eslint/no-unnecessary-type-parameters"]: "off"
        }
    },
    {
        ignores: [
            "dist/**",
            "drizzle/**"
        ]
    }
);
