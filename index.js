const { ApolloServer, gql } = require("apollo-server");
const { Pool } = require("undici");

const { User } = require("./datasources");

const baseURL = "http://localhost:3000";
const pool = new Pool(baseURL);

const typeDefs = gql`
  type User {
    id: String!
    name: String!
    birthDate: String!
    username: String!
  }

  type Query {
    getUsers: [User]
    getUserById(id: ID): User
  }

  type Mutation {
    createUser(id: ID, name: String, birthDate: String, username: String): User
  }
`;

const resolvers = {
  Query: {
    getUsers: async (_, __, context) => {
      const response = await context.dataSources.usersAPI.getUsers();
      const users = response.body;
      return users;
    },

    getUserById: async (_, args, context) => {
      const response = await context.dataSources.usersAPI.getUserById(args.id);
      const user = response.body;
      return user;
    },
  },

  Mutation: {
    createUser: async (_, args, context) => {
      const response = await context.dataSources.usersAPI.createUser(args);
      return response.body;
    }
  }
};

const server = new ApolloServer({
  // typedefs, resolvers, directives
  typeDefs,
  resolvers,

  // define where to fetch data from
  dataSources: () => ({
    usersAPI: new User(baseURL, pool),
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
