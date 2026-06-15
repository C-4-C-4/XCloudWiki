'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import images from '@/lib/gallery.json';

const basePath = '';

const getImagePath = (src: string) => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${basePath}${src}`;
};

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 快捷关闭和切换函数
  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  }, [selectedIndex]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  }, [selectedIndex]);

  // 监听键盘事件
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // 阻止背景滚动
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  return (
    <main className="text-landing-foreground dark:text-landing-foreground-dark min-h-screen pt-10 pb-20">
      {/* 头部装饰与标题 */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs text-brand font-medium tracking-wider uppercase bg-brand/10 dark:bg-brand/20 px-3 py-1 rounded-full border border-brand/30">
            闲云画廊
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-4 mb-6">
            精彩瞬间 /{' '}
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, #06B6D4, #22D3EE, #67E8F9)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Gallery
            </span>
          </h1>
          <p className="text-sm md:text-base text-fd-muted-foreground max-w-xl mx-auto leading-relaxed">
            定格服务器里每一份温暖的记忆，记录玩家们走过的每一个多维世界与日常点滴。
          </p>
        </motion.div>
      </div>

      {/* 图片网格 */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {images.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl bg-fd-card/50">
            <p className="text-fd-muted-foreground">画廊中暂时没有图片，请先上传图片到公用目录。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: (index % 4) * 0.05 }}
                onClick={() => setSelectedIndex(index)}
                className="group cursor-zoom-in relative overflow-hidden rounded-2xl bg-fd-secondary border shadow-sm aspect-video"
              >
                <Image
                  src={getImagePath(src)}
                  alt="Gallery shot"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* 悬停时的渐变遮罩 */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 灯箱 (Lightbox) 模式 */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md select-none"
            onClick={handleClose}
          >
            {/* 顶部控制栏 */}
            <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 text-white bg-gradient-to-b from-black/60 to-transparent z-10">
              <span className="text-sm font-medium tracking-widest text-gray-300">
                {selectedIndex + 1} / {images.length}
              </span>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-white/20"
                aria-label="关闭"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* 左切换按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 p-3 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full z-10 focus:outline-none focus:ring-2 focus:ring-white/20 max-md:p-2"
              aria-label="上一张"
            >
              <ChevronLeft className="size-8 max-md:size-6" />
            </button>

            {/* 图片主体 */}
            <div
              className="relative w-[90vw] h-[75vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={getImagePath(images[selectedIndex])}
                    alt="Gallery preview"
                    fill
                    className="object-contain"
                    sizes="90vw"
                    priority
                    unoptimized // 画廊原图预览不进行大尺寸裁剪，保证清晰度
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 右切换按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 p-3 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full z-10 focus:outline-none focus:ring-2 focus:ring-white/20 max-md:p-2"
              aria-label="下一张"
            >
              <ChevronRight className="size-8 max-md:size-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
