export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), {
      status: 400,
    });
  }

  const boundary = contentType.split('boundary=')[1];
  const body = await req.arrayBuffer();
  const buffer = Buffer.from(body);

  const parts = buffer.toString().split(boundary);
  const filePart = parts.find(p => p.includes('filename='));
  const match = filePart?.match(/filename="(.+?)"/);
  if (!filePart || !match) {
    return new Response(JSON.stringify({ error: 'No file found' }), {
      status: 400,
    });
  }

  const filename = match[1];
  const fileExt = filename.slice(filename.lastIndexOf('.'));
  const contentStart = filePart.indexOf('\r\n\r\n') + 4;
  const contentEnd = filePart.lastIndexOf('\r\n--');
  const fileContent = filePart.slice(contentStart, contentEnd);

  const blob = new Blob([Buffer.from(fileContent)], { type: 'application/octet-stream' });

  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', blob, filename);

  const catbox = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: formData,
  });

  const link = await catbox.text();
  const fileId = Math.random().toString(36).substring(2, 10);
  const fileLinks = {
    '24h': `https://yourdomain.com/f/${fileId}_24h${fileExt}`,
    '7d': `https://yourdomain.com/f/${fileId}_7d${fileExt}`,
    '1m': `https://yourdomain.com/f/${fileId}_1m${fileExt}`,
    'unlimited': `https://yourdomain.com/f/${fileId}_unlimited${fileExt}`,
  };

  return new Response(
    JSON.stringify({
      status: true,
      creator: 'MR RABBIT',
      file_links: fileLinks,
      original: link,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
