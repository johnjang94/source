import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx
      .switchToHttp()
      .getRequest<{ user?: { id: string; email?: string } }>();
    return req.user;
  },
);
