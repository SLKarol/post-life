import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@Entity({ name: 'tags' })
export class TagEntity {
  @IsNotEmpty()
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @ApiProperty()
  @Column({ unique: true })
  name: string;
}
