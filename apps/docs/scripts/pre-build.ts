import { buildRegistry } from './build-registry.ts';
import { generateGalleryJson } from './generate-gallery-json.ts';

async function main() {
  await Promise.all([buildRegistry(), generateGalleryJson()]);
}

await main().catch((e) => {
  console.error('Failed to run pre build script', e);
  process.exit(1);
});

