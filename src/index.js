import React from "react";
import { render } from "react-dom";
import App from "./app";
import { ApolloProvider, InMemoryCache } from "@apollo/react-hooks";
import { ApolloLink } from "apollo-link";
import { createAuthLink } from "aws-appsync-auth-link";
import ApolloClient from "apollo-client";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import "normalize.css";
import "./index.css";

const url =
  "https://xqbqahnovzf2db6tj5fzabnz4u.appsync-api.us-west-2.amazonaws.com/graphql";
const region = "us-west-2";
const auth = {
  type: "API_KEY",
  apiKey: "da2-hl3ydon5j5g4rhvnuq2rom3swe",
};
const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth }),
]);
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const rootElement = document.getElementById("root");
render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  rootElement
);
