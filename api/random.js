// api/random.js

// 【关键】统一使用小写变量名 'images'
const images = [
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
];

export default function handler(req, res) {
  try {
    // 1. 检查是否有图片 (现在变量名匹配了)
    if (!images || images.length === 0) {
      return res.status(404).json({ error: 'No images configured.' });
    }

    // 2. 随机选择一个
    const randomIndex = Math.floor(Math.random() * images.length);
    const imageName = images[randomIndex];

    // 3. 设置响应头：禁止缓存
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 4. 设置 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 5. 执行重定向
    const imageUrl = `/${imageName}`;
    
    console.log(`Redirecting to: ${imageUrl}`);
    return res.redirect(302, imageUrl);
    
  } catch (error) {
    // 捕获错误以防万一
    console.error('Random API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
