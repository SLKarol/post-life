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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { generate } from 'generate-password';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { Express } from 'express';

import { ResponseUserDto } from './dto/responseUser.dto';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { UserService } from './user.service';
import { MainUserDto, UserDto } from './dto/user.dto';
import { LoginUserDto, MainLoginDto } from './dto/loginUser.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from './decorators/user.decorator';
import { MainPutUserDto, PatchUserDto, PutUserDto } from './dto/patchUser.dto';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('users')
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: MainUserDto })
  @ApiResponse({
    description: 'Результат операции',
    status: 200,
    type: Boolean,
  })
  async createUser(@Body('user') formData: UserDto): Promise<any> {
    const user = await this.userService.createUser(formData);
    await this.userService.sendConfirmMail(user);
    return formData;
  }

  @Post('users/login')
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
  @ApiBody({ type: MainPutUserDto })
  @ApiResponse({
    description: 'Обновлённый пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  @ApiBearerAuth()
  async updateCurrentUser(
    @User('id') currentUserId: string,
    @Body('user') updateUserDto: PutUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto,
    );
    return this.userService.buildUserResponse(user);
  }

  @Get('user/confirm/:id')
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

  @Patch('user/resetPassword/:id')
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
   * Для смены пароля и/или загрузки аватарки
   */
  @Patch('user')
  @UsePipes(new BackendValidationPipe())
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: PatchUserDto })
  @ApiResponse({
    description: 'Пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  @ApiBearerAuth()
  async patchUser(
    @User('id') currentUserId: string,
    @Body() patchUserDto: PatchUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResponseUserDto> {
    if (!currentUserId) return null;
    let user = await this.userService.findUserById(currentUserId);
    // Если вызывает метод для смены аватарки
    if (file) {
      const responseUpload = await this.cloudinaryService.uploadImage({
        file,
        type: 'avatar',
      });
      const { url } = responseUpload;
      user = await this.userService.setAvatar(user, url);
    }
    // Если вызывает метод для смены пароля
    if (patchUserDto) {
      const { password } = patchUserDto;
      if (password) {
        user = await this.userService.savePassword(user, password);
      }
    }
    return await this.userService.buildUserResponse(user);
  }
}
