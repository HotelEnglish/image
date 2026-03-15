// api/random.js (适用于 Pages Router) 
// 如果是 App Router (route.js), 请看下方的备注

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// 【关键修改】：手动列出 public 目录下的图片文件名
// 请将这里的文件名替换为你实际上传到 public 文件夹的文件名！
// 例如：['cover1.jpg', 'photo2.png', 'bg3.jpeg']
const IMAGE_FILES = [
  // 👇👇👇 在这里填入你的图片文件名 (只需文件名，不需要路径) 👇👇👇
'public10020.jpeg',
'public10176.jpg', 
'public10186.jpeg',
'public10198.jpeg',
'public10199.jpeg',
'public10203.jpg', 
'public10212.jpeg',
'public10214.jpeg',
'public10221.jpeg',
'public10288.jpeg',
'public10289.jpeg',
'public10302.jpeg',
'public10307.jpeg',
'public10311.jpg', 
'public10312.jpeg',
'public10313.jpeg',
'public10339.jpeg',
'public10348.jpeg',
'public10366.jpeg',
'public10373.jpeg',
'public10397.jpeg',
'public10398.jpeg',
'public10400.jpeg'
  // 👆👆👆 确保最后一个文件名后面没有逗号 👆👆👆
];

export default function handler(req, res) {
  // 1. 检查是否有图片
  if (!images || images.length === 0) {
    return res.status(404).json({ error: 'No images configured.' });
  }

  // 2. 随机选择一个
  const randomIndex = Math.floor(Math.random() * images.length);
  const imageName = images[randomIndex];

  // 3. 设置响应头：禁止缓存 (关键！否则总是显示同一张)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // 4. 设置 CORS (可选，防止跨域问题)
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 5. 执行重定向
  // Vercel 会自动把 public/image.jpg 映射到 /image.jpg
  const imageUrl = `/${imageName}`;
  
  console.log(`Redirecting to: ${imageUrl}`);
  return res.redirect(302, imageUrl);
}
