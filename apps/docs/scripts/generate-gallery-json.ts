import fs from 'node:fs';
import path from 'node:path';

const GALLERY_DIR = path.join(process.cwd(), 'public', 'Gallery');
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'gallery.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp']);

export async function generateGalleryJson() {
  console.log('Generating gallery JSON...');
  
  if (!fs.existsSync(GALLERY_DIR)) {
    console.warn(`Gallery directory does not exist at: ${GALLERY_DIR}. Creating empty list.`);
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
  }

  const files = fs.readdirSync(GALLERY_DIR);
  const images = files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    })
    .map((file) => {
      // 返回相对于 public 目录的路径，Next.js 静态资源路径
      return `/Gallery/${file}`;
    });

  // 确保 output 所在的目录存在
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(images, null, 2), 'utf-8');
  console.log(`Successfully generated gallery JSON with ${images.length} images.`);
}

// 如果是直接执行脚本则运行
if (import.meta.url.endsWith(process.argv[1])) {
  generateGalleryJson().catch((err) => {
    console.error('Error generating gallery JSON:', err);
    process.exit(1);
  });
}
