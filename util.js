const { AuthenticationError } = require("apollo-server-core");
const jwt_decode = require("jwt-decode");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uid = "user123";

const mongodbConnectionString = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@localhost/demo?authSource=admin`;
const client = new MongoClient(mongodbConnectionString);
client.connect();

const getUser = (token) => {
  if (!token) return null;
  const strippedToken = token.slice(7);
  const payload = jwt_decode(strippedToken);
  if (payload.uid !== uid) {
    throw new AuthenticationError("invalid credentials!");
  }
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
ADMIN - Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInByb3BZIjo0ODA0M30.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJ1c2VyMTIiLCJyb2xlcyI6WyJBRE1JTiJdfQ.W9vhqNb_Btbxp__WNdXM78vZ06n5pnL6uNY5W29WgMltqpTu1VBf1q2xMIRiowqk6GvLA-LdoQZOj3ocx9WmrLftXsZeZfAWLawNi2zEMSqwImUnd37YtR62zOr1Q4SXG9AAiIWNCYnMxy9sityBfQUtSrbWvFaTb9lnn9xbWTE3RQ15LptixfCm15BCw81s0mcl-jfzQSq0E2yDv2YaQ6JJUqbtYge8aEsDAB7uSP1oicDQL8c_m6vsaePJfqZhJK4U-m2x5DNNpQtlRWHR-_bHVI1ZPlePuEhyBcVdzg2ZOstSPzdlWpYFmTDXsINiyy5h1oZc4-PU94bNPd0pzw
        
USER - Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInByb3BZIjo0ODA0M30.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJ1c2VyMTIiLCJyb2xlcyI6WyJVU0VSIl19.IzIvUHQ0YxPD51iF-XUuCe8kPnD9waGPO6Pat3cXtyB3FHEKg3qV0OUPQUZOcAYIj1Y-l9OTGVkcuYpvtCc1q3OZZzmGi-ORhkaWurZ1g_yOJnNmoo2xEivZn-VhCFaktbFroEVCJWM7369lO-uXXt0ncVtZ6laWtOKk3DdmzRlL756G6499ibdqvJRznoplcU1MtoQ_mqi880pQOPeyTN7kGgTUUWoftsTEW7c4kIpObJ7p4ZRdJLf9Z24j8klj_AxbQn0rG-HvNjdOgIg9h4TVUmgCRf5toIjaVmjdyoYnnKcghhYRjAcPRA_d50X4Qc2rT5hThqu1xesH7eNRBA

ADMIN, USER - Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInByb3BZIjo0ODA0M30.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ1aWQiOiJ1c2VyMTIiLCJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXX0.X6R7K8K4jt4WM805q0s_o9Fo5McpguAvucd2ByUVPzKYVkLwYNg0WdUWYQ8dmHEwtVPs3SSo4nbrB5eeerearJuzoEf4XQiwOFwWkQALJMbLYGdu4WI23so9cLgnLsyQoqVhGkszFk-5ftJFCfo_HrYm-gH2xpEWlj13bP-siy64LSr3TmCGmaXoDAI0cq3KHu62eskv5KG5hHFsrnlKnKXQBy0k6FIU--9qBHs-_R9D6PVQZbbem7xIHAOTTjEh4oBQBkS0aYGTm-w_0aunPt1qj0xZmgkz1f8mzLMLEIRGgpScSOquzEsO_22f185r7a9fScb4rJzhKfaGfO_RXg
*/
