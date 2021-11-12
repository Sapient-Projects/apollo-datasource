const { ApolloServer, gql } = require("apollo-server");
const { products } = require("./data");
const {
  getUser,
  forAdminOnly,
  forAdminAndUser,
  client,
  uid,
  forUserOnly,
} = require("./util");
const { AuthenticationError } = require("apollo-server-errors");
const { Products } = require("./datasources");

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
  }
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
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || "";
    const user = getUser(token);
    return { user };
  },
  dataSources: () => ({
    products: new Products(client.db().collection("products")),
  }),
});

server
  .listen()
  .then(({ url }) => {
    console.log(`Gateway ready at ${url}`);
  })
  .catch((err) => {
    console.error(err);
  });
