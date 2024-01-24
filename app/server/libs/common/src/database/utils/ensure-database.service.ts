// ensure-database.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pg from 'pg';

@Injectable()
export class EnsureDatabaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const client = new pg.Client({
      user: this.configService.get('POSTGRES_USER'),
      host: this.configService.get('POSTGRES_HOST'),
      database: 'postgres',
      password: this.configService.get('POSTGRES_PASSWORD'),
    });

    await client.connect();

    const dbName = this.configService.get('POSTGRES_DB');
    const dbExists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );
    if (dbExists.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
    }

    await client.end();
  }
}
