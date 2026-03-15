// api/random.js (适用于 Pages Router) 
// 如果是 App Router (route.js), 请看下方的备注

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 【关键修改】：手动列出 public 目录下的图片文件名
// 请将这里的文件名替换为你实际上传到 public 文件夹的文件名！
// 例如：['cover1.jpg', 'photo2.png', 'bg3.jpeg']
const IMAGE_FILES = [
  // 👇👇👇 在这里填入你的图片文件名 (只需文件名，不需要路径) 👇👇👇
  'example1.jpg', 
  'example2.png',
  'example3.jpeg'
  // 👆👆👆 记得用逗号分隔，最后一个后面不要逗号 👆👆👆
];

export default async function handler(req, res) {
  // 设置 CORS 头 (可选，但推荐)
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 设置禁止缓存头 (确保每次都是随机的)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    if (IMAGE_FILES.length === 0) {
      console.error('Error: No images configured in IMAGE_FILES array.');
      return res.status(404).json({ error: 'No images found. Please update the code with your image filenames.' });
    }

    // 随机选择一个索引
    const randomIndex = Math.floor(Math.random() * IMAGE_FILES.length);
    const selectedImage = IMAGE_FILES[randomIndex];

    // 构建重定向 URL
    // Vercel 会自动将 public 目录映射到根路径
    const imageUrl = `/${selectedImage}`;

    console.log(`Redirecting to: ${imageUrl}`);
    
    // 执行 302 重定向
    return res.redirect(302, imageUrl);

  } catch (error) {
    console.error('Critical Error in random API:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
