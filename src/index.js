import React from "react";
import { render } from "react-dom";
import App from "app";
import { ApolloProvider, InMemoryCache } from "@apollo/react-hooks";
import { ApolloLink } from "apollo-link";
import { createAuthLink } from "aws-appsync-auth-link";
import ApolloClient from "apollo-client";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import "normalize.css";
import "index.css";

const url = process.env.REACT_APP_API_URL;
const region = process.env.REACT_APP_REGION;
const auth = {
  type: "API_KEY",
  apiKey: process.env.REACT_APP_AUTH_KEY,
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
