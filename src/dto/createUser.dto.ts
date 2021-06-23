import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Должен быть электронный адрес' })
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;
}
