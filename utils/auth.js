// auth utils
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from './redis';

export function verifyPassword(inputPassword, storedHash) {
  return sha1(inputPassword) === storedHash;
}

export function generateToken() {
  return uuidv4();
}

export async function setTokenWithExpiration(token, userId) {
  const key = `auth_${token}`;

  // 24 hours in seconds
  const expiration = 24 * 60 * 60;
  return redisClient.set(key, userId, expiration);
}

export async function getTokenUserId(token) {
  const key = `auth_${token}`;
  return redisClient.get(key);
}

export async function removeToken(token) {
  const key = `auth_${token}`;
  return redisClient.del(key);
}

export function extractCredentialsBasic(authHeader) {
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');
    return [email, password];
  }
  return [null, null];
}
