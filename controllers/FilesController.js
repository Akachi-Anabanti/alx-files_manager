// File controller
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import { getTokenUserId } from '../utils/auth';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-TOKEN');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await getTokenUserId();

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!data && type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== 0) {
      const parentFile = await dbClient.filesCollection().findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDocument = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : ObjectId(parentId),
    };

    if (type !== 'folder') {
      const fileUuid = uuidv4();
      const localPath = path.join(FOLDER_PATH, fileUuid);

      await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

      await fs.promises.writeFile(localPath, Buffer.from(data, 'base64'));

      fileDocument.localPath = localPath;
    }

    const result = await dbClient.filesCollection().insertOne(fileDocument);
    const file = result.ops[0];

    return res.status(201).json(file);
  }
}
