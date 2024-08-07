const { ObjectId } = require('mongodb');
import sha1 from 'sha1';
import dbClient from '../utils/db';
import { getTokenUserId } from '../utils/auth';

export default class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = await dbClient.usersCollection();

    let user = await usersCollection.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }
    user = await usersCollection.insertOne({
      email,
      password: sha1(password),
    });

    return res.status(201).json({
      email,
      id: user.insertedId,
    });
  }

  static async getMe(req, res) {
    const token = req.header('X-TOKEN');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await getTokenUserId(token);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const usersCollection = await dbClient.usersCollection();
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if(!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({
      email: user.email,
      id: user._id.toString()
    });
  }
}
