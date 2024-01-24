import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'users' })
export class User extends AbstractEntity {
  @Column()
  email: string;

  @Column()
  password: string;
}
