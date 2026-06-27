import { buildRegistry } from './build-registry.ts';
import { generateGalleryJson } from './generate-gallery-json.ts';
import { generateSkills } from './generate-skills.ts';

async function main() {
  await Promise.all([buildRegistry(), generateGalleryJson(), generateSkills()]);
}

await main().catch((e) => {
  console.error('Failed to run pre build script', e);
  process.exit(1);
});

