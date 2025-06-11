// pages/f/[id].js

import { getFile } from '@/utils/store';

export default async function handler(req, res) {
  const { id } = req.query;
  const cleanId = id.split('.')[0];
  const fileData = getFile(cleanId);

  if (!fileData) {
    return res.status(404).send('🔗 Link expired or not found');
  }

  if (fileData.expires && Date.now() > fileData.expires) {
    return res.status(410).send('🕒 This link has expired');
  }

  return res.redirect(fileData.original);
}
