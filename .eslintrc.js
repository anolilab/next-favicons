module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier", "jest"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/all",
        "prettier",
        "prettier/@typescript-eslint",
    ],
}
