export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const boundary = req.headers['content-type'].split('boundary=')[1];
  const chunks = [];

  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  // Extract file content from multipart form
  const match = buffer.toString().match(/filename="(.+?)"\r\nContent-Type: (.+?)\r\n\r\n([\s\S]+?)\r\n--/);
  if (!match) return res.status(400).json({ error: "File parse failed" });

  const filename = match[1];
  const contentType = match[2];
  const fileData = buffer.slice(buffer.indexOf(match[3]));

  const blob = new Blob([fileData], { type: contentType });
  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, filename);

  try {
    const catboxRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    const url = await catboxRes.text();
    const fileId = url.trim().split("/").pop();
    const customLink = `https://castmurl.vercel.app/f/${fileId}`;

    res.status(200).json({
      status: true,
      uploader: "MR RABBIT",
      original: filename,
      url: customLink,
    });
  } catch (e) {
    res.status(500).json({ error: "Upload failed" });
  }
}
