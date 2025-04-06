import { BaseController } from '@app/common/controller/base.controller';
import {
  Controller,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@app/auth/decorators/public.decorator';

/**
 * Auth controller
 */
@Controller('auth')
@ApiTags('auth')
export class AuthController extends BaseController {

  @Public()
  @Post()
  async login() {
    return 'ok'
  }
}
