import * as fs from 'fs';
import * as path from 'path';

const GALLERY_DIR = path.join(process.cwd(), 'apps', 'docs', 'public', 'Gallery');
const OUTPUT_FILE = path.join(GALLERY_DIR, 'gallery.json');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.bmp']);

function generateGalleryJson() {
  try {
    if (!fs.existsSync(GALLERY_DIR)) {
      console.error(`Gallery directory does not exist: ${GALLERY_DIR}`);
      process.exit(1);
    }

    const files = fs.readdirSync(GALLERY_DIR);
    
    // 过滤出图片文件
    const imageFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return IMAGE_EXTENSIONS.has(ext);
      })
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`Found ${imageFiles.length} images in Gallery folder.`);

    // 写入 JSON 文件
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(imageFiles, null, 2), 'utf-8');
    console.log(`Successfully generated gallery index at: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('Failed to generate gallery JSON:', error);
    process.exit(1);
  }
}

generateGalleryJson();
