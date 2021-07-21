import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Имя/логин пользователя' })
  @IsString({ message: 'Это же строка должна быть' })
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

export class MainUserDto {
  @ApiProperty()
  readonly user: UserDto;
}
