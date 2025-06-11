import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) return res.status(400).json({ error: "File upload failed" });

    const file = files.file;
    const ext = file.originalFilename.split(".").pop();
    const stream = fs.createReadStream(file.filepath);
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", stream, file.originalFilename);

    try {
      const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData,
      });

      const catboxUrl = await response.text();
      const fileId = catboxUrl.split("/").pop(); // abc123.jpg
      const shortLink = `https://castmurl.vercel.app/f/${fileId}`;

      return res.status(200).json({
        creator: "MR RABBIT",
        short_link: shortLink,
        status: "success",
      });
    } catch (e) {
      return res.status(500).json({ error: "Upload failed", details: e.message });
    }
  });
};

export default handler;
