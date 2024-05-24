import { randomBytes, pbkdf2Sync } from 'crypto';

export function saltHash(password: string) {
  const salt = randomBytes(32);
  const pwdNormalized = password.normalize();
  const hash = pbkdf2Sync(pwdNormalized, salt, 1000, 64, 'sha-512');

  return { salt: salt.toString(), hash: hash.toString() }
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const newHash = pbkdf2Sync(password.normalize(), salt, 1000, 64, 'sha-512').toString();

  return hash === newHash;
}