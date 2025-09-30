import { randomUUID } from 'crypto';

export function generateUniqueId(): string {
  return 'clx' + randomUUID().replace(/-/g, '');
}