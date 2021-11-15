const jwt_decode = require("jwt-decode");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uid = "user12";

const mongodbConnectionString = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost/demo?authSource=admin`;
const client = new MongoClient(mongodbConnectionString);
client.connect();

const getUser = (token) => {
  try {
    if (!token) return null;
    const strippedToken = token.slice(7);
    const payload = jwt_decode(strippedToken);
    return JSON.stringify(payload);
  } catch (error) {
    throw new Error(error.message);
  }
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

const forUserOnly = (roles) => {
  return isUser(roles) && !isAdmin(roles);
};

module.exports = {
  getUser,
  forAdminAndUser,
  forAdminOnly,
  forUserOnly,
  client,
  uid,
};

/*
ADMIN - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJ1c2VyMTIiLCJyb2xlcyI6WyJBRE1JTiJdfQ.4Xp2JQvMcbVGgcJb0uW_jRgyh3yK0Di8Vw-2cnZUqVc

USER - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJ1c2VyMTIiLCJyb2xlcyI6WyJVU0VSIl19.7lcxG3pEwXGywgvqwrX88IBv71hD2iRIUtr1hzylGN8

ADMIN, USER - Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJ1c2VyMTIiLCJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXX0.6dfvHa70znDO0sWSkuwuGBYezO_1RD0Faie1_OlhMQY
*/
