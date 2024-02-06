import { Entity, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { GenericAddress } from './generic-address.entity';

@Entity()
export class AddressUser extends GenericAddress {
  @OneToMany(() => User, (user) => user.userAddress)
  users: User[];
}
