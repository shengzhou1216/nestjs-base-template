import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as winston from 'winston';

import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { AuthModule } from '@app/auth/auth.module';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CacheModule } from '@app/cache/cache.module';
import { CommonModule } from '@app/common/common.module';
import configuration, { validationSchema } from '@app/config/configuration';
import DbConfig from '@app/config/db.config';
import LoggerConfig from '@app/config/logger.config';
import SystemConfig from '@app/config/system.config';
import { CoreModule } from '@app/core/core.module';
import { AllExceptionsFilter } from '@app/core/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '@app/core/filters/http-exception.filter';
import { LoggingInterceptor } from '@app/core/interceptors/logging.interceptor';
import { ResponseInterceptor } from '@app/core/interceptors/response.interceptor';
import { UsersModule } from '@app/users/users.module';
import * as mysql from 'mysql2/promise';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const pid = process.pid;
        const systemConfig = configService.get<SystemConfig>('system');
        const loggerConfig = configService.get<LoggerConfig>('logger');
        return {
          level: 'verbose',
          format: winston.format.combine(
            winston.format.timestamp({
              format: loggerConfig.format || 'YYYY/MM/DD HH:mm:ss',
            }),
            winston.format.ms(),
            winston.format.colorize({
              all: true,
            }),
            winston.format.label({
              label: `[${systemConfig.name}]`,
            }),
            winston.format.printf(
              ({ label, level, message, timestamp, ms, context }) => {
                return `${label} ${pid} - ${timestamp} ${level} [${context}] ${message} ${ms}`;
              },
            ),
          ),
          transports: [
            new winston.transports.Console({
              level: 'verbose',
            }),
            new winston.transports.File({
              level: loggerConfig.level || 'info',
              filename: loggerConfig.file || 'logs/combined.log',
            }),
          ],
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<DbConfig>('db').mysql;
        // create database if not exists
        const connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
        });
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
        await connection.end();

        return {
          type: 'mysql',
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          autoLoadEntities: true,
          synchronize: true, //fixme: Don't use this in production, otherwise you can lose data
          logging: true,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
    }),
    CoreModule,
    CommonModule,
    AuthModule,
    UsersModule,
    ConfigModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
