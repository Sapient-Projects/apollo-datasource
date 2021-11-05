const { MongoDataSource } = require("apollo-datasource-mongodb");
const { AuthenticationError } = require("apollo-server-errors");
const uid = "12asd34";

class Products extends MongoDataSource {
  getProduct(id) {
    return this.findOneById(id);
  }
  getProductByFields(id) {
    const user = JSON.parse(this.context.user)
    if (user.uid === uid) {
      return this.findByFields({ id });
    } else {
      throw new AuthenticationError("user not authorized to perform this operation...")
    }
  }
}

module.exports = {
  Products,
};
