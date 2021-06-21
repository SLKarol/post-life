import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<{ users: string[] }> {
    const users = await this.userService.findAll();
    return {
      users: users.map((user) => user.username),
    };
  }
}
