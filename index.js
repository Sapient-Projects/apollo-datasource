const { ApolloServer, gql } = require("apollo-server");
const { products } = require("./data");
const { getUser, forAdminOnly, forEveryone, client } = require("./util");
const { AuthenticationError } = require("apollo-server-errors");
const { Products } = require("./datasources");

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    qty: Int!
  }

  type Query {
    products: [Product!]!
    productForEveryone(id: ID!): [Product]
  }
`;

const resolvers = {
  Query: {
    products: (_, __, context) => {
      const payload = JSON.parse(context.user);

      if (payload && forAdminOnly(payload.roles)) {
        return context.dataSources.products.getAllProducts();
      } else {
        throw new AuthenticationError(
          "user not authorized for this operation..."
        );
      }
    },
    productForEveryone: (_, args, context) => {
      const payload = JSON.parse(context.user);

      if (payload && forEveryone(payload.roles)) {
        // return products.find((product) => product.id === args.id);
        return context.dataSources.products.getProductByFields(args.id);
      } else {
        throw new AuthenticationError(
          "user not authorized for this operation..."
        );
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
