import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [],
        logging: true,
        synchronize: configService.get<boolean>('TYPEORM_SYNCHRONIZE'),
        // autoLoadEntities: true,
        keepConnectionAlive: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
