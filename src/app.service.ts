import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';


@Injectable()
export class AppService
  implements OnApplicationShutdown, OnApplicationBootstrap {
  private readonly logger = new Logger(AppService.name);

  constructor(
  ) { }

  async onApplicationBootstrap() {
    this.logger.log('App is starting...');
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log('App is stopping...', signal);
  }
}
