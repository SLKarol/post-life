import { join } from 'path';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { compare } from 'bcrypt';

import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { ResponseUserDto } from './dto/resonseUser.dto';
import { ListUsersResponseDto } from './dto/listUsersResponse.dto';

import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {},
    };
    const userByEmail = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    const userByUsername = await this.userRepository.findOne({
      username: createUserDto.username,
    });

    if (userByEmail) {
      errorResponse.errors['email'] = 'has already been taken';
    }

    if (userByUsername) {
      errorResponse.errors['username'] = 'has already been taken';
    }
    if (userByEmail || userByUsername) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);
    return this.userRepository.save(newUser);
  }

  async buildUserResponse(user: UserEntity): Promise<ResponseUserDto> {
    const userReport = Object.assign({}, user);
    delete userReport.id;
    delete userReport.password;
    return {
      user: {
        ...userReport,
        token: await this.generateJwt(user),
      },
    };
  }

  private async generateJwt(user: UserEntity): Promise<string> {
    const { id } = user;
    return await this.jwtService.signAsync({ id });
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const errorResponse = {
      errors: {
        'email or password': 'is invalid',
      },
    };
    const user = await this.userRepository.findOne(
      {
        email: loginUserDto.email,
      },
      { select: ['id', 'username', 'email', 'bio', 'image', 'password'] },
    );

    if (!user) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const isPasswordCorrect = await compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    delete user.password;
    return user;
  }

  buildListUserResponse(users: UserEntity[]): ListUsersResponseDto {
    return {
      users: users.map((user) => {
        const { bio, image, username, active } = user;
        return { bio, image, username, active };
      }),
    };
  }

  async findUserById(id: string) {
    return this.userRepository.findOne({ id });
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findUserById(userId);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async sendConfirmMail(user: UserEntity) {
    const urlConfirmAddress = this.configService.get<string>(
      'URL_CONFIRM_ADDRESS',
    );
    // Отправка почты
    return await this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Подтверждение регистрации',
        template: join(__dirname, '/../templates', 'confirmReg'),
        context: {
          id: user.id,
          username: user.username,
          urlConfirmAddress,
        },
      })
      .catch((e) => {
        throw new HttpException(
          `Ошибка работы почты: ${JSON.stringify(e)}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      });
  }

  async setConfirmMail(userId: string) {
    const user = await this.findUserById(userId);
    user.active = true;
    return await this.userRepository.save(user);
  }
}
