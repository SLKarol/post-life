import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  UseGuards,
  Put,
} from '@nestjs/common';

import { UserResponseInterface } from './types/userResponse.interface';
import { ListUsersResponseInterface } from './types/listUsersResponse.interface';

import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { UserService } from './user.service';
import { CreateUserDto } from '@app/dto/createUser.dto';
import { LoginUserDto } from '@app/dto/loginUser.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from './decorators/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new BackendValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new BackendValidationPipe())
  async login(
    @Body('user') loginDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginDto);
    return await this.userService.buildUserResponse(user);
  }

  @Get()
  async findAll(): Promise<ListUsersResponseInterface> {
    const users = await this.userService.findAll();
    return await this.userService.buildListUserResponse(users);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async currentUser(@User('id') currentUserId: string) {
    const user = await this.userService.findUserById(currentUserId);
    return user;
  }
}
