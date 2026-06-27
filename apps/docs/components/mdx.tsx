import defaultMdxComponents from 'fumadocs-ui/mdx';
import * as FilesComponents from 'fumadocs-ui/components/files';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import type { MDXComponents } from 'mdx/types';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Steps, Step } from 'fumadocs-ui/components/steps';

// 引入新手教程所需的自定义交互式组件
import { ResidenceCalculator, TransferCalculator, AuctionCalculator, EnchantmentSimulator } from './custom/calculators';
import { NpcDirectory } from './custom/npc';
import { CommandConsole } from './custom/command';
import { SkinUploader } from './custom/skin';
import { CommandList } from './custom/command-list';
import { BanList } from './custom/ban-list';
import { EnchantmentQuery } from './custom/enchant-query';
import { ProjectorConverter, PixelArtGenerator } from './custom/projector';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    ...FilesComponents,
    Accordion,
    Accordions,
    Steps,
    Step,
    // 注册为全局 MDX 组件
    ResidenceCalculator,
    TransferCalculator,
    AuctionCalculator,
    EnchantmentSimulator,
    NpcDirectory,
    CommandConsole,
    SkinUploader,
    CommandList,
    BanList,
    EnchantmentQuery,
    ProjectorConverter,
    PixelArtGenerator,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
