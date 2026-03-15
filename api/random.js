// api/random.js

export default async function handler(req, res) {
  // ================= 配置区域 =================
  const owner = 'HotelEnglish';
  const repo = 'image';
  const path = 'public';
  const branch = 'main';
  // ===========================================

  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const apiPath = path ? path : '';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${apiPath}`;

  try {
    // 1. 获取文件列表 (这部分可以适当缓存，因为文件列表不会每秒变)
    // 但为了简单和确保最新，我们每次都请求 GitHub API
    const apiResponse = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Vercel-Image-Randomizer-Bot' },
      signal: AbortSignal.timeout(5000)
    });

    if (!apiResponse.ok) {
      if (apiResponse.status === 403) return res.status(503).json({ error: 'GitHub API Rate Limit Exceeded' });
      return res.status(apiResponse.status).json({ error: 'Failed to fetch file list' });
    }

    const files = await apiResponse.json();
    const images = files
      .filter(f => f.type === 'file' && exts.some(ext => f.name.toLowerCase().endsWith(ext)))
      .map(f => f.name);

    if (images.length === 0) return res.status(404).json({ error: 'No images found' });

    // 2. 随机选择
    const randomIndex = Math.floor(Math.random() * images.length);
    const imageName = images[randomIndex];
    const filePath = path ? `${path}/${imageName}` : imageName;
    const rawImageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

    // 3. 获取图片内容
    const imageResponse = await fetch(rawImageUrl, {
      signal: AbortSignal.timeout(10000)
    });

    if (!imageResponse.ok) return res.status(502).json({ error: 'Failed to download image' });

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 4. 【关键修改】设置响应头
    res.setHeader('Content-Type', contentType);
    
    // 👇👇👇 核心修改在这里 👇👇👇
    // 禁止 CDN 和浏览器缓存这个 API 的“随机结果”
    // 这样每次请求 /api/random 都会重新执行上面的随机逻辑
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 可选：如果你希望图片本身在浏览器里缓存一会儿（防止用户连续刷新时闪烁），
    // 但由于这是动态生成的流，通常建议完全不留存，或者由前端控制缓存。
    // 这里我们选择完全不留存 API 响应，确保每次都是新的。

    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);

  } catch (error) {
    console.error('Error:', error);
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return res.status(504).json({ error: 'Gateway Timeout' });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
