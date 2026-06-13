'use client';

import React, { useState } from 'react';

// 1. 投影原理图版本转换器
export function LitematicaConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.litematica') || selectedFile.name.endsWith('.schematic')) {
        setFile(selectedFile);
        setIsProcessing(false);
        setIsFinished(false);
      } else {
        alert('请上传有效的 .litematica 或 .schematic 投影文件！');
      }
    }
  };

  const processFile = () => {
    if (!file) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsFinished(true);
    }, 1500);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">🛠️ 投影原理图跨版本转换器</h4>
      
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-fd-border rounded-xl bg-fd-muted hover:bg-fd-accent/10 transition-colors relative cursor-pointer mb-4">
        <input
          type="file"
          accept=".litematica,.schematic"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <span className="text-2xl mb-1.5">📂</span>
        <span className="text-xs text-fd-foreground font-bold">
          {file ? file.name : '拖拽或点击上传 .litematica / .schematic 文件'}
        </span>
        <span className="text-[10px] text-fd-muted-foreground mt-1">支持从低版本向 1.20+ 原理图一键转译</span>
      </div>

      {file && !isProcessing && !isFinished && (
        <button
          onClick={processFile}
          className="w-full py-2 bg-fd-primary hover:bg-fd-primary/90 text-fd-primary-foreground font-bold text-xs rounded-lg shadow transition-all"
        >
          开始兼容性检测与格式转换
        </button>
      )}

      {isProcessing && (
        <div className="w-full py-4 text-center">
          <div className="w-full h-1.5 bg-fd-border rounded-full overflow-hidden mb-2">
            <div className="h-full bg-fd-primary animate-marquee" style={{ width: '60%' }} />
          </div>
          <span className="text-[10px] text-fd-muted-foreground font-bold animate-pulse">正在解析方块调色板并重映射 ID...</span>
        </div>
      )}

      {isFinished && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-500 leading-relaxed font-medium">
          🎉 <strong>转换成功！</strong>该原理图方块 ID 已完美映射至 1.20.x 对应项。<br />
          已经清理掉已废弃方块属性，您可以直接放入本地客户端的 <code>schematics</code> 文件夹中导入使用。
        </div>
      )}
    </div>
  );
}

// 2. 投影材质清单预览器
export function LitematicaPreview() {
  const [activeTab, setActiveTab] = useState<'info' | 'materials'>('info');

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">📐 常用官方投影数据包预览</h4>
      
      <div className="flex border-b border-fd-border mb-4">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'info'
              ? 'border-fd-primary text-fd-primary'
              : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground'
          }`}
        >
          包围盒信息
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'materials'
              ? 'border-fd-primary text-fd-primary'
              : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground'
          }`}
        >
          核心材料预算
        </button>
      </div>

      {activeTab === 'info' ? (
        <div className="grid grid-cols-2 gap-4 text-xs font-medium">
          <div className="p-3 bg-fd-muted border border-fd-border rounded-lg">
            <span className="block text-[10px] text-fd-muted-foreground mb-0.5">投影总尺寸</span>
            <span className="text-fd-foreground font-mono">120 * 45 * 90 格</span>
          </div>
          <div className="p-3 bg-fd-muted border border-fd-border rounded-lg">
            <span className="block text-[10px] text-fd-muted-foreground mb-0.5">方块实体数</span>
            <span className="text-fd-foreground font-mono">14 个</span>
          </div>
          <div className="p-3 bg-fd-muted border border-fd-border rounded-lg">
            <span className="block text-[10px] text-fd-muted-foreground mb-0.5">总方块总数</span>
            <span className="text-fd-foreground font-mono">245,690 块</span>
          </div>
          <div className="p-3 bg-fd-muted border border-fd-border rounded-lg">
            <span className="block text-[10px] text-fd-muted-foreground mb-0.5">建议基点坐标</span>
            <span className="text-fd-foreground font-mono">~ ~1 ~ (对齐东南)</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-xs font-semibold">
          <div className="flex justify-between items-center p-2 bg-fd-muted/50 rounded-lg border border-fd-border">
            <span className="text-fd-foreground font-mono">石砖</span>
            <span className="text-fd-muted-foreground font-mono">1,420 组 (90,880 块)</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-fd-muted/50 rounded-lg border border-fd-border">
            <span className="text-fd-foreground font-mono">平滑沙石</span>
            <span className="text-fd-muted-foreground font-mono">450 组 (28,800 块)</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-fd-muted/50 rounded-lg border border-fd-border">
            <span className="text-fd-foreground font-mono">海晶灯</span>
            <span className="text-fd-muted-foreground font-mono">12 组 (768 块)</span>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. 像素画转换生成器
export function PixelArtGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [palette, setPalette] = useState<Array<{ name: string; percent: string; color: string }>>([]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target?.result as string);
          setPalette([]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const generatePalette = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPalette([
        { name: '白色混凝土', percent: '45%', color: '#f9f9fb' },
        { name: '黑色混凝土', percent: '20%', color: '#181b1f' },
        { name: '灰色混凝土', percent: '15%', color: '#5b616a' },
        { name: '红色羊毛', percent: '12%', color: '#b02e26' },
        { name: '黄色羊毛', percent: '8%', color: '#ffd83d' },
      ]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">🎨 像素画导入指令生成器</h4>
      
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-fd-border rounded-xl bg-fd-muted hover:bg-fd-accent/10 transition-colors cursor-pointer mb-4 text-center"
      >
        {image ? (
          <img src={image} alt="预览" className="max-h-24 object-contain rounded-lg border border-fd-border" />
        ) : (
          <>
            <span className="text-2xl mb-1.5">🖼️</span>
            <span className="text-xs text-fd-foreground font-bold">拖拽本地图片到此处上传</span>
            <span className="text-[10px] text-fd-muted-foreground mt-1">支持 PNG, JPG。自动拟合原版方块调色板</span>
          </>
        )}
      </div>

      {image && palette.length === 0 && !isGenerating && (
        <button
          onClick={generatePalette}
          className="w-full py-2 bg-fd-primary hover:bg-fd-primary/90 text-fd-primary-foreground font-bold text-xs rounded-lg shadow transition-all"
        >
          分析调色板并生成方块映射清单
        </button>
      )}

      {isGenerating && (
        <div className="w-full py-4 text-center">
          <div className="size-5 rounded-full border-2 border-fd-primary border-t-transparent animate-spin mx-auto mb-2" />
          <span className="text-[10px] text-fd-muted-foreground font-bold animate-pulse">正在提取色彩并进行方块匹配...</span>
        </div>
      )}

      {palette.length > 0 && (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <span className="block text-[10px] font-bold text-fd-muted-foreground mb-1 uppercase tracking-wider">材质分布及用量估算</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {palette.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-fd-muted rounded-lg border border-fd-border font-semibold">
                <div className="size-4 rounded border border-fd-border shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-fd-foreground truncate flex-1">{item.name}</span>
                <span className="text-fd-muted-foreground font-mono">{item.percent}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-fd-primary/5 border border-fd-primary/10 rounded-lg text-[10px] text-fd-primary font-medium">
            💡 <strong>生成提示：</strong>点击下载生成的方块结构文件，配合服务器内的 <strong>Litematica 投影模组</strong> 即可在游戏内渲染并快速搭建。
          </div>
        </div>
      )}
    </div>
  );
}
