import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [];

  getUsers() {
    return this.users;
  }

  createUser(user) {
    this.users.push(user);
    return this.users;
  }
}