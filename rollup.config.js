import babel from "@rollup/plugin-babel";

export default {
  input: "src/bootstrap.js",
  output: {
    file: "dist/bundle.js",
    format: "esm",
    sourcemap: true,
  },
  plugins: [babel({ babelHelpers: "runtime", exclude: "node_modules/**" })],
};
