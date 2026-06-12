'use client';

import {
  type ComponentProps,
  Fragment,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowRight, Users, Server, Wifi, WifiOff, Loader2, RefreshCw, Upload, ImagePlus, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import Image from 'next/image';
import MainImg from './main.png';
import OpenAPIImg from './openapi.png';
import NotebookImg from './notebook.png';
import { cva } from 'class-variance-authority';

import StoryImage from './story.png';
import Logo1Image from './logo1.png';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';

const headingVariants = cva('font-medium tracking-tight', {
  variants: {
    variant: {
      h2: 'text-3xl lg:text-4xl',
      h3: 'text-xl lg:text-2xl',
    },
  },
});

const GrainGradient = dynamic(
  () => import('@paper-design/shaders-react').then((mod) => mod.GrainGradient),
  {
    ssr: false,
  },
);

const Dithering = dynamic(
  () => import('@paper-design/shaders-react').then((mod) => mod.Dithering),
  {
    ssr: false,
  },
);

export function Hero() {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useIsVisible(ref);
  const [showShaders, setShowShaders] = useState(false);

  useEffect(() => {
    // apply some delay, otherwise on slower devices, it errors with uniform images not being fully loaded.
    setTimeout(() => {
      setShowShaders(true);
    }, 400);
  }, []);

  return (
    <div ref={ref}>
      {showShaders && (
        <GrainGradient
          className="absolute inset-0 animate-fd-fade-in duration-800"
          colors={
            resolvedTheme === 'dark'
              ? ['#4ADE80', '#06B6D4', '#0A2A1000']
              : ['#86EFAC', '#22D3EE', '#0A2A1015']
          }
          colorBack="#00000000"
          softness={1}
          intensity={0.9}
          noise={0.5}
          speed={visible ? 1 : 0}
          shape="corners"
          minPixelRatio={1}
          maxPixelCount={1920 * 1080}
        />
      )}
      {showShaders && (
        <div className="absolute animate-fd-fade-in duration-400 max-lg:bottom-[-50%] max-lg:left-[-200px] lg:top-1/2 lg:right-[8%] lg:-translate-y-1/2 flex flex-col items-center justify-center select-none">
          <style>{`
            .pixel-text {
              font-family: 'Courier New', Courier, monospace;
              image-rendering: pixelated;
              -webkit-font-smoothing: none;
              -moz-osx-font-smoothing: grayscale;
              letter-spacing: 0.05em;
              filter: contrast(1.3) brightness(1.15);
            }
          `}</style>
          <span className="pixel-text text-5xl xl:text-7xl font-black tracking-tight leading-none" style={{ color: resolvedTheme === 'dark' ? '#22C55E' : '#4ADE80', textShadow: '2px 0 0 rgba(34,197,94,0.4), -2px 0 0 rgba(34,197,94,0.4), 0 2px 0 rgba(34,197,94,0.4), 0 -2px 0 rgba(34,197,94,0.4)' }}>
            Minecraft
          </span>
          <span className="pixel-text text-xl xl:text-2xl font-bold tracking-[0.3em] uppercase leading-none mt-1" style={{ color: resolvedTheme === 'dark' ? '#22C55E' : '#4ADE80', opacity: 0.85 }}>
            Java EDITION
          </span>
          <span className="pixel-text text-4xl xl:text-6xl font-black tracking-wider leading-none mt-1" style={{ color: resolvedTheme === 'dark' ? '#22C55E' : '#4ADE80', textShadow: '2px 0 0 rgba(34,197,94,0.4), -2px 0 0 rgba(34,197,94,0.4), 0 2px 0 rgba(34,197,94,0.4), 0 -2px 0 rgba(34,197,94,0.4)' }}>
            XCLOUDX
          </span>
        </div>
      )}
      {/* Hero image removed */}
    </div>
  );
}

export function CreateAppAnimation(props: ComponentProps<'div'>) {
  const installCmd = 'pnpm create fumadocs-app';
  const tickTime = 100;
  const timeCommandEnter = installCmd.length;
  const timeCommandRun = timeCommandEnter + 3;
  const timeCommandEnd = timeCommandRun + 3;
  const timeWindowOpen = timeCommandEnd + 1;
  const timeEnd = timeWindowOpen + 1;

  const [tick, setTick] = useState(timeEnd);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => (prev >= timeEnd ? prev : prev + 1));
    }, tickTime);

    return () => {
      clearInterval(timer);
    };
  }, [timeEnd]);

  const lines: ReactElement[] = [];

  lines.push(
    <span key="command_type">
      {installCmd.substring(0, tick)}
      {tick < timeCommandEnter && (
        <div className="inline-block h-3 w-1 animate-pulse bg-fd-foreground" />
      )}
    </span>,
  );

  if (tick >= timeCommandEnter) {
    lines.push(<span key="space"> </span>);
  }

  if (tick > timeCommandRun)
    lines.push(
      <Fragment key="command_response">
        {tick > timeCommandRun + 1 && (
          <>
            <span className="font-medium">◇ Project name</span>
            <span>│ my-app</span>
          </>
        )}
        {tick > timeCommandRun + 2 && (
          <>
            <span>│</span>
            <span className="font-medium">◆ Choose a framework</span>
          </>
        )}
        {tick > timeCommandRun + 3 && (
          <>
            <span>│ ● Next.js</span>
            <span>│ ○ Waku</span>
            <span>│ ○ Tanstack Start</span>
            <span>│ ○ React Router</span>
          </>
        )}
      </Fragment>,
    );

  return (
    <div
      {...props}
      onMouseEnter={() => {
        if (tick >= timeEnd) {
          setTick(0);
        }
      }}
    >
      {tick > timeWindowOpen && (
        <LaunchAppWindow className="absolute bottom-5 right-4 z-10 animate-in fade-in slide-in-from-top-10" />
      )}
      <pre className="font-mono text-sm min-h-[240px]">
        <code className="grid">{lines}</code>
      </pre>
    </div>
  );
}

