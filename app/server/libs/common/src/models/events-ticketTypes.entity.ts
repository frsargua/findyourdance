import { Entity, Index, Column, Check, ManyToOne, OneToMany } from 'typeorm';
import {
  AbstractEntity,
  Event,
  SalesStrategyEnum,
  TicketPricingPhase,
} from '@app/common';

@Entity()
@Index(['event', 'name'], { unique: true })
@Check(`"saleEndDate" > "saleStartDate"`)
@Check(`"capacity" >= "sold"`)
@Check(`"maxPerCustomer" <= "capacity"`)
@Check(`"saleEndDate" > CURRENT_TIMESTAMP`)
@Check(`"saleStartDate" >= CURRENT_TIMESTAMP`)
export class TicketType extends AbstractEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: false, length: 2000 })
  description: string;

  @Column({ type: 'timestamp', nullable: false })
  saleStartDate: Date;

  @Column({ type: 'timestamp', nullable: false })
  saleEndDate: Date;

  @Column({ type: 'integer', default: 0 })
  @Check('capacity >= 0')
  capacity: number;

  @Column({ type: 'integer', default: 0 })
  @Check('sold >= 0')
  sold: number;

  @Column({
    type: 'enum',
    enum: SalesStrategyEnum,
    default: SalesStrategyEnum.FCFS,
    nullable: false,
  })
  salesStrategy: SalesStrategyEnum;

  @Column({ type: 'boolean', default: false, nullable: false })
  allowWaitList: boolean;

  @ManyToOne(() => Event, (event) => event.ticketTypes, { nullable: false })
  event: Event;

  @OneToMany(
    () => TicketPricingPhase,
    (priceChange) => priceChange.ticketType,
    { nullable: false }
  )
  pricingPhases: TicketPricingPhase[];

  @Column({ type: 'int', nullable: true })
  @Check('validForDays IS NULL OR validForDays > 0 or validForDays < 1000')
  validForDays?: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;

  @Column({ type: 'int', default: 10 })
  @Check('maxPerCustomer > 0 AND maxPerCustomer <= capacity')
  maxPerCustomer: number;

  @Column({ type: 'boolean', default: false, nullable: false })
  ageRestriction: boolean;
}
