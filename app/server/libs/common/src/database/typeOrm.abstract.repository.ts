import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { BaseInterfaceRepository } from './base.interfaces';

interface HasId {
  id: string;
}

export abstract class BaseAbstractRepostitory<T extends HasId>
  implements BaseInterfaceRepository<T>
{
  protected abstract readonly logger: Logger;
  private entity: Repository<T>;
  protected constructor(entity: Repository<T>) {
    this.entity = entity;
  }

  public async save(data: DeepPartial<T>): Promise<T> {
    return await this.entity.save(data);
  }

  public async saveMany(data: DeepPartial<T>[]): Promise<T[]> {
    return this.entity.save(data);
  }

  public create(data: DeepPartial<T>): T {
    return this.entity.create(data);
  }

  public createMany(data: DeepPartial<T>[]): T[] {
    return this.entity.create(data);
  }

  public async findOneById(id: any): Promise<T> {
    const options: FindOptionsWhere<T> = {
      id: id,
    };
    return this.handleNotFound(
      await this.entity.findOneBy(options),
      'Document was not found',
      options
    );
  }

  public async findByCondition(filterCondition: FindOneOptions<T>): Promise<T> {
    return this.handleNotFound(
      await this.entity.findOne(filterCondition),
      'Document was not found',
      filterCondition
    );
  }

  public async findWithRelations(relations: FindManyOptions<T>): Promise<T[]> {
    return await this.entity.find(relations);
  }

  public async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.entity.find(options);
  }

  public async remove(data: T): Promise<T> {
    return await this.entity.remove(data);
  }

  public async preload(entityLike: DeepPartial<T>): Promise<T> {
    return this.handleNotFound(
      await this.entity.preload(entityLike),
      'Document was not found',
      entityLike
    );
  }

  public async findOne(options: FindOneOptions<T>): Promise<T> {
    return this.handleNotFound(
      await this.entity.findOne(options),
      'Document was not found',
      options
    );
  }

  private async handleNotFound(
    document: T | null | undefined,
    errorMessage: string,
    options?:
      | FindOneOptions<T>
      | DeepPartial<T>
      | FindOneOptions<T>
      | FindOptionsWhere<T>
  ): Promise<T> {
    if (!document) {
      this.logger.warn('Document was not found with filter option/s', options);

      throw new Error(errorMessage);
    }
    return document;
  }
}