function LaunchAppWindow(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('overflow-hidden rounded-md border bg-fd-popover shadow-lg', props.className)}
    >
      <p className="text-xs text-fd-muted-foreground text-center px-4 py-2 border-b">
        localhost:3000
      </p>
      <p className="text-sm px-4 py-2">New App launched!</p>
    </div>
  );
}

const previewButtonVariants = cva('w-28 h-8 text-sm font-medium transition-colors rounded-full', {
  variants: {
    active: {
      true: 'text-fd-primary-foreground',
      false: 'text-fd-muted-foreground',
    },
  },
});
export function PreviewImages(props: ComponentProps<'div'>) {
  const [active, setActive] = useState(0);
  const previews = [
    {
      image: MainImg,
      name: '圣诞小镇',
    },
    {
      image: NotebookImg,
      name: '云朵小镇',
    },
    {
      image: OpenAPIImg,
      name: '噶拿给木小镇',
    },
  ];

  return (
    <div {...props} className={cn('relative grid p-6', props.className)}>
      <div className="absolute flex flex-row left-1/2 -translate-1/2 bottom-0 z-2 p-0.5 rounded-full bg-fd-card border shadow-xl">
        <div
          role="none"
          className="absolute bg-fd-primary rounded-full w-28 h-8 transition-transform z-[-1]"
          style={{
            transform: `translateX(calc(var(--spacing) * 28 * ${active}))`,
          }}
        />
        {previews.map((item, i) => (
          <button
            key={i}
            className={cn(previewButtonVariants({ active: active === i }))}
            onClick={() => setActive(i)}
          >
            {item.name}
          </button>
        ))}
      </div>
      {previews.map((item, i) => (
        <Image
          key={i}
          src={item.image}
          alt="preview"
          className={cn(
            'col-start-1 row-start-1 select-none rounded-xl',
            active === i ? 'animate-in fade-in duration-500' : 'invisible',
          )}
        />
      ))}
    </div>
  );
}

const WritingTabs = [
  {
    name: '下载',
    value: 'writer',
  },
  {
    name: '加入',
    value: 'developer',
  },
  {
    name: '创建',
    value: 'automation',
  },
] as const;

