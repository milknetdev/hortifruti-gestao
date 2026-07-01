import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Tenant = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant;
    if (!tenant) return undefined;
    return data ? tenant[data] : tenant;
  },
);

// Alias for backward compatibility
export const CurrentTenant = Tenant;
