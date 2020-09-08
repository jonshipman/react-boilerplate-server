import "canvas";
import "ignore-styles";
import "isomorphic-fetch";
import { JSDOM } from "jsdom";
import Babel from "@babel/register";
import Storage from "dom-storage";

import server from "./index";

global.dom = new JSDOM(null, { url: "http://localhost" });
global.window = dom.window;
global.document = global.window.document;
global.navigator = global.window.navigator;

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

Babel({
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

export default server;
