import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';

export interface BaseInterfaceRepository<T> {
  create(data: DeepPartial<T>): T;
  createMany(data: DeepPartial<T>[]): T[];
  save(data: DeepPartial<T>): Promise<T>;
  // saveMany(data: DeepPartial<T>[]): Promise<T[]>; not really needed
  findOneById(id: string): Promise<T | null>;
  findByCondition(filterCondition: FindOneOptions<T>): Promise<T | null>;
  findAll(options?: FindManyOptions<T>): Promise<T[]>;
  remove(data: T): Promise<T>;
  findWithRelations(relations: FindManyOptions<T>): Promise<T[]>;
  preload(entityLike: DeepPartial<T>): Promise<T | null>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  queryWithQueryBuilder(
    queryCallback: (queryBuilder: any) => any
  ): Promise<T[]>;
}
