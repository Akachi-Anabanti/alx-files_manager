// File controller
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import { getTokenUserId } from '../utils/auth';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

export default class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-TOKEN');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await getTokenUserId(token);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      type,
      parentId = 0,
      isPublic = false,
      data,
    } = req.body;

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
      const filesCollection = await dbClient.filesCollection();
      const parentFile = await filesCollection.findOne({ _id: ObjectId(parentId) });
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
    const filesCollection = await dbClient.filesCollection();
    const result = await filesCollection.insertOne(fileDocument);
    const file = result.ops[0];

    return res.status(201).json(file);
  }

  static async getShow(req, res) {
    const token = req.header('X-TOKEN');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await getTokenUserId(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await dbClient.filesCollection().findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.header('X-TOKEN');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await getTokenUserId(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const parentId = req.query.parentId || '0';
    const page = Number(res.query.page) || 0;
    const pageSize = 20;

    const files = await dbClient.filesCollection().aggregate([{
      $match: {
        userId: ObjectId(userId),
        parentId: parentId === '0' ? 0 : ObjectId(parentId),
      },
    }, { $skip: page * pageSize }, { $limit: pageSize },
    ]).toArray();

    return res.status(200).json(files);
  }
}
