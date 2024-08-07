// auth utils
import redisClient from './redis';
import { v4 as uuidv4 } from 'uuid';


export function verifyPassword(inputPassword, storedHash){
  return sha1(inputPassword) === storedHash;
}

export function generateToken() {
  return uuidv4();
}

export async function setTokenWithExpiration(token, userId) {
  const key = `auth_${token}`;
  const expiration = 24 * 60 * 60; //24hrs in seconds
  return await redisClient.set(key, userId, expiration);
}

export async function getTokenUserId(token) {
  const key = `auth_${token}`;
  return await redisClient.get(key);
}

export async function removeToken(token) {
  const key = `auth_${token}`;
  return await redisClient.del(key);
}

export function extractCredentialsBasic(authHeader) {
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');
    return [email, password]
  } else {
    return [null, null]
  }
}
