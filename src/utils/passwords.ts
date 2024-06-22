import { randomBytes, pbkdf2Sync } from 'crypto';

export function saltHash(password: string) {
  const normalizedPwd = password.normalize();
  const salt = randomBytes(32).toString('hex');
  const hash = pbkdf2Sync(normalizedPwd, salt, 1000, 64, 'sha-512').toString('hex');

  return { salt, hash }
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const normalizedPwd = password.normalize();
  const newHash = pbkdf2Sync(normalizedPwd, salt, 1000, 64, 'sha-512').toString('hex');
  return hash === newHash;
}