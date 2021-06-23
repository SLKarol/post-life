import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  UseGuards,
  Put,
} from '@nestjs/common';

import { ResponseUserDto } from './dto/resonseUser.dto';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';

import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { UserService } from './user.service';
import { CreateUserDto, MainCreateUserDto } from './dto/createUser.dto';
import { LoginUserDto, MainLoginDto } from './dto/loginUser.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from './decorators/user.decorator';
import { ListUsersResponseDto } from './dto/listUsersResponse.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: MainCreateUserDto })
  @ApiResponse({
    description: 'Зарегестрированный пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.createUser(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: MainLoginDto })
  @ApiResponse({
    description: 'Успешно залогинился юзер',
    status: 200,
    type: ResponseUserDto,
  })
  async login(@Body('user') loginDto: LoginUserDto): Promise<ResponseUserDto> {
    const user = await this.userService.login(loginDto);
    return await this.userService.buildUserResponse(user);
  }

  @Get()
  async findAll(): Promise<ListUsersResponseDto> {
    const users = await this.userService.findAll();
    return await this.userService.buildListUserResponse(users);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async currentUser(@User('id') currentUserId: string) {
    const user = await this.userService.findUserById(currentUserId);
    return user;
  }
}
