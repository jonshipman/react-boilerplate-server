import babel from "@babel/register";

// Provide jsdom replacements for browser properties
import { JSDOM } from "jsdom";

// Create mock storage (won't be used on the server, keeps the code from dying)
import Storage from "dom-storage";

// Provide a replacemen for fetch, and build upon canvas
import "isomorphic-fetch";
import "canvas";

import { server } from "./server";

const init = () => {
  babel({
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: [
      [
        "babel-plugin-inline-import-data-uri",
        { extensions: [".webp", ".jpg", ".gif", ".png"] },
      ],
      "babel-plugin-inline-react-svg",
      "@babel/plugin-proposal-class-properties",
    ],
    ignore: ["*.scss", "*.css"],
  });

  global.dom = new JSDOM(null, { url: "http://localhost" });
  global.window = global.dom.window;
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
};

export { server, init };
