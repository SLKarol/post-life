import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { hash, genSalt } from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Ник или ФИО или псеводим' })
  username: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Настоящий адрес эл. почты' })
  email: string;

  @Column()
  @ApiProperty({ description: 'Пароль' })
  password: string;

  @Column({ default: '' })
  @ApiProperty()
  bio: string;

  @Column({ default: '' })
  @ApiProperty()
  image: string;

  @Column({ default: false })
  @ApiProperty({ default: false, description: 'Активирована учётка?' })
  active: boolean;

  @BeforeInsert()
  async hashPassword() {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
  }
}
