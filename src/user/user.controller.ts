import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  UseGuards,
  Put,
  Param,
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
import { MainUpdateUserDto, UpdateUserDto } from './dto/updateUser.dto';
import {
  ChangeUserPasswordDto,
  MainChangeUserPassportDto,
} from './dto/changeUserPassword.dto';

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
    await this.userService.sendConfirmMail(user);
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
  @ApiResponse({
    description: 'Список пользователей',
    status: 200,
    type: ListUsersResponseDto,
  })
  async findAll(): Promise<ListUsersResponseDto> {
    const users = await this.userService.findAll();
    return await this.userService.buildListUserResponse(users);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Текущий зарегестрированный юзер',
    type: ResponseUserDto,
  })
  async currentUser(
    @User('id') currentUserId: string,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.findUserById(currentUserId);
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UsePipes(new BackendValidationPipe())
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: MainUpdateUserDto })
  @ApiResponse({
    description: 'Обновлённый пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  @ApiBearerAuth()
  async updateCurrentUser(
    @User('id') currentUserId: string,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto,
    );
    return this.userService.buildUserResponse(user);
  }

  @Get('confirm/:id')
  @ApiResponse({
    description: 'Пользователь, прошедший проверку почтового адреса',
    status: 200,
    type: ResponseUserDto,
  })
  async confirm(@Param('id') userId: string): Promise<ResponseUserDto> {
    if (!userId) return null;
    const user = await this.userService.setConfirmMail(userId);
    return await this.userService.buildUserResponse(user);
  }

  @Put('resetPassword/:id')
  @ApiResponse({
    description: 'Пароль сброшен',
    status: 200,
    type: Boolean,
  })
  async resetPassword(@Param('id') userId: string) {
    if (!userId) return null;
    const result = await this.userService.setNewUserPassword(userId);
    this.userService.sendNewPasswordToMail(result.user, result.newPassword);
    return true;
  }

  @Put('changePassword')
  @UsePipes(new BackendValidationPipe())
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: MainChangeUserPassportDto })
  @ApiResponse({
    description: 'Пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  @ApiBearerAuth()
  async changePassword(
    @User('id') currentUserId: string,
    @Body('user') changeUserPasswordDto: ChangeUserPasswordDto,
  ) {
    if (!currentUserId) return null;
    const result = await this.userService.setNewUserPassword(
      currentUserId,
      changeUserPasswordDto.password,
    );
    return await this.userService.buildUserResponse(result.user);
  }
}
