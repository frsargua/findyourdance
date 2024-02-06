import { AbstractEntity, AddressUser } from '@app/common';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column()
  email: string;

  @Column()
  password: string;

  @ManyToOne(() => AddressUser, (address) => address.users)
  userAddress: AddressUser;
}
