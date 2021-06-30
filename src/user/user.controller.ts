import {
  Controller,
  Post,
  Body,
  UsePipes,
  Get,
  UseGuards,
  Put,
  Param,
  Patch,
} from '@nestjs/common';
import { generate } from 'generate-password';

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
import { MainPatchUserDto, PatchUserDto } from './dto/patchUser.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: MainCreateUserDto })
  @ApiResponse({
    description: 'Результат операции',
    status: 200,
    type: Boolean,
  })
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<boolean> {
    const user = await this.userService.createUser(createUserDto);
    await this.userService.sendConfirmMail(user);
    return true;
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

  @Put()
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

  @Patch('resetPassword/:id')
  @ApiResponse({
    description: 'Пароль сброшен',
    status: 200,
    type: Boolean,
  })
  async resetPassword(@Param('id') userId: string) {
    if (!userId) return null;
    let user = await this.userService.findUserById(userId);
    const newPassword = generate({ numbers: true });
    user = await this.userService.savePassword(user, newPassword);
    this.userService.sendNewPasswordToMail(user, newPassword);
    return true;
  }

  /**
   * Для смены пароля или аватарки
   * (аватарка в будущем)
   */
  @Patch()
  @UsePipes(new BackendValidationPipe())
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: MainPatchUserDto })
  @ApiResponse({
    description: 'Пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  @ApiBearerAuth()
  async patchUser(
    @User('id') currentUserId: string,
    @Body('user') patchUserDto: PatchUserDto,
  ): Promise<ResponseUserDto> {
    if (!currentUserId) return null;
    const { password } = patchUserDto;
    let user = await this.userService.findUserById(currentUserId);
    if (password) {
      user = await this.userService.savePassword(user, password);
    }
    return await this.userService.buildUserResponse(user);
  }
}
