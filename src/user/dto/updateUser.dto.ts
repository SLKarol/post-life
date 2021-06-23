import { IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'Имя/логин пользователя' })
  readonly username: string;

  @IsEmail({}, { message: 'Должен быть корректный электронный адрес' })
  @IsOptional()
  @ApiProperty({ example: 'user@domain.com' })
  readonly email: string;

  @ApiProperty()
  readonly password: string;

  @ApiProperty({ description: 'О себе' })
  bio: string;

  @ApiProperty({ description: 'Аватарка. Пока в разработке такая фича' })
  image: string;
}

export class MainUpdateUserDto {
  @ApiProperty({ description: 'Описание' })
  readonly user: UpdateUserDto;
}
