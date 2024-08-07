//authorization config
import sha1 from 'sha1'
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import {
  extractCredentialsBasic,
  generateToken,
  setTokenWithExpiration,
  getTokenUserId,
  removeToken
} from '../utils/auth'


export default class AuthController {
  static async getConnect(req, res){
    const authHeader = req.headers.authorization;

    const [email, password] = extractCredentialsBasic(authHeader);

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
 
    const usersCollection = await dbClient.usersCollection();
    const user = await usersCollection.findOne({
      email,
      password: sha1(password),
    });

    if (!user) {
      console.log('I am here!')
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = generateToken();
    await setTokenWithExpiration(token, user._id.toString());

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token  = req.header('X-TOKEN');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await getTokenUserId(token);

    if (!userId){
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await removeToken(token);

    return res.status(204)
  }
}
