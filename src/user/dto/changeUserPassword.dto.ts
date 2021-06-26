import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeUserPasswordDto {
  @IsNotEmpty()
  @ApiProperty({ description: 'Новый пароль пользователя' })
  readonly password: string;
}
export class MainChangeUserPassportDto {
  @ApiProperty({ description: 'Описание' })
  readonly user: ChangeUserPasswordDto;
}
