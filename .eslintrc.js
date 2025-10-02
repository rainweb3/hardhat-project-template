// .eslintrc.js
module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest", // ✅ 支持最新语法
        // sourceType: "module", // ❌ 建议移除，除非你使用 "type": "module"
    },
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "prettier/prettier": "error",
        "no-console": "off",
        "no-debugger": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        // 不在这里定义 no-var-requires
    },
    ignorePatterns: [
        "node_modules/",
        "dist/",
        "artifacts/",
        "cache/",
        "coverage/",
        "types/",
        "commonly_used/",
    ],
    overrides: [
        {
            files: ["*.ts", "*.tsx"],
            rules: {
                "@typescript-eslint/no-var-requires": "error", // ✅ TS 文件禁止 require
            },
        },
        {
            files: ["*.js"],
            rules: {
                "@typescript-eslint/no-var-requires": "off", // ✅ JS 文件允许 require
            },
        },
    ],
}
