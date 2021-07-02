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
  PartialType,
} from '@nestjs/swagger';
import { Express } from 'express';

import { ResponseUserDto } from './dto/resonseUser.dto';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { UserService } from './user.service';
import { MainUserDto } from './dto/user.dto';
import { LoginUserDto, MainLoginDto } from './dto/loginUser.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from './decorators/user.decorator';
import { ListUsersResponseDto } from './dto/listUsersResponse.dto';
import { MainPatchUserDto, PatchUserDto } from './dto/patchUser.dto';
import { CloudinaryService } from '@app/cloudinary/cloudinary.service';
import { AvatarDto } from './dto/avatar.dto';
import { UploadFileDto } from '@app/types/uploadFile.interface';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UsePipes(new BackendValidationPipe())
  @ApiBody({ type: MainUserDto })
  @ApiResponse({
    description: 'Результат операции',
    status: 200,
    type: Boolean,
  })
  async createUser(@Body() formData: MainUserDto): Promise<boolean> {
    const user = await this.userService.createUser(formData.user);
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
  @ApiBody({ type: MainUserDto })
  @ApiResponse({
    description: 'Обновлённый пользователь',
    status: 200,
    type: ResponseUserDto,
  })
  @ApiBearerAuth()
  async updateCurrentUser(
    @User('id') currentUserId: string,
    @Body() updateUserDto: MainUserDto,
  ): Promise<ResponseUserDto> {
    const user = await this.userService.updateUser(
      currentUserId,
      updateUserDto.user,
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
   * Для смены пароля
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

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Аватар, загруженный с компа (файл то есть)',
    type: PartialType(AvatarDto),
  })
  @ApiResponse({
    status: 200,
    type: UploadFileDto,
  })
  @ApiBearerAuth()
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @User('id') currentUserId: string,
  ): Promise<ResponseUserDto> {
    const responseUpload = await this.cloudinaryService.uploadImage({
      file,
      type: 'avatar',
    });
    const { url } = responseUpload;
    let user = await this.userService.findUserById(currentUserId);
    user = await this.userService.setAvatar(user, url);
    return await this.userService.buildUserResponse(user);
  }
}
