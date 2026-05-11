const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

class User {
  constructor() {
    this.router = router;
    this.middlewares = middlewares;
  }

  async findByEmail(email) {
    const users = await this.getUsers();
    return users.find(user => user.email === email);
  }

  async findById(id) {
    const users = await this.getUsers();
    return users.find(user => user.id == id);
  }

  async create(userData) {
    const users = await this.getUsers();
    const newUser = { ...userData, id: Date.now().toString() };
    users.push(newUser);
    await this.saveUsers(users);
    return newUser;
  }

  async getUsers() {
    const users = this.router.db.get('users').value();
    return users || [];
  }

  async saveUsers(users) {
    return this.router.db.set('users', users).write();
  }
}

module.exports = new User();