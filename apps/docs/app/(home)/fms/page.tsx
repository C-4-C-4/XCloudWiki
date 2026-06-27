import { EnchantmentQuery } from '@/components/custom/enchant-query';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '特色附魔图鉴 | 闲云服务器',
  description: '查询闲云服务器的各种特色附魔属性、品质、数值、冷却CD及附魔书冲突搭配',
};

export default function EnchantmentPage() {
  return (
    <main className="container max-w-[1400px] mx-auto px-4 py-8 md:py-12 min-h-screen">
      <EnchantmentQuery />
    </main>
  );
}
