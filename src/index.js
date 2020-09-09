// Provide jsdom replacements for browser properties
import { JSDOM } from "jsdom";
global.dom = new JSDOM(null, { url: "http://localhost" });
global.window = global.dom.window;
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
import "isomorphic-fetch";
import "canvas";

import { server } from "./server";

export { server };
