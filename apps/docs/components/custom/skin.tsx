'use client';

import React, { useState } from 'react';
import { Upload, ImagePlus, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import Image from 'next/image';

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
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-2">快速更换皮肤</h4>
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
  );
}
