const jwt_decode = require("jwt-decode");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const mongodbConnectionString = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost/demo?authSource=admin`;
const client = new MongoClient(mongodbConnectionString);
client.connect();

const getUser = (token) => {
  if (!token) return null;
  const strippedToken = token.slice(7);
  const payload = jwt_decode(strippedToken);
  return JSON.stringify(payload);
};

const isAdmin = (roles) => {
  return roles.includes("ADMIN");
};

const isUser = (roles) => {
  return roles.includes("USER");
};

const forAdminAndUser = (roles) => {
  return isAdmin(roles) || isUser(roles);
};

const forAdminOnly = (roles) => {
  return isAdmin(roles) && !isUser(roles);
};

module.exports = {
  getUser,
  forAdminAndUser,
  forAdminOnly,
  client,
};

/*
ADMIN - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlcyI6WyJBRE1JTiJdfQ.XWwpxAoYt2RJYeVF668uMAbLonQEU5joMXl7EWggL8U

USER - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlcyI6WyJVU0VSIl19.TXam8pxYmhfzIZwslJmt89EusXjJnLdSt9VyK3gqHrc

ADMIN, USER - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlcyI6WyJVU0VSIiwiQURNSU4iXSwidWlkIjoiMTJhc2QzNCJ9.Oaxq0wkva1dCvXbfcGncDBOzqajD3zZ1r_jCCRtGcfk
*/