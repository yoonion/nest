import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private userServices: UserService) {}

  @Get()
  getUsers() {
    return this.userServices.getUsers();
  }

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.userServices.createUser(body);
  }
}
