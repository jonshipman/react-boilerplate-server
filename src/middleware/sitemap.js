import React from "react";

import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  useQuery,
  gql,
} from "@apollo/client";
import { renderToStringWithData } from "@apollo/react-ssr";

let posts = [];
let tax = [];
let gqlUrl = "";
let FRONTEND_URL = "";

const getBaseQuery = () => {
  let post_query = "";
  let tax_query = "";

  posts.forEach((type) => {
    post_query += `
      ${type}(first: 1, where: { status: PUBLISH, hasPassword: false }) {
        edges {
          node {
            id
            modified
          }
        }
      }
    `;
  });

  tax.forEach(({ type, post }) => {
    tax_query += `
      ${type}(first: 1, where: { hideEmpty: true }) {
        edges {
          node {
            id
            ${post}(first: 1, where: { status: PUBLISH, hasPassword: false }) {
              edges {
                node {
                  id
                  modified
                }
              }
            }
          }
        }
      }
    `;
  });

  return gql`
    query SiteMapIndex {
      ${post_query}
      ${tax_query}
    }
  `;
};

const getObjectQuery = (type, post) => {
  if (post) {
    return gql`
      query SiteMapObjectQuery_${type} {
        ${type}(first: 9999, where: { hideEmpty: true }) {
          edges {
            node {
              id
              uri
              ${post}(first: 1, where: { status: PUBLISH, hasPassword: false }) {
                edges {
                  node {
                    id
                    modified
                  }
                }
              }
            }
          }
        }
      }
    `;
  }

  return gql`
    query SiteMapObjectQuery_${type} {
      ${type}(first: 9999, where: { status: PUBLISH, hasPassword: false }) {
        edges {
          node {
            id
            title
            modified
            uri
          }
        }
      }
    }
  `;
};

const SitemapIndex = ({ children, ...props }) =>
  React.createElement("sitemapindex", props, children);
const SitemapTag = ({ children, ...props }) =>
  React.createElement("sitemap", props, children);
const UrlSet = ({ children, ...props }) =>
  React.createElement("urlset", props, children);
const Url = ({ children, ...props }) =>
  React.createElement("url", props, children);
const Loc = ({ children, ...props }) =>
  React.createElement("loc", props, children);
const LastMod = ({ children, ...props }) =>
  React.createElement("lastmod", props, children);
const Priority = ({ children, ...props }) =>
  React.createElement("priority", props, children);

const Sitemap = ({ host, query, type }) => {
  const { loading, error, data } = useQuery(query);

  if (loading) return null;
  if (error) return null;

  if (!type) {
    return (
      <SitemapIndex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        {posts.map((type) =>
          data[type]?.edges?.length > 0 ? (
            <SitemapTag>
              <Loc>{`${host}/${type}-sitemap.xml`}</Loc>
              <LastMod>{data[type].edges[0].node?.modified}</LastMod>
            </SitemapTag>
          ) : null
        )}

        {tax.map(({ type, post }) =>
          data[type]?.edges?.length > 0 &&
          data[type].edges[0].node[post]?.edges?.length > 0 ? (
            <SitemapTag>
              <Loc>{`${host}/${type}-sitemap.xml`}</Loc>
              <LastMod>
                {data[type].edges[0].node[post].edges[0]?.node?.modified}
              </LastMod>
            </SitemapTag>
          ) : null
        )}
      </SitemapIndex>
    );
  } else {
    return (
      <UrlSet xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        {data[type]?.edges?.length > 0 &&
          data[type].edges.map((obj) => (
            <Url key={obj.node.id}>
              <Loc>{`${host}${obj.node.uri.replace(/\/$/, "")}`}</Loc>
              <LastMod>
                {obj?.node?.modified ||
                  obj?.node?.posts?.edges[0]?.node?.modified}
              </LastMod>
              <Priority>0.8</Priority>
            </Url>
          ))}
      </UrlSet>
    );
  }
};

export const setParams = (params = {}) => {
  posts = params.posts || [];
  tax = params.tax || [];
  gqlUrl = params.gqlUrl || "";
  FRONTEND_URL = params.FRONTEND_URL || "";
};

export const sitemap = async (req, res) => {
  const client = new ApolloClient({
    ssrMode: true,
    link: new HttpLink({
      uri: gqlUrl,
      fetch: fetch,
      credentials: "include",
      headers: {
        cookie: req.header("Cookie"),
        origin: FRONTEND_URL,
      },
    }),
    cache: new InMemoryCache(),
  });

  let host = `https://${req.get("host")}`;
  let url = req.baseUrl.replace(/^\//, "");
  let sitemapJsx = <Sitemap host={host} query={getBaseQuery()} />;

  posts.forEach((type) => {
    if (`${type}-sitemap.xml` === url) {
      sitemapJsx = (
        <Sitemap host={host} query={getObjectQuery(type)} type={type} />
      );
    }
  });

  tax.forEach(({ type, post }) => {
    if (`${type}-sitemap.xml` === url) {
      sitemapJsx = (
        <Sitemap host={host} query={getObjectQuery(type, post)} type={type} />
      );
    }
  });

  const tree = <ApolloProvider client={client}>{sitemapJsx}</ApolloProvider>;

  renderToStringWithData(tree)
    .then((xml) => {
      res.setHeader("Content-Type", "text/xml; charset=UTF-8");

      res
        .status(200)
        .send(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`)
        .end();
    })
    .catch((error) => {
      res
        .status(500)
        .send(
          `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>${host}</loc>
          <error>${error}</error>
          <lastmod>1970-01-01</lastmod>
          <changefreq>never</changefreq>
          <priority>0.8</priority>
        </url>
      </urlset>`
        )
        .end();
    });
};
