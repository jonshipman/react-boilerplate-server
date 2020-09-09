/**
 * Use with the two plugins Redirection by John Godley and https://github.com/jonshipman/wp-graphql-redirection/archive/master.zip
 */

import { gql } from "@apollo/client";

const REDIRECTION_QUERY = gql`
  query Redirection($matchUrl: String!) {
    redirections(
      where: { orderby: "position", matchUrl: $matchUrl, status: ENABLED }
      first: 10
    ) {
      nodes {
        url
        matchUrl
        regex
        status
        id
        databaseId
        position
        actionCode
        actionData
        actionType
      }
    }
  }
`;

export default async (client, req) => {
  const output = {
    redirect: false,
    code: 200,
    url: "",
  };

  const {
    data: {
      redirections: { nodes: redirections },
    },
  } = await client.query({
    query: REDIRECTION_QUERY,
    variables: { matchUrl: req.baseUrl + req.path },
  });

  if (redirections?.length > 0) {
    let newUrl = "";
    let code = 301;

    redirections.reverse().forEach((r) => {
      if (
        "url" === r.actionType &&
        r.actionData.replace(/^[\s\uFEFF\xA0\/]+|[\s\uFEFF\xA0\/]+$/g, "") !==
          r.matchUrl.replace(/^[\s\uFEFF\xA0\/]+|[\s\uFEFF\xA0\/]+$/g, "")
      ) {
        newUrl = r.actionData;
        code = r.actionCode;
      }
    });

    if (newUrl) {
      output.redirect = true;
      output.code = code;
      output.url = newUrl;
    }
  }

  return output;
};
