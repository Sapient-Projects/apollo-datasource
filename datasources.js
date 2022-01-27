const { HTTPDataSource } = require("apollo-datasource-http");
const { DuplicateIdError } = require("./errors/duplicateIdError");
class User extends HTTPDataSource {
  constructor(baseURL, pool) {
    super(baseURL, { pool });
    this.baseURL = baseURL;
  }

  async getUserById(id) {
    return this.get(`${this.baseURL}/users/${id}`);
  }

  async getUsers() {
    return this.get(`${this.baseURL}/users`);
  }

  async createUser({ id, name, birthDate, username }) {
    const users = await this.getUsers();
    const user = users.body.find(u => u.id === id);
    if (user) {
      throw new DuplicateIdError("user with id: " + id + " already exists!");
    }
    return this.post(`${this.baseURL}/users`, {
      body: {
        id,
        name,
        birthDate,
        username,
      },
    });
  }

  onError(error, request) {
    if (error instanceof DuplicateIdError) {
      console.log(error.request);
    }
  }
}

module.exports = {
  User,
};