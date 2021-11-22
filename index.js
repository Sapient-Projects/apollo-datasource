const { ApolloServer, gql } = require("apollo-server");
require("dotenv").config();
const { AuthenticationError } = require("apollo-server-errors");
const { products } = require("./data");
const {
  getUser,
  forAdminOnly,
  forAdminAndUser,
  client,
  uid,
  forUserOnly,
} = require("./util");
const { Products } = require("./datasources");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const {
  uppercaseDirectiveTransformer,
  lowercaseDirectiveTransformer,
} = require("./directive");
const typeDefs = gql`
  type Product {
    upc: ID!
    name: String!
    weight: Int!
    price: Int!
  }

  type Query {
    productForUser(id: ID!): Product
    productForAdmin(id: ID!): Product
    productForUserAndAdmin(id: ID!): Product
    uppercaseDirectiveTest: String @uppercase
    lowercaseDirectiveTest: String @lowercase
  }

  directive @uppercase on FIELD_DEFINITION
  directive @lowercase on FIELD_DEFINITION
`;

const resolvers = {
  Query: {
    productForUser: (_, args, context) => {
      const payload = JSON.parse(context.user);
      if (payload && payload.uid === uid && forUserOnly(payload.roles)) {
        return context.dataSources.products.getProductById(args.id);
      } else if (!payload) {
        throw new AuthenticationError("log in first...");
      } else if (payload.uid !== uid || !forUserOnly(payload.roles)) {
        throw new AuthenticationError("access denied...");
      }
    },
    productForAdmin: (_, args, context) => {
      const payload = JSON.parse(context.user);
      if (payload && payload.uid === uid && forAdminOnly(payload.roles)) {
        return context.dataSources.products.getProductById(args.id);
      } else if (!payload) {
        throw new AuthenticationError("log in first...");
      } else if (payload.uid !== uid || !forAdminOnly(payload.roles)) {
        throw new AuthenticationError("access denied...");
      }
    },
    productForUserAndAdmin: (_, args, context) => {
      const payload = JSON.parse(context.user);

      if (payload && payload.uid === uid && forAdminAndUser(payload.roles)) {
        return context.dataSources.products.getProductById(args.id);
      } else if (!payload) {
        throw new AuthenticationError("log in first...");
      } else if (payload.uid !== uid || !forAdminAndUser(payload.roles)) {
        throw new AuthenticationError("access denied...");
      }
    },
    uppercaseDirectiveTest: () => "hello World in upper!",
    lowercaseDirectiveTest: () => "hello World in lower!",
  },
};

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

schema = uppercaseDirectiveTransformer(schema, "uppercase");
schema = lowercaseDirectiveTransformer(schema, "lowercase");

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    const user = getUser(token);
    return { user };
  },
  dataSources: () => ({
    products: new Products(client.db().collection("products")),
  }),
  formatError: (err) => {
    if (err.extensions.code === "UNAUTHENTICATED") {
      return new Error("Error authenticating the user");
    }
    return err;
  },
});

server
  .listen()
  .then(({ url }) => {
    console.log(`Gateway ready at ${url}`);
  })
  .catch((err) => {
    console.error(err);
  });
