const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method allowed" });
  }

  const busboy = require("busboy");
  const bb = busboy({ headers: req.headers });

  let fileBuffer = Buffer.alloc(0);
  let fileName = "file.jpg";

  bb.on("file", (fieldname, file, info) => {
    fileName = info.filename || fileName;
    file.on("data", (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });
  });

  bb.on("finish", async () => {
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, fileName);

    try {
      const response = await axios.post("https://catbox.moe/user/api.php", formData, {
        headers: formData.getHeaders(),
      });

      const fileUrl = response.data.trim();
      const fileId = fileUrl.split("/").pop();

      const base = "https://castmurl.vercel.app/f/";
      res.status(200).json({
        creator: "MR RABBIT",
        original: fileUrl,
        short_link: `${base}${fileId}`,
        status: "success"
      });
    } catch (err) {
      res.status(500).json({ error: "Upload failed", detail: err.message });
    }
  });

  req.pipe(bb);
};
