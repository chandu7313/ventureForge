import { SetMetadata } from '@nestjs/common';

export const RequiresPlan = (...plans: string[]) => SetMetadata('plan', plans);
