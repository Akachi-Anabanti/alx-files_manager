import dbClient from '../utils/db';
import sha1 from 'sha1';

export default class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
     return res.status(400).json({ error: "Missing email" });
    }

    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }

    const usersCollection = await dbClient.usersCollection();

    let user = await usersCollection.findOne({ email: email });

    if (user) {
      return res.status(400).json({ error: "Already exist" });
    }
    user = await usersCollection.insertOne({
      email: email,
      password: sha1(password),
    });
    
    return res.status(201).json({
      email: email,
      id: user.insertedId
    });
  }
}
