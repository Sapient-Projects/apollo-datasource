const { ApolloServer, gql } = require("apollo-server");
require("dotenv").config();
const { ForbiddenError } = require("apollo-server-core");
const { products } = require("./data");
const {
  getUser,
  forAdminOnly,
  forAdminAndUser,
  client,
  uid,
  forUserOnly,
} = require("./util");
const { Products, Reviews } = require("./datasources");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const {
  uppercaseDirectiveTransformer,
  lowercaseDirectiveTransformer,
  authDirectiveTransformer,
} = require("./directive");
const typeDefs = gql`
  type Product {
    upc: ID!
    name: String!
    weight: Int!
    price: Int!
  }

  type Review {
    authorID: String!
    body: String @hiddenForOtherUsers
  }

  type Query {
    productForUser(id: ID!): Product
    productForAdmin(id: ID!): Product
    productForUserAndAdmin(id: ID!): Product
    uppercaseDirectiveTest: String @uppercase
    lowercaseDirectiveTest: String @lowercase
    review(id: ID!): Review
  }

  directive @uppercase on FIELD_DEFINITION
  directive @lowercase on FIELD_DEFINITION
  directive @hiddenForOtherUsers on FIELD_DEFINITION | OBJECT
`;

const resolvers = {
  Query: {
    productForUser: (_, args, context) => {
      const payload = JSON.parse(context.user);
      if (payload && payload.uid === uid && forUserOnly(payload.roles)) {
        return context.dataSources.products.getProductById(args.id);
      } else if (!payload) {
        throw new ForbiddenError("log in first...");
      } else if (payload.uid !== uid || !forUserOnly(payload.roles)) {
        throw new ForbiddenError("access denied...");
      }
    },
    productForAdmin: (_, args, context) => {
      const payload = JSON.parse(context.user);
      if (payload && payload.uid === uid && forAdminOnly(payload.roles)) {
        return context.dataSources.products.getProductById(args.id);
      } else if (!payload) {
        throw new ForbiddenError("log in first...");
      } else if (payload.uid !== uid || !forAdminOnly(payload.roles)) {
        throw new ForbiddenError("access denied...");
      }
    },
    productForUserAndAdmin: (_, args, context) => {
      const payload = JSON.parse(context.user);
      if (payload && payload.uid === uid && forAdminAndUser(payload.roles)) {
        return context.dataSources.products.getProductById(args.id);
      } else if (!payload) {
        throw new ForbiddenError("log in first...");
      } else if (payload.uid !== uid || !forAdminAndUser(payload.roles)) {
        throw new ForbiddenError("access denied...");
      }
    },
    uppercaseDirectiveTest: () => "hello World in upper!",
    lowercaseDirectiveTest: () => "hello World in lower!",
    review: (_, args, context) => {
      const payload = JSON.parse(context.user);
      if (payload && payload.uid === uid) {
        return context.dataSources.reviews.getReviewById(args.id);
      } else if (!payload) {
        throw new ForbiddenError("log in first...");
      }
    },
  },
};

let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

schema = uppercaseDirectiveTransformer(schema, "uppercase");
schema = lowercaseDirectiveTransformer(schema, "lowercase");
schema = authDirectiveTransformer(schema, "hiddenForOtherUsers");

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    const user = getUser(token);
    return { user };
  },
  dataSources: () => ({
    products: new Products(client.db().collection("products")),
    reviews: new Reviews(client.db().collection("reviews")),
  }),
  formatError: (err) => {
    if (err.extensions.code === "FORBIDDEN") {
      return new Error("Access denied");
    }
    if (err.extensions.code === "UNAUTHENTICATED") {
      return new Error("Error authenticating the user");
    }
    if (err.extensions.code === "REVIEW_BODY_ACCESS_DENIED") {
      return new Error("Cannot get review body");
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
