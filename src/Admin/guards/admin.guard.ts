import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const raw = process.env.ADMIN_USER_UUIDS ?? '';
    const allowed = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (allowed.length === 0 && process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Admin access is not configured');
    }

    if (allowed.length === 0) {
      return true;
    }

    const uuid = request.user?.user_uuid as string | undefined;
    if (!uuid || !allowed.includes(uuid)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
