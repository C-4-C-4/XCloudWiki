'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Download,
  Maximize2,
  Minimize2,
  Grid
} from 'lucide-react';
import galleryData from '@/public/Gallery/gallery.json';

// 定义图片对象类型
interface ImageItem {
  filename: string;
  src: string;
  title: string;
}

export default function GalleryPage() {
  // 解析图片数据
  const allImages: ImageItem[] = useMemo(() => {
    return (galleryData as string[]).map((filename) => {
      // 去除后缀作为标题，并将下划线替换为空格以便阅读
      const title = filename
        .replace(/\.[^/.]+$/, "")
        .replace(/_/g, " ");
      return {
        filename,
        src: `/Gallery/${filename}`,
        title,
      };
    });
  }, []);

  // 状态管理
  const [mounted, setMounted] = useState(false);
  const [shuffledImages, setShuffledImages] = useState<ImageItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(16); // 初始加载16张
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null); // 当前灯箱打开的图片索引
  const [isPlaying, setIsPlaying] = useState(false); // 幻灯片播放状态
  const [isFullscreen, setIsFullscreen] = useState(false); // 全屏状态

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  // 客户端挂载后对图片进行随机打乱，防止 SSR 阶段水合错位
  useEffect(() => {
    setMounted(true);
    const shuffle = (array: ImageItem[]) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    setShuffledImages(shuffle(allImages));
  }, [allImages]);

  // 服务端/挂载前渲染原始顺序，挂载后无缝显示打乱顺序
  const displayImages = useMemo(() => {
    return mounted ? shuffledImages : allImages;
  }, [mounted, shuffledImages, allImages]);

  // 无限滚动 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 12, displayImages.length));
        }
      },
      { rootMargin: '200px' }
    );

    const currentObserverNode = observerRef.current;
    if (currentObserverNode) {
      observer.observe(currentObserverNode);
    }

    return () => {
      if (currentObserverNode) {
        observer.unobserve(currentObserverNode);
      }
    };
  }, [displayImages.length]);

  // 幻灯片播放逻辑
  useEffect(() => {
    if (isPlaying && activeImageIndex !== null) {
      playTimerRef.current = setInterval(() => {
        setActiveImageIndex((prev) => {
          if (prev === null) return null;
          return (prev + 1) % displayImages.length;
        });
      }, 3000); // 每 3 秒自动切换下一张
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    }

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, activeImageIndex, displayImages.length]);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImageIndex, displayImages.length]);

  // 全屏状态改变监听
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 灯箱控制
  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    document.body.style.overflow = 'hidden'; // 阻止背景滚动
  };

  const closeLightbox = () => {
    setActiveImageIndex(null);
    setIsPlaying(false);
    document.body.style.overflow = ''; // 恢复背景滚动
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const handlePrev = () => {
    setActiveImageIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? displayImages.length - 1 : prev - 1;
    });
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % displayImages.length;
    });
  };

  // 切换全屏
  const toggleFullscreen = () => {
    if (!lightboxRef.current) return;

    if (!document.fullscreenElement) {
      lightboxRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 下载图片
  const downloadImage = (url: string, filename: string) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((error) => {
        console.error('Failed to download image:', error);
        window.open(url, '_blank');
      });
  };

  return (
    <main className="min-h-screen px-4 sm:px-6 py-12 z-2 w-full max-w-[1400px] mx-auto transition-colors duration-300">
      
      {/* 渐变装饰背景 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[350px] -z-10 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute -top-[30%] -left-[10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-brand to-indigo-500 blur-[120px]" />
        <div className="absolute -top-[20%] -right-[10%] w-[45%] aspect-square rounded-full bg-gradient-to-tl from-purple-500 to-pink-500 blur-[120px]" />
      </div>

      {/* 页面头部 */}
      <div className="text-center mb-16 relative">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-brand bg-brand/10 dark:bg-brand/20 rounded-full uppercase">
            XCloud Showcase
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-brand to-indigo-600 dark:from-white dark:via-brand dark:to-indigo-400 bg-clip-text text-transparent pb-1">
            闲云光影画廊
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto font-normal">
            记录闲云服务器中的绝美瞬间与难忘回忆。默认每次随机排序，点击图片可进入沉浸式灯箱预览模式。
          </p>
        </motion.div>
      </div>

      {/* 图片瀑布流展示 */}
      {displayImages.length > 0 ? (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 xl:gap-6 space-y-4 xl:space-y-6">
          {displayImages.slice(0, visibleCount).map((image, index) => (
            <motion.div
              key={image.filename}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={() => openLightbox(index)}
              className="break-inside-avoid overflow-hidden rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-100 dark:bg-neutral-900 group relative cursor-pointer shadow-sm hover:shadow-xl dark:shadow-none transition-shadow duration-300"
            >
              {/* 图片 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.title}
                loading="lazy"
                className="w-full h-auto object-cover transform duration-500 ease-out group-hover:scale-[1.03]"
              />

              {/* Hover 渐变蒙层 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs text-neutral-300 font-mono tracking-wider truncate mb-1">
                    {image.filename}
                  </p>
                  <h3 className="text-white text-sm sm:text-base font-semibold truncate">
                    {image.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* 空状态 */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-3xl"
        >
          <Grid className="size-12 mx-auto text-neutral-400 stroke-[1.5] mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">画廊中暂无图片</h3>
        </motion.div>
      )}

      {/* 无限滚动触发哨兵 */}
      {visibleCount < displayImages.length && (
        <div ref={observerRef} className="w-full py-12 flex justify-center items-center">
          <div className="flex gap-2">
            <span className="size-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="size-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="size-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* 灯箱 (Lightbox) 模式 */}
      <AnimatePresence>
        {activeImageIndex !== null && (
          <motion.div
            ref={lightboxRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-2xl flex flex-col justify-between select-none"
          >
            {/* 顶部工具条 */}
            <div className="w-full p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-50 text-white">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/10 backdrop-blur-sm tracking-wide">
                  {activeImageIndex + 1} / {displayImages.length}
                </span>
                <span className="text-sm font-medium hidden md:inline-block font-mono tracking-wide truncate max-w-md opacity-85">
                  {displayImages[activeImageIndex].filename}
                </span>
              </div>

              {/* 顶部控制组 */}
              <div className="flex items-center gap-1">
                {/* 自动播放 */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? "暂停幻灯片" : "播放幻灯片"}
                  className="p-2.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white/90 hover:text-white"
                >
                  {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
                </button>

                {/* 全屏 */}
                <button
                  onClick={toggleFullscreen}
                  title="全屏模式"
                  className="p-2.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white/90 hover:text-white"
                >
                  {isFullscreen ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
                </button>

                {/* 下载 */}
                <button
                  onClick={() =>
                    downloadImage(
                      displayImages[activeImageIndex].src,
                      displayImages[activeImageIndex].filename
                    )
                  }
                  title="下载原图"
                  className="p-2.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white/90 hover:text-white"
                >
                  <Download className="size-5" />
                </button>

                {/* 分割线 */}
                <span className="w-px h-5 bg-white/20 mx-1.5" />

                {/* 关闭 */}
                <button
                  onClick={closeLightbox}
                  title="关闭 (Esc)"
                  className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* 中间核心大图展示区域 */}
            <div className="flex-1 flex items-center justify-center relative px-4 md:px-16 overflow-hidden">
              {/* 左右侧切换大区 (点击可切换) */}
              <div 
                className="absolute left-0 top-16 bottom-24 w-1/4 z-10 cursor-left-arrow" 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              />
              <div 
                className="absolute right-0 top-16 bottom-24 w-1/4 z-10 cursor-right-arrow" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              />

              {/* 左控制按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 md:left-6 p-3 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer z-20 group hover:scale-105"
              >
                <ChevronLeft className="size-6 transform group-hover:-translate-x-0.5 transition-transform" />
              </button>

              {/* 大图容器 */}
              <div 
                className="relative max-w-full max-h-[75vh] md:max-h-[80vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // 防止点击图片关闭灯箱
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={displayImages[activeImageIndex].src}
                    alt={displayImages[activeImageIndex].title}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  />
                </AnimatePresence>
              </div>

              {/* 右控制按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 md:right-6 p-3 rounded-full bg-white/5 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer z-20 group hover:scale-105"
              >
                <ChevronRight className="size-6 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 底部缩略图和信息条 */}
            <div className="w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 flex flex-col items-center gap-3 z-50">
              
              {/* 图片标题 */}
              <div className="text-center">
                <h3 className="text-white text-base md:text-lg font-semibold tracking-wide">
                  {displayImages[activeImageIndex].title}
                </h3>
              </div>

              {/* 缩略图横条滚动预览 */}
              <div className="w-full max-w-2xl overflow-x-auto no-scrollbar py-2 flex items-center justify-center gap-2">
                <div className="flex gap-2 mx-auto px-4">
                  {displayImages.map((image, idx) => {
                    // 只展示当前焦点图片前后 4 张，防止过长
                    const isVisible = Math.abs(idx - activeImageIndex) <= 4 ||
                      (activeImageIndex < 4 && idx < 9) ||
                      (activeImageIndex > displayImages.length - 5 && idx > displayImages.length - 10);
                    
                    if (!isVisible) return null;

                    return (
                      <button
                        key={`thumb-${image.filename}`}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative size-12 md:size-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                          idx === activeImageIndex
                            ? 'border-brand scale-105 shadow-md shadow-brand/40'
                            : 'border-white/20 opacity-40 hover:opacity-80 hover:scale-102'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.src}
                          alt="thumb"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
