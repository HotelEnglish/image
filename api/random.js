// api/random.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  try {
    // 1. 读取 public 文件夹下的所有图片文件
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);
    
    // 2. 过滤出图片文件 (你可以根据需要调整扩展名)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    // 3. 随机选择一张图片
    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];

    // 4. 构建完整的图片URL (Vercel 会自动将 /public 映射到网站根路径)
    // 例如: https://your-deployment.vercel.app/cover1.jpg
    const imageUrl = `/${randomImage}`;

    // 5. 重定向到该图片 (这是关键！NotionNext 会直接拿到图片)
    res.redirect(302, imageUrl);

  } catch (error) {
    console.error('Error in random cover API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
