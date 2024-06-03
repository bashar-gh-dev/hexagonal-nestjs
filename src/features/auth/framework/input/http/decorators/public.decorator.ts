import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<never, boolean>({
  transform: () => true,
});
