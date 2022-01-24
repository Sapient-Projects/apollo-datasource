const { HTTPDataSource } = require("apollo-datasource-http");

class User extends HTTPDataSource {
  constructor(baseURL, pool) {
    super(baseURL, { pool });
    this.baseURL = baseURL;
  }

  async getUserById(id) {
    return this.get(`${this.baseURL}/users/${id}`)
  }

  async getUsers() {
    return this.get(`${this.baseURL}/users`);
  }
}

module.exports = {
  User,
};
