import {
  Controller,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BaseController } from '@app/common/controller/base.controller';
import { UsersService } from '@app/users/users.service';

/**
 * Users controller
 */
@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly service: UsersService) {
    super();
  }
}
