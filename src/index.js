// These aren't being rolled up in the proper order, required by JSDOM
var CSSStyleDeclaration = {};
import "cssstyle";
import "cssom";

// Provide jsdom replacements for browser properties
import { JSDOM } from "jsdom";
global.dom = new JSDOM(null, { url: "http://localhost" });
global.window = dom.window;
global.document = global.window.document;
global.navigator = global.window.navigator;

// Create mock storage (won't be used on the server, keeps the code from dying)
import Storage from "dom-storage";
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

// Ignore styles, provide a replacemen for fetch, and build upon canvas
import "ignore-styles";
import "isomorphic-fetch";
import "canvas";

// Babel code
import babel from "@babel/register";

babel({
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

import { server } from "./server";

export { server };
