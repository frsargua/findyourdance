import { Column, ColumnOptions } from 'typeorm';
import { IsNotEmpty, IsDate } from 'class-validator';

export function TimestampColumn(options?: ColumnOptions): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    Column({
      type: 'timestamp',
      nullable: false,
      ...options,
    })(target, propertyKey);
    IsNotEmpty({
      message: `${String(propertyKey)} is not allowed to be empty`,
    })(target, propertyKey);
    IsDate()(target, propertyKey);
  };
}
