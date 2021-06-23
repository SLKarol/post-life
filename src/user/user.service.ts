import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { UserResponseInterface } from './types/userResponse.interface';

import { CreateUserDto } from '@app/dto/createUser.dto';
import { LoginUserDto } from '@app/dto/loginUser.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { ListUsersResponseInterface } from './types/listUsersResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
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

  async buildUserResponse(user: UserEntity): Promise<UserResponseInterface> {
    const { id, password, ...userData } = user;
    return {
      user: {
        ...userData,
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

  buildListUserResponse(users: UserEntity[]): ListUsersResponseInterface {
    return {
      users: users.map((user) => {
        const { bio, image, username } = user;
        return { bio, image, username };
      }),
    };
  }

  async findUserById(id: string) {
    return this.userRepository.findOne({ id });
  }
}
