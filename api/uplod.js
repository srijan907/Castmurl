import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse failed' });

    const file = files.file?.[0];
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', fs.createReadStream(file.filepath));

    try {
      const catboxRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData
      });

      const url = await catboxRes.text();
      const fileId = url.split('/').pop();
      const myUrl = `https://castmurl.vercel.app/f/${fileId}`;

      res.status(200).json({
        status: true,
        uploader: "MR RABBIT",
        original: file.originalFilename,
        url: myUrl
      });
    } catch (e) {
      res.status(500).json({ error: 'Upload failed' });
    }
  });
}
