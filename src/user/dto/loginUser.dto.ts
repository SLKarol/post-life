import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'Адрес почты юзера' })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Пароль' })
  readonly password: string;
}

export class MainLoginDto {
  @ApiProperty()
  readonly user: LoginUserDto;
}
