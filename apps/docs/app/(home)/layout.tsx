import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions, linkItems } from '@/components/layouts/shared';
import {
  NavbarMenu,
  NavbarMenuContent,
  NavbarMenuLink,
  NavbarMenuTrigger,
} from 'fumadocs-ui/layouts/home/navbar';
import Link from 'fumadocs-core/link';
import Image from 'next/image';
import Preview from '@/public/banner.png';
import { Book, ComponentIcon, Pencil, PlusIcon, Server } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        {
          type: 'menu',
          on: 'menu',
          text: '文档',
          items: [
            {
              text: '基础信息',
              url: '/docs/BasicInfo',
              icon: <Book />,
            },
            {
              text: '新手教程',
              url: '/docs/BeginnersGuide',
              icon: <ComponentIcon />,
            },
          ],
        },
        {
          type: 'custom',
          on: 'nav',
          children: (
            <NavbarMenu>
              <NavbarMenuTrigger>
                <Link href="/docs">文档</Link>
              </NavbarMenuTrigger>
              <NavbarMenuContent>
                <NavbarMenuLink href="/docs" className="md:row-span-2">
                  <div className="-mx-3 -mt-3">
                    <Image
                      src={Preview}
                      alt="Preview"
                      className="rounded-t-lg object-cover"
                      style={{
                        maskImage: 'linear-gradient(to bottom,white 60%,transparent)',
                      }}
                    />
                  </div>
                  <p className="font-medium">文档</p>
                  <p className="text-fd-muted-foreground text-sm">
                    闲云攻略文档
                  </p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/BeginnersGuide/TravelTips" className="lg:col-start-2">
                  <ComponentIcon className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                  <p className="font-medium">新手教程</p>
                  <p className="text-fd-muted-foreground text-sm">
                    关于闲云服务器的新手入门指南与教学
                  </p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/Expandedgameplay/BlacksmithSystem" className="lg:col-start-2">
                  <Server className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                  <p className="font-medium">拓展玩法</p>
                  <p className="text-fd-muted-foreground text-sm">
                    闲云服务器的拓展玩法与特色系统
                  </p>
                </NavbarMenuLink>

                <NavbarMenuLink href="/docs/Tools/Changeskin" className="lg:col-start-3 lg:row-start-1">
                  <Pencil className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                  <p className="font-medium">工具</p>
                  <p className="text-fd-muted-foreground text-sm">
                    实用工具集合
                  </p>
                </NavbarMenuLink>

                <NavbarMenuLink
                  href="/docs//Other/InvestitureoftheGods"
                  className="lg:col-start-3 lg:row-start-2"
                >
                  <PlusIcon className="bg-fd-primary text-fd-primary-foreground p-1 mb-2 rounded-md" />
                  <p className="font-medium">其他</p>
                  <p className="text-fd-muted-foreground text-sm">
                    其他分类
                  </p>
                </NavbarMenuLink>
              </NavbarMenuContent>
            </NavbarMenu>
          ),
        },
        ...linkItems,
      ]}
      className="dark:bg-neutral-950 dark:[--color-fd-background:var(--color-neutral-950)] [--color-fd-primary:var(--color-brand)]"
    >
      {children}
    </HomeLayout>
  );
}
