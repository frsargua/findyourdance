import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '../database';

@Entity()
export class GenericAddress extends AbstractEntity {
  @Column({ nullable: true })
  buildingNumber: string;

  @Column()
  line1: string;

  @Column({ nullable: true })
  line2: string;

  @Column()
  street: string;

  @Column()
  town: string;

  @Column({ nullable: true })
  county: string;

  @Column({ nullable: true })
  uniqueDeliveryPointRef: string;

  @Column()
  postCode: string;

  @Column('double precision')
  latitude: number;

  @Column('double precision')
  longitude: number;
}
