import { UserEntity } from '../user.entity';

export interface ListUsersResponseInterface {
  users: Omit<UserEntity, 'email' | 'id' | 'password' | 'hashPassword'>[];
}
