const jsdom = require("jsdom");
const { JSDOM } = jsdom;
global.dom = new JSDOM(null, { url: "http://localhost" });
global.window = dom.window;
global.document = global.window.document;
global.navigator = global.window.navigator;

const Storage = require("dom-storage");
global.localStorage = new Storage(null, { strict: true });
global.sessionStorage = new Storage(null, { strict: true });

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

require("ignore-styles");
require("isomorphic-fetch");
require("canvas");

require("@babel/register")({
  ignore: [/(node_modules)/],
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    [
      "babel-plugin-inline-import-data-uri",
      { extensions: [".webp", ".jpg", ".gif", ".png"] },
    ],
    "@babel/plugin-transform-runtime",
    "@babel/plugin-proposal-class-properties",
    "babel-plugin-inline-react-svg",
  ],
});

import server from "./index";
module.exports = server;
