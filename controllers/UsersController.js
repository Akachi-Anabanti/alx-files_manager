import dbClient from '../utils/db';
import sha1 from 'sha1';

export default class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({error: "Missing email"});
    }

    if (!password) {
      res.status(400).json({error: "Missing password"});
    }

    let user = await dbClient.db.collection("users").findOne({ email: email });

    if (user) {
      res.status(400).json({error: "Already exist"});
    }
    user = await dbClient.db.collections("users").insertOne({
      email: email,
      password: sha1(password),
    });
    
    res.status(201).json({email: email, id: user._id});
  }
}
