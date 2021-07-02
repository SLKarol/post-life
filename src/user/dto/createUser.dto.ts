import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Имя/логин пользователя' })
  readonly username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Должен быть электронный адрес' })
  @ApiProperty({ example: 'user@domain.com' })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @ApiProperty({ description: 'О себе' })
  bio: string;

  @ApiProperty({ description: 'Аватарка.', type: 'string', format: 'binary' })
  image: any;
}

export class MainCreateUserDto {
  @ApiProperty({ description: 'Описание' })
  readonly user: CreateUserDto;
}