export function Writing({
  tabs: tabContents,
}: {
  tabs: Record<(typeof WritingTabs)[number]['value'], ReactNode>;
}) {
  const [tab, setTab] = useState<(typeof WritingTabs)[number]['value']>('writer');

  return (
    <div className="col-span-full my-20">
      <h2 className="text-4xl text-brand mb-8 text-center font-medium tracking-tight">
        如何加入服务器？
      </h2>
      <p className="text-center mb-8 mx-auto w-full max-w-[800px]">
        通过 PCL 2 自带的下载整合包功能，快速下载 XCloud 闲云 整合包
      </p>
      <div className="flex justify-center items-center gap-4 text-fd-muted-foreground mb-6">
        {WritingTabs.map((item) => (
          <Fragment key={item.value}>
            <ArrowRight className="size-4 first:hidden" />
            <button
              className={cn(
                'text-lg font-medium transition-colors',
                item.value === tab && 'text-brand',
              )}
              onClick={() => setTab(item.value)}
            >
              {item.name}
            </button>
          </Fragment>
        ))}
      </div>
      {Object.entries(tabContents).map(([key, value]) => (
        <div
          key={key}
          aria-hidden={key !== tab}
          className={cn('animate-fd-fade-in', key !== tab && 'hidden')}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

export function AgnosticBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIsVisible(ref);

  return (
    <div
      ref={ref}
      className="absolute inset-0 -z-1 mask-[linear-gradient(to_top,white_30%,transparent_calc(100%-120px))]"
    >
      <Dithering
        colorBack="#00000000"
        colorFront="#ff6b35"
        shape="warp"
        type="4x4"
        speed={visible ? 0.4 : 0}
        className="size-full"
        minPixelRatio={1}
      />
    </div>
  );
}

let observer: IntersectionObserver;
const observerTargets = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

function useIsVisible(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    observer ??= new IntersectionObserver((entries) => {
      for (const entry of entries) {
        observerTargets.get(entry.target)?.(entry);
      }
    });

    const element = ref.current;
    if (!element) return;
    observerTargets.set(element, (entry) => {
      setVisible(entry.isIntersecting);
    });
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observerTargets.delete(element);
    };
  }, [ref]);

  return visible;
}

interface ServerStatusData {
  online: boolean;
  ip: string;
  port: number;
  players: number;
  max_players: number;
  version: string;
  motd_clean: string;
  favicon_url: string;
}

export function ServerStatus(props: ComponentProps<'div'>) {
  const [data, setData] = useState<ServerStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    fetch('https://uapis.cn/api/v1/game/minecraft/serverstatus?server=play.xcloudx.top')
      .then((res) => res.json())
      .then((json) => {
        if (json.online) {
          setData(json);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div {...props} className={cn(props.className)}>
      <div className="mx-auto w-full max-w-[800px] p-2 bg-fd-card text-fd-card-foreground border rounded-2xl shadow-lg">
        {/* 标题栏 */}
        <div className="flex flex-row items-center gap-3">
          <h2 className="text-brand content-center font-mono font-bold uppercase border-2 border-brand/50 px-3 py-1.5 rounded-xl text-sm flex items-center gap-2">
            <Server className="size-4" />
            服务器状态
          </h2>
          {data && data.favicon_url && (
            <img
              src={data.favicon_url}
              alt="server icon"
              className="size-8 rounded-md"
            />
          )}
          {loading ? (
            <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          ) : data?.online ? (
            <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
              <Wifi className="size-3" />
              在线
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
              <WifiOff className="size-3" />
              离线
            </div>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="ms-auto p-2 rounded-lg text-brand hover:bg-brand/10 transition-colors disabled:opacity-50"
            title="刷新服务器状态"
          >
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
          </button>
        </div>

        {/* 状态内容区 */}
        <div className="relative bg-fd-secondary rounded-xl mt-2 border shadow-md overflow-hidden">
          {/* MOTD 区域 */}
          <div className="border-b p-3 text-fd-muted-foreground flex justify-center items-center">
            {loading ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                正在连接服务器...
              </div>
            ) : error || !data ? (
              <p className="text-sm text-red-400">无法连接到服务器</p>
            ) : (
              <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-center m-0">
                {data.motd_clean
                  .split('\n')
                  .map((line) => line.trim().replace(/\s*\[.*不删档内测.*?\]\s*/g, ''))
                  .filter((line) => line.length > 0)
                  .join('\n')}
              </pre>
            )}
          </div>

          {/* 数据面板 */}
          {!loading && data && !error && (
            <div className="grid grid-cols-3 gap-0 divide-x divide-fd-border">
              <div className="p-3 flex flex-col items-center gap-1">
                <Users className="size-5 text-brand" />
                <span className="text-xl font-bold text-fd-foreground">{data.players}</span>
                <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wider">在线玩家</span>
                <span className="text-[10px] text-fd-muted-foreground/60">/ {data.max_players}</span>
              </div>
              <div className="p-3 flex flex-col items-center gap-1">
                <Server className="size-5 text-brand" />
                <span className="text-xs font-mono font-bold text-fd-foreground">
                  play.xcloudx.top
                </span>
                <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wider">服务器地址</span>
              </div>
              <div className="p-3 flex flex-col items-center gap-1">
                <Wifi className="size-5 text-brand" />
                <span className="text-xs font-mono font-bold text-fd-foreground truncate max-w-full px-1">
                  {data.version.replace('Velocity ', '')}
                </span>
                <span className="text-[10px] text-fd-muted-foreground uppercase tracking-wider">服务端版本</span>
                <span className="text-[10px] text-fd-muted-foreground/60">Velocity</span>
              </div>
            </div>
          )}

          {/* 加载中骨架屏 */}
          {loading && (
            <div className="grid grid-cols-3 gap-0 divide-x divide-fd-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 flex flex-col items-center gap-1.5 animate-pulse">
                  <div className="size-5 rounded bg-fd-muted-foreground/20" />
                  <div className="h-5 w-12 rounded bg-fd-muted-foreground/15" />
                  <div className="h-3 w-14 rounded bg-fd-muted-foreground/10" />
                  <div className="h-3 w-8 rounded bg-fd-muted-foreground/8" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SkinUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [variant, setVariant] = useState<'classic' | 'slim'>('classic');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResultUrl(null);
    setError(null);
    setCopied(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', 'skin');
      formData.append('variant', variant);
      const res = await fetch('https://api.mineskin.org/generate/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer msk_qlm6bWTq_ArdZggIAvYF6KIpGGlF1No3cg3DGInYz02UxgRxJ9kYMXLzX_H4QC9ZDvjVOrWAF' },
        body: formData,
      });
      const data = await res.json();
      if (data.data?.texture?.url) {
        setResultUrl('/skin url ' + data.data.texture.url);
      } else {
        setError(data.error || '上传失败，请重试');
      }
    } catch {
      setError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    if (!resultUrl) return;
    await navigator.clipboard.writeText(resultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative col-span-full min-h-[570px] px-2 py-6 rounded-2xl z-2 border shadow-md flex items-center justify-center">
      <Image
        src={StoryImage}
        alt=""
        className="absolute inset-0 size-full -z-1 pointer-events-none object-cover object-top rounded-2xl"
      />
      <div className="w-full max-w-[500px] text-start shadow-xl p-2 bg-fd-card/80 backdrop-blur-md rounded-xl border shadow-black/50 dark:bg-fd-card/50 relative z-1">
        <div className="pt-3 px-3">
          <h2
            className={cn(
              headingVariants({
                className: 'mb-2',
                variant: 'h3',
              }),
            )}
          >
            快速更换皮肤
          </h2>
          <p className="text-sm mb-4 text-fd-muted-foreground">
            上传你的皮肤图片，获取皮肤链接，在游戏中快速更换
          </p>

          {/* 上传区域 */}
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-brand/30 rounded-xl cursor-pointer hover:border-brand/60 hover:bg-brand/5 transition-colors mb-4">
            {preview ? (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image src={preview} alt="skin preview" fill className="object-contain" unoptimized />
              </div>
            ) : (
              <>
                <Upload className="size-8 text-brand/50 mb-2" />
                <p className="text-sm text-fd-muted-foreground">点击或拖拽上传皮肤图片</p>
                <p className="text-xs text-fd-muted-foreground/60 mt-1">支持 PNG / JPG</p>
              </>
            )}
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleFileChange} />
          </label>

          {/* 模型选择 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setVariant('classic')}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                variant === 'classic'
                  ? 'bg-brand text-brand-foreground border-brand'
                  : 'bg-fd-secondary text-fd-muted-foreground hover:bg-fd-accent',
              )}
            >
              经典 (Steve)
            </button>
            <button
              onClick={() => setVariant('slim')}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                variant === 'slim'
                  ? 'bg-brand text-brand-foreground border-brand'
                  : 'bg-fd-secondary text-fd-muted-foreground hover:bg-fd-accent',
              )}
            >
              纤细 (Alex)
            </button>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-colors',
                file && !loading
                  ? 'bg-brand text-brand-foreground hover:bg-brand/90'
                  : 'bg-fd-muted text-fd-muted-foreground cursor-not-allowed',
              )}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              {loading ? '生成中...' : '生成皮肤链接'}
            </button>
            {file && (
              <button
                onClick={() => { setFile(null); setPreview(null); setResultUrl(null); setError(null); }}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full font-medium text-sm border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent transition-colors"
              >
                清除
              </button>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-red-400 mb-3 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* 结果展示 */}
          {resultUrl && (
            <div className="rounded-lg bg-fd-secondary/50 border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-brand flex items-center gap-1.5">
                  <Check className="size-3.5" /> 皮肤链接已生成
                </p>
                <button
                  onClick={copyUrl}
                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-brand text-brand-foreground hover:bg-brand/90 transition-colors"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <p className="text-[11px] text-fd-muted-foreground/70 mt-2">
                在游戏聊天内粘贴发送即可更换皮肤
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

