// api/random.js

export default async function handler(req, res) {
  // ================= 配置区域 (已填入你的真实信息) =================
  const owner = 'HotelEnglish';       // 你的 GitHub 用户名
  const repo = 'image';               // 你的 GitHub 仓库名
  const path = 'public';              // 图片在仓库中的文件夹路径 (根据你的观察，图片在 public 目录下)
  const branch = 'main';              // 你的默认分支名 (通常是 main)
  // =================================================================

  // 允许的图片扩展名
  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  // 1. 构建 GitHub API URL 获取文件列表
  // 注意：如果 path 为空字符串，URL 结尾不要多斜杠
  const apiPath = path ? path : '';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${apiPath}`;

  try {
    // 2. 请求 GitHub API
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Vercel-Image-Randomizer-Bot', // 避免被 GitHub 拒绝
        // 可选：如果未来遇到限流，可以在此处添加 Authorization: token ${process.env.GITHUB_TOKEN}
      },
      // 设置一个较短的超时，避免 API 卡死
      signal: AbortSignal.timeout(5000) 
    });

    if (!apiResponse.ok) {
      console.error(`GitHub API Error: ${apiResponse.status} ${apiResponse.statusText}`);
      if (apiResponse.status === 403) {
        return res.status(503).json({ error: 'GitHub API Rate Limit Exceeded. Please try again later.' });
      }
      return res.status(apiResponse.status).json({ error: 'Failed to fetch file list from GitHub' });
    }

    const files = await apiResponse.json();

    // 3. 过滤出有效的图片文件
    const images = files
      .filter(f => f.type === 'file' && exts.some(ext => f.name.toLowerCase().endsWith(ext)))
      .map(f => f.name);

    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found in the repository path.' });
    }

    // 4. 随机选择一张图片
    const randomIndex = Math.floor(Math.random() * images.length);
    const imageName = images[randomIndex];

    // 5. 构建 GitHub Raw 下载链接 (这是 Vercel 去取的地址，用户看不到)
    const filePath = path ? `${path}/${imageName}` : imageName;
    const rawImageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;

    // 6. 【核心步骤】Vercel 作为代理，去获取图片内容
    console.log(`Fetching image from GitHub: ${rawImageUrl}`);
    
    const imageResponse = await fetch(rawImageUrl, {
      signal: AbortSignal.timeout(10000) // 图片下载超时设为 10 秒
    });

    if (!imageResponse.ok) {
      console.error(`Failed to download image: ${imageResponse.status}`);
      return res.status(502).json({ error: 'Failed to download image from source' });
    }

    // 7. 获取图片的二进制数据 (ArrayBuffer)
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 8. 设置响应头
    // 获取原图的 Content-Type (如 image/jpeg)，如果没有则默认 image/jpeg
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    res.setHeader('Content-Type', contentType);
    
    // 设置缓存策略：
    // public: 允许 CDN 和用户浏览器缓存
    // max-age=3600: 浏览器缓存 1 小时
    // s-maxage=86400: Vercel Edge CDN 缓存 24 小时 (大幅减少回源请求)
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
    
    // 可选：设置内容长度，帮助浏览器显示进度
    res.setHeader('Content-Length', buffer.length);

    // 9. 发送图片数据给用户
    return res.send(buffer);

  } catch (error) {
    console.error('Critical Error in Random Image Handler:', error);
    
    // 区分超时错误和其他错误
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return res.status(504).json({ error: 'Gateway Timeout: Image fetch took too long.' });
    }
    
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}
