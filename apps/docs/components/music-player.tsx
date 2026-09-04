'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Music,
  X,
} from 'lucide-react';

// --- LRC 歌词解析 ---
interface LyricLine {
  time: number; // 秒
  text: string;
}

function parseLRC(lrc: string): LyricLine[] {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const time = min * 60 + sec + ms / (match[3].length === 3 ? 1000 : 100);
      const text = match[4].trim();
      if (text) result.push({ time, text });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// --- 组件 ---
export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [showVolume, setShowVolume] = useState(false);

  // 加载歌词
  useEffect(() => {
    fetch('/Music/再见.lrc')
      .then((res) => res.text())
      .then((text) => setLyrics(parseLRC(text)))
      .catch(() => {});
  }, []);

  // 检查并恢复上次播放状态
  useEffect(() => {
    try {
      const wasActive = sessionStorage.getItem('bg_music_active') === 'true';
      const savedTime = parseFloat(sessionStorage.getItem('bg_music_time') || '0');

      if (wasActive) {
        setVisible(true);
        const audio = audioRef.current;
        if (audio) {
          if (savedTime > 0) audio.currentTime = savedTime;
          audio.volume = 1;
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {});
        }
      }
    } catch {}
  }, []);

  // 监听触发事件（点击“别走”或“我知道了”时触发）
  useEffect(() => {
    const handleTrigger = () => {
      setVisible(true);
      try {
        sessionStorage.setItem('bg_music_active', 'true');
      } catch {}
      const audio = audioRef.current;
      if (audio) {
        audio.volume = 1;
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    };

    window.addEventListener('play-bg-music-with-lyrics', handleTrigger);
    return () => {
      window.removeEventListener('play-bg-music-with-lyrics', handleTrigger);
    };
  }, []);

  // 更新当前时间和歌词高亮，并实时保存进度
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      try {
        sessionStorage.setItem('bg_music_time', audio.currentTime.toString());
      } catch {}
      // 查找当前歌词
      let idx = -1;
      for (let i = lyrics.length - 1; i >= 0; i--) {
        if (audio.currentTime >= lyrics[i].time) {
          idx = i;
          break;
        }
      }
      setActiveLyricIndex(idx);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      setCurrentTime(0);
      setActiveLyricIndex(-1);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [lyrics]);

  // 歌词自动滚动
  useEffect(() => {
    if (activeLyricIndex < 0 || !lyricsContainerRef.current) return;
    const container = lyricsContainerRef.current;
    const activeEl = container.querySelector('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex]);

  // 播放/暂停
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const currentLyric = activeLyricIndex >= 0 ? lyrics[activeLyricIndex]?.text : '再见';
  const nextLyric = activeLyricIndex >= 0 && activeLyricIndex + 1 < lyrics.length ? lyrics[activeLyricIndex + 1]?.text : '';

  if (!visible) {
    return <audio ref={audioRef} src="/Music/再见.mp3" preload="metadata" />;
  }

  return (
    <>
      <audio ref={audioRef} src="/Music/再见.mp3" preload="metadata" />

      {/* 极简精致悬浮字幕式歌词 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
        <div className="group relative flex flex-col items-center px-4 py-1.5 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 shadow-lg transition-all hover:bg-black/60 max-w-[90vw]">
          {/* 歌词主文本区域 */}
          <div className="flex flex-col items-center text-center px-1">
            <p className="text-sm md:text-base font-bold text-brand tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] transition-all duration-300">
              {currentLyric}
            </p>
            {nextLyric && (
              <p className="text-[11px] text-white/50 tracking-normal mt-0.5 transition-all duration-300 truncate max-w-[280px]">
                {nextLyric}
              </p>
            )}
          </div>

          {/* 悬浮控制按钮（悬停时显现） */}
          <div className="flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={togglePlay}
              className="p-1 rounded-md text-white/70 hover:text-brand hover:bg-white/10 transition-colors"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause className="size-3" /> : <Play className="size-3 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
