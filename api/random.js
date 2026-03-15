// api/random.js

export default async function handler(req, res) {
  // ================= 配置区域 =================
  const owner = 'HotelEnglish';   // 你的 GitHub 用户名
  const repo = 'image';           // 你的 GitHub 仓库名
  const path = 'public';                // 图片在仓库中的路径。如果在根目录留空 ''; 如果在 'images' 文件夹则填 'images'
  const branch = 'main';          // 你的默认分支名 (通常是 main 或 master)
  // ===========================================

  const exts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // 构建 GitHub API URL
  // 如果 path 为空，API 地址就是根目录；否则追加路径
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    // 1. 请求 GitHub API 获取文件列表
    const response = await fetch(apiUrl, {
      headers: {
        // 可选：添加 User-Agent 避免某些旧版 GitHub API 的警告
        'User-Agent': 'Vercel-Image-Randomizer'
      }
    });

    if (!response.ok) {
      console.error(`GitHub API Error: ${response.status} ${response.statusText}`);
      
      // 处理 403 (Forbidden) 通常是因为触发了速率限制
      if (response.status === 403) {
        return res.status(503).json({ 
          error: 'GitHub API Rate Limit Exceeded', 
          message: '请稍后再试，GitHub API 请求过于频繁。' 
        });
      }
      
      return res.status(response.status).json({ 
        error: 'Failed to fetch file list from GitHub', 
        details: await response.text() 
      });
    }

    const files = await response.json();

    // 2. 过滤出图片文件
    // 注意：GitHub API 返回的可能是文件也可能是文件夹，这里只取 file 类型
    const images = files
      .filter(f => f.type === 'file' && exts.some(ext => f.name.toLowerCase().endsWith(ext)))
      .map(f => f.name);

    if (images.length === 0) {
      return res.status(404).json({ error: 'No images found in the specified path.' });
    }

    // 3. 随机选择一张
    const randomIndex = Math.floor(Math.random() * images.length);
    const imageName = images[randomIndex];

    // 4. 构建 jsDelivr CDN 链接
    // 格式: https://cdn.jsdelivr.net/gh/USER/REPO@BRANCH/PATH/FILE
    const filePath = path ? `${path}/${imageName}` : imageName;
    const imageUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch}/${filePath}`;

    // 5. 设置响应头
    // 禁止缓存 API 本身，确保每次请求都重新随机（但图片本身会被 CDN 缓存，这是好事）
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 6. 执行重定向
    console.log(`Redirecting to: ${imageUrl} (Selected: ${imageName})`);
    return res.redirect(302, imageUrl);

  } catch (error) {
    console.error('Critical Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message 
    });
  }
}
