import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import JwtConfig from '@app/config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * sign jwt token
   * @param payload
   */
  sign(payload: any) {
    const config = this.configService.get<JwtConfig>('jwt');
    const access_token = this.jwtService.sign(instanceToPlain(payload), {
      secret: config.secret,
      expiresIn: config.accessExpiresIn,
    });
    return { access_token };
  }
}
