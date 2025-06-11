

import formidable from 'formidable';
import fs from 'fs';
import { customAlphabet } from 'nanoid';
import axios from 'axios';
import { storeFile } from '@/utils/store';

export const config = {
  api: {
    bodyParser: false,
  },
};

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6);
const CATBOX_API = 'https://catbox.moe/user/api.php';
const EXPIRY_MAP = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
  'unlimited': null,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const form = formidable();
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const file = files.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileStream = fs.createReadStream(file.filepath);
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', fileStream, file.originalFilename);

  const catboxRes = await axios.post(CATBOX_API, formData, {
    headers: formData.getHeaders(),
  });

  const catboxUrl = catboxRes.data;
  const filename = file.originalFilename.split('.').pop();
  const links = {};

  for (const key of Object.keys(EXPIRY_MAP)) {
    const id = `${nanoid()}_${key}`;
    const shortUrl = `https://castmurl.vercel.app/f/${id}.${filename}`;
    links[key] = shortUrl;

    storeFile(id, {
      original: catboxUrl,
      expires: EXPIRY_MAP[key] ? Date.now() + EXPIRY_MAP[key] : null,
    });
  }

  return res.status(200).json({
    status: true,
    creator: 'MR RABBIT',
    original_name: file.originalFilename,
    mimetype: file.mimetype,
    links,
  });
}
