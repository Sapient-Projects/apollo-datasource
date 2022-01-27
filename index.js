const { ApolloServer } = require("apollo-server-express");
const { KafkaPubSub } = require("graphql-kafka-subscriptions");
const { gql } = require("apollo-server");
const express = require("express");
const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { PubSub } = require("graphql-subscriptions");
const { User } = require("./datasources");
const { Pool } = require("undici");
const { DuplicateIdError } = require("./errors/duplicateIdError");

const baseURL = "http://localhost:3000";
const pool = new Pool(baseURL);

const pubsub = new KafkaPubSub({
  host: "localhost",
  port: "29092",
  topic: "users-graphql"
});

const typeDefs = gql`
  type User {
    id: String!
    name: String!
    birthDate: String!
    username: String!
  }
  type Query {
    getUsers: [User]
  }
  type Mutation {
    createUser(id: ID, name: String, birthDate: String, username: String): User
  }
  type Subscription {
    userCreated: User
  }
`;

const resolvers = {
  Query: {
    getUsers: async (_, __, context) => {
      const response = await context.dataSources.usersAPI.getUsers();
      return response.body;
    },
  },
  Mutation: {
    createUser: async (_, args, context) => {
      const response = await context.dataSources.usersAPI.createUser(args);
      pubsub.publish("USER_CREATED", { userCreated: args });
      return response.body;
    },
  },
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(["USER_CREATED"]),
    },
  },
};

(async function () {
  const app = express();
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
    dataSources: () => ({
      usersAPI: new User(baseURL, pool),
    }),
    formatError: (err) => {
      if (err.originalError instanceof DuplicateIdError) {
        return new Error(err.message);
      }
      return err;
    },
  });
  await server.start();
  server.applyMiddleware({ app });
  const PORT = 4000;
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}/graphql`)
  );
})();
