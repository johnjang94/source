import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyOptions,
} from 'jose';
import type { Request } from 'express';

type AuthedUser = { id: string; email?: string };

declare module 'http' {
  interface IncomingMessage {
    user?: AuthedUser;
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor() {
    const jwksUrl = process.env.SUPABASE_JWKS_URL;
    if (!jwksUrl) {
      throw new Error('SUPABASE_JWKS_URL is not configured');
    }
    this.jwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthedUser }>();

    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization Bearer token');
    }

    const token = auth.slice('Bearer '.length).trim();

    const options: JWTVerifyOptions = {};
    if (process.env.SUPABASE_JWT_ISSUER)
      options.issuer = process.env.SUPABASE_JWKS_URL
        ? process.env.SUPABASE_JWT_ISSUER
        : undefined;
    if (process.env.SUPABASE_JWT_AUD)
      options.audience = process.env.SUPABASE_JWT_AUD;

    try {
      const { payload } = await jwtVerify(token, this.jwks, options);

      const sub = payload.sub;
      if (typeof sub !== 'string' || !sub) {
        throw new UnauthorizedException('Invalid token (missing sub)');
      }

      const emailUnknown: unknown = (
        payload as JWTPayload & { email?: unknown }
      ).email;

      req.user = {
        id: sub,
        email: typeof emailUnknown === 'string' ? emailUnknown : undefined,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
