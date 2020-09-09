import express from "express";
import path from "path";
import {
  serverRenderer,
  setParams as rendererParams,
} from "./middleware/renderer";
import robots from "./middleware/robots";
import { sitemap, setParams as setSitemapParams } from "./middleware/sitemap";

const server = {};
server.PORT = 3000;
server.BACKEND_URL = "https://development.local";
server.FRONTEND_URL = "http://localhost:3000";
server.AppComponent = "div";
server.useRedirectionSsr = false;
server.sitemap = {
  posts: ["posts", "pages"],
  tax: [{ type: "categories", post: "posts" }],
};
server.staticMaxAge = "30d";
server.paths = {
  200: "./build/index.html",
  500: "./build/error-500.html",
};

server.start = function () {
  const {
    PORT,
    BACKEND_URL,
    FRONTEND_URL,
    sitemap: sitemapParams = {},
    AppComponent,
    useRedirectionSsr,
    paths,
  } = this;
  const gqlUrl = this.gqlUrl || BACKEND_URL + "/graphql";

  const { posts = [], tax = [] } = sitemapParams;

  // Set sitemap params
  setSitemapParams({ posts, tax, gqlUrl, FRONTEND_URL });

  // Set renderer params
  rendererParams({
    useRedirectionSsr,
    FRONTEND_URL,
    AppComponent,
    gqlUrl,
    paths,
  });

  // initialize the application and create the routes
  const app = express();
  const router = express.Router();
  const build_path = path.resolve(__dirname, "..", "build");

  const wordpress = (_, res) => {
    res.redirect(`${BACKEND_URL}/wp-login.php`);
  };

  // root (/) should always serve our server rendered page
  router.use("^/$", serverRenderer);
  router.use("^/index.html$", serverRenderer);
  router.use("^/robots.txt$", robots);

  // WordPress redirects
  router.use("^/wp-admin$", wordpress);
  router.use("^/wp-login.php$", wordpress);

  // Sitemaps
  router.use("^/sitemap_index.xml$", sitemap);
  posts.forEach((type) => {
    router.use(`^/${type}-sitemap.xml$`, sitemap);
  });
  tax.forEach(({ type }) => {
    router.use(`^/${type}-sitemap.xml$`, sitemap);
  });

  // other static resources should just be served as they are
  router.use(express.static(build_path, { maxAge: this.staticMaxAge }));

  router.use(serverRenderer);

  // tell the app to use the above rules
  app.use(router);

  // start the app
  app.listen(PORT, (error) => {
    if (error) {
      return console.log("something bad happened", error);
    }

    console.log("listening on " + PORT + "...");
  });
};

export { server };
