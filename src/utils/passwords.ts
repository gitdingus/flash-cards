import { randomBytes, pbkdf2Sync } from 'crypto';

export function saltHash(password: string) {
  const salt = randomBytes(32).toString();
  const pwdNormalized = password.normalize();
  const hash = pbkdf2Sync(pwdNormalized, salt, 1000, 64, 'sha-512').toString();

  return { salt, hash }
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const newHash = pbkdf2Sync(password.normalize(), salt, 1000, 64, 'sha-512').toString();
  return hash === newHash;
}