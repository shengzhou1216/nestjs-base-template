import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BaseController } from '@app/common/controller/base.controller';
import { BaseEntity } from '@app/common/entities/base.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BaseEntity])],
  controllers: [BaseController],
  providers: [],
  exports: [],
})
export class CoreModule { }
