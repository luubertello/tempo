import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ES_PUBLICO } from '../../shared/presentation/publico.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(ctx: ExecutionContext) {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [ctx.getHandler(), ctx.getClass()]);
    return esPublico ? true : super.canActivate(ctx);
  }
}