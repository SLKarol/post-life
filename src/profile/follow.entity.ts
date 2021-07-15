import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'follows' })
export class FollowEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  followerId: string;

  @ApiProperty({ nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  followingId: string;
}
