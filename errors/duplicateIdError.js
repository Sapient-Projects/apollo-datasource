const { ApolloError } = require("apollo-server-errors");

class DuplicateIdError extends ApolloError {
  constructor(message) {
    super(message, "DUPLICATE_ID_ERROR");

    Object.defineProperty(this, "name", { value: "DuplicateIdError" });
  }
}

module.exports = {
  DuplicateIdError,
};
