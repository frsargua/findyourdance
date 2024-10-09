import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common';
import { BaseInterfaceRepository } from '../interfaces/base.interfaces';
import { Logger } from 'nestjs-pino';

interface HasId {
  id: string;
}

interface MyFindOptions<T> extends FindOneOptions<T> {
  where: FindOptionsWhere<T>;
  relations?: string[];
}

export abstract class BaseAbstractRepostitory<T extends HasId>
  implements BaseInterfaceRepository<T>
{
  // protected abstract readonly logger: LoggerService;
  // private entity: Repository<T>;
  // protected constructor(
  //   @Inject(Logger) logger: LoggerService,
  //   entity: Repository<T>
  // ) {
  //   this.entity = entity;
  // }

  protected constructor(
    protected readonly logger: Logger,
    protected readonly entity: Repository<T>
  ) {}

  public async save(data: DeepPartial<T>): Promise<T> {
    try {
      return await this.entity.save(data);
    } catch (error) {
      this.logger.error(
        `Error saving entity: ${JSON.stringify(data)}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to save the entity', {
        cause: error,
      });
    }
  }

  public async saveMany(data: DeepPartial<T>[]): Promise<T[]> {
    try {
      return await this.entity.save(data);
    } catch (error) {
      this.logger.error('Error saving entities', error.stack);
      throw new InternalServerErrorException('Failed to save the entities', {
        cause: error,
      });
    }
  }

  public create(data: DeepPartial<T>): T {
    return this.entity.create(data);
  }

  public createMany(data: DeepPartial<T>[]): T[] {
    return this.entity.create(data);
  }

  public async findOneById(
    id: string,
    relations: string[] = []
  ): Promise<T | null> {
    try {
      const options: MyFindOptions<T> = {
        where: { id: id } as FindOptionsWhere<T>,
        relations: relations,
      };
      const result = await this.entity.findOne(options);

      if (!result) {
        this.logger.log(`Entity with id ${id} not found`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error finding entity by ID: ${id}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to find entity with id ${id}`,
        { cause: error }
      );
    }
  }

  public async findByCondition(
    filterCondition: FindOneOptions<T>
  ): Promise<T | null> {
    try {
      const result = await this.entity.findOne(filterCondition);

      if (!result) {
        this.logger.debug(
          `Entity not found with condition: ${JSON.stringify(filterCondition)}`
        );
      }

      return result;
    } catch (error) {
      this.logger.error('Error finding entity by condition', error.stack);
      throw new InternalServerErrorException(
        'Failed to find entity by condition',
        { cause: error }
      );
    }
  }

  public async findWithRelations(relations: FindManyOptions<T>): Promise<T[]> {
    try {
      const result = await this.entity.find(relations);
      if (result.length === 0) {
        this.logger.debug('No entities found with given relations', relations);
      }
      return result;
    } catch (error) {
      this.logger.error('Error finding entities with relations', error.stack);
      throw new InternalServerErrorException(
        'Failed to find entities with relations',
        { cause: error }
      );
    }
  }

  public async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    try {
      const result = await this.entity.find(options);
      if (result.length === 0) {
        this.logger.debug('No entities found', options);
      }
      return result;
    } catch (error) {
      this.logger.error('Error finding all entities', error.stack);
      throw new InternalServerErrorException('Failed to find entities', {
        cause: error,
      });
    }
  }

  public async remove(data: T): Promise<T> {
    try {
      return await this.entity.remove(data);
    } catch (error) {
      this.logger.error(`Error removing entity: ${data.id}`, error.stack);
      throw new InternalServerErrorException(
        `Failed to remove entity with id ${data.id}`,
        { cause: error }
      );
    }
  }

  public async removeAll(data: T[]): Promise<T[]> {
    try {
      return await this.entity.remove(data);
    } catch (error) {
      this.logger.error('Error removing all entities', error.stack);
      throw new InternalServerErrorException('Failed to remove entities', {
        cause: error,
      });
    }
  }

  public async preload(entityLike: DeepPartial<T>): Promise<T | null> {
    try {
      const result = await this.entity.preload(entityLike);
      if (!result) {
        this.logger.debug(
          `Entity not found for preload: ${JSON.stringify(entityLike)}`
        );
        return null;
      }

      return result;
    } catch (error) {
      this.logger.error('Error preloading entity', error.stack);
      throw new InternalServerErrorException('Failed to preload entity', {
        cause: error,
      });
    }
  }

  public async findOne(options: FindOneOptions<T>): Promise<T | null> {
    try {
      const result = await this.entity.findOne(options);
      if (!result) {
        this.logger.log(
          `Entity not found with options: ${JSON.stringify(options)}`
        );
      }
      return result;
    } catch (error) {
      this.logger.error('Error finding entity', error.stack);
      throw new InternalServerErrorException('Failed to find entity', {
        cause: error,
      });
    }
  }

  public async getEntity() {
    return this.entity;
  }

  public async queryWithQueryBuilder(
    queryCallback: (queryBuilder: any) => any
  ): Promise<T[]> {
    try {
      const queryBuilder = this.entity.createQueryBuilder();
      queryCallback(queryBuilder);
      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.log('Error executing query with query builder', error);
      throw new InternalServerErrorException('Failed to execute query');
    }
  }
}
