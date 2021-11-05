const jwt_decode = require("jwt-decode");
const { MongoClient } = require("mongodb");

const mongodbConnectionString = "mongodb://localhost/test";
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

const forEveryone = (roles) => {
  return isAdmin(roles) || isUser(roles);
};

const forAdminOnly = (roles) => {
  return isAdmin(roles) && !isUser(roles);
};

module.exports = {
  getUser,
  forEveryone,
  forAdminOnly,
  client,
};
