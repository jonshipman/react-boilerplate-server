module.exports = {
  ignore: [/(node_modules)/],
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    [
      "babel-plugin-inline-import-data-uri",
      { extensions: [".webp", ".jpg", ".gif", ".png"] },
    ],
    "babel-plugin-inline-react-svg",
    "@babel/plugin-proposal-class-properties",
  ],
};
