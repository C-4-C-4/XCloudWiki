import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as FilesComponents from 'fumadocs-ui/components/files';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';

// 引入新手教程所需的自定义交互式组件
import { ResidenceCalculator, TransferCalculator, AuctionCalculator, EnchantLottery } from './custom/calculators';
import { LitematicaConverter, LitematicaPreview, PixelArtGenerator } from './custom/litematica';
import { NpcDirectory } from './custom/npc';
import { CommandConsole } from './custom/command';
import { SkinUploader } from './custom/skin';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FilesComponents,
    Accordion,
    Accordions,
    // 注册为全局 MDX 组件
    ResidenceCalculator,
    TransferCalculator,
    AuctionCalculator,
    EnchantLottery,
    LitematicaConverter,
    LitematicaPreview,
    PixelArtGenerator,
    NpcDirectory,
    CommandConsole,
    SkinUploader,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
