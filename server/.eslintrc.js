module.exports = {
  extends: [
    "airbnb",
    "airbnb-typescript",
    "prettier",
    // "plugin:node/recommended"
  ],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["prettier"],
  ignorePatterns: [
    "/public/*.js",
    "/public/**/*.js",
    "/views/**/*.ejs",
    "/views/*.ejs",
    "/dist/*.js",
  ],
  rules: {
    // "prettier/prettier": "error",
    "no-console": "off",
    "func-names": "off",
    "class-methods-use-this": "off",
    radix: "off",
    "no-underscore-dangle": "off",
  },
};
