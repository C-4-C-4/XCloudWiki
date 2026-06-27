'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gunzipSync, gzipSync } from 'fflate';
import { 
  FileUp, 
  ArrowRightLeft, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Compass, 
  ShieldAlert,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

const VERSION_MAP: Record<number, string> = {
  4: 'V4 (Minecraft 1.12 - 1.15)',
  5: 'V5 (Minecraft 1.16)',
  6: 'V6 (Minecraft 1.17 - 1.20.4)',
  7: 'V7 (Minecraft 1.21+)',
};

// ================= NBT 序列化工具 =================
class NbtWriter {
  private buffer: ArrayBuffer;
  private view: DataView;
  private offset: number;

  constructor(initialSize = 1024 * 1024) {
    this.buffer = new ArrayBuffer(initialSize);
    this.view = new DataView(this.buffer);
    this.offset = 0;
  }

  private ensureCapacity(needed: number) {
    if (this.offset + needed > this.buffer.byteLength) {
      const newLen = Math.max(this.buffer.byteLength * 2, this.offset + needed);
      const newBuf = new ArrayBuffer(newLen);
      new Uint8Array(newBuf).set(new Uint8Array(this.buffer));
      this.buffer = newBuf;
      this.view = new DataView(this.buffer);
    }
  }

  writeByte(val: number) {
    this.ensureCapacity(1);
    this.view.setInt8(this.offset, val);
    this.offset += 1;
  }

  writeShort(val: number) {
    this.ensureCapacity(2);
    this.view.setInt16(this.offset, val, false);
    this.offset += 2;
  }

  writeInt(val: number) {
    this.ensureCapacity(4);
    this.view.setInt32(this.offset, val, false);
    this.offset += 4;
  }

  writeLong(high: number, low: number) {
    this.ensureCapacity(8);
    this.view.setInt32(this.offset, high, false);
    this.view.setInt32(this.offset + 4, low, false);
    this.offset += 8;
  }

  writeString(val: string) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(val);
    this.writeShort(bytes.length);
    this.ensureCapacity(bytes.length);
    new Uint8Array(this.buffer).set(bytes, this.offset);
    this.offset += bytes.length;
  }

  writeHeader(type: number, name: string | null) {
    this.writeByte(type);
    if (name !== null) {
      this.writeString(name);
    }
  }

  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer, 0, this.offset);
  }
}

// 16色混凝土调色板数据 (与游戏颜色接近)
const CONCRETE_PALETTE = [
  { name: 'minecraft:air', r: 0, g: 0, b: 0, isAir: true, label: '空气' },
  { name: 'minecraft:white_concrete', r: 207, g: 213, b: 214, label: '白色混凝土' },
  { name: 'minecraft:orange_concrete', r: 224, g: 97, b: 0, label: '橙色混凝土' },
  { name: 'minecraft:magenta_concrete', r: 169, g: 48, b: 159, label: '品红色混凝土' },
  { name: 'minecraft:light_blue_concrete', r: 35, h: 137, b: 198, r_custom: 35, g: 137, label: '淡蓝色混凝土' },
  { name: 'minecraft:yellow_concrete', r: 200, g: 158, b: 28, label: '黄色混凝土' },
  { name: 'minecraft:lime_concrete', r: 94, g: 168, b: 24, label: '黄绿色混凝土' },
  { name: 'minecraft:pink_concrete', r: 213, g: 101, b: 142, label: '粉红色混凝土' },
  { name: 'minecraft:gray_concrete', r: 64, g: 67, b: 72, label: '灰色混凝土' },
  { name: 'minecraft:light_gray_concrete', r: 125, g: 125, b: 115, label: '淡灰色混凝土' },
  { name: 'minecraft:cyan_concrete', r: 21, g: 119, b: 136, label: '青色混凝土' },
  { name: 'minecraft:purple_concrete', r: 100, g: 31, b: 156, label: '紫色混凝土' },
  { name: 'minecraft:blue_concrete', r: 44, g: 46, b: 143, label: '蓝色混凝土' },
  { name: 'minecraft:brown_concrete', r: 96, g: 59, b: 31, label: '棕色混凝土' },
  { name: 'minecraft:green_concrete', r: 73, g: 91, b: 36, label: '绿色混凝土' },
  { name: 'minecraft:red_concrete', r: 142, g: 32, b: 32, label: '红色混凝土' },
  { name: 'minecraft:black_concrete', r: 8, g: 10, b: 15, label: '黑色混凝土' }
];

// 修复 RGB 访问映射
CONCRETE_PALETTE[4].r = 35; // 补全淡蓝色混凝土

function findNearestBlock(r: number, g: number, b: number, a: number): number {
  if (a < 60) return 0; // 透明像素判定为空气
  
  let minDist = Infinity;
  let nearestIdx = 1;

  for (let i = 1; i < CONCRETE_PALETTE.length; i++) {
    const p = CONCRETE_PALETTE[i];
    const dist = Math.pow(r - p.r, 2) + Math.pow(g - p.g, 2) + Math.pow(b - p.b, 2);
    if (dist < minDist) {
      minDist = dist;
      nearestIdx = i;
    }
  }
  return nearestIdx;
}

// 封装 NBT 字节序列化
function writeLitematic(width: number, height: number, blocks: number[], palette: string[]): Uint8Array {
  const writer = new NbtWriter();
  writer.writeHeader(10, ""); // TAG_Compound
  
  writer.writeHeader(3, "Version");
  writer.writeInt(6); // 默认 V6
  
  writer.writeHeader(3, "MinecraftDataVersion");
  writer.writeInt(3463); // 1.20.1

  writer.writeHeader(10, "Metadata");
  writer.writeHeader(8, "Author"); writer.writeString("XCloudWiki");
  writer.writeHeader(8, "Description"); writer.writeString("Generated Pixel Art");
  writer.writeHeader(10, "EnclosingSize");
  writer.writeHeader(3, "x"); writer.writeInt(width);
  writer.writeHeader(3, "y"); writer.writeInt(1);
  writer.writeHeader(3, "z"); writer.writeInt(height);
  writer.writeByte(0);
  writer.writeHeader(8, "Name"); writer.writeString("pixel_art");
  writer.writeHeader(3, "RegionCount"); writer.writeInt(1);
  writer.writeHeader(4, "TimeCreated"); writer.writeLong(0, Math.floor(Date.now() / 1000));
  writer.writeHeader(4, "TimeModified"); writer.writeLong(0, Math.floor(Date.now() / 1000));
  writer.writeHeader(3, "TotalBlocks");
  const nonAirCount = blocks.filter(b => b > 0).length;
  writer.writeInt(nonAirCount);
  writer.writeHeader(3, "TotalVolume"); writer.writeInt(width * height);
  writer.writeByte(0); // Metadata end

  writer.writeHeader(10, "Regions");
  writer.writeHeader(10, "pixel_art");
  writer.writeHeader(10, "Position");
  writer.writeHeader(3, "x"); writer.writeInt(0);
  writer.writeHeader(3, "y"); writer.writeInt(0);
  writer.writeHeader(3, "z"); writer.writeInt(0);
  writer.writeByte(0);
  writer.writeHeader(10, "Size");
  writer.writeHeader(3, "x"); writer.writeInt(width);
  writer.writeHeader(3, "y"); writer.writeInt(1);
  writer.writeHeader(3, "z"); writer.writeInt(height);
  writer.writeByte(0);

  // Palette List of Compound
  writer.writeHeader(9, "BlockStatePalette");
  writer.writeByte(10);
  writer.writeInt(palette.length);
  for (const blockName of palette) {
    writer.writeHeader(8, "Name");
    writer.writeString(blockName);
    writer.writeByte(0);
  }

  // Bit Packing BlockStates
  const bitsPerBlock = Math.max(2, Math.ceil(Math.log2(palette.length)));
  const blocksPerLong = Math.floor(64 / bitsPerBlock);
  const blockCount = width * height;
  const longCount = Math.ceil(blockCount / blocksPerLong);

  writer.writeHeader(12, "BlockStates");
  writer.writeInt(longCount);

  for (let i = 0; i < longCount; i++) {
    const bits = new Array(64).fill(0);
    for (let b = 0; b < blocksPerLong; b++) {
      const blockIdx = i * blocksPerLong + b;
      if (blockIdx >= blockCount) break;
      const paletteValue = blocks[blockIdx];
      const bitOffset = b * bitsPerBlock;
      for (let bit = 0; bit < bitsPerBlock; bit++) {
        bits[bitOffset + bit] = (paletteValue >> bit) & 1;
      }
    }
    let high = 0;
    let low = 0;
    for (let bit = 0; bit < 32; bit++) {
      low |= (bits[bit] << bit);
      high |= (bits[bit + 32] << bit);
    }
    writer.writeLong(high, low);
  }

  writer.writeByte(0); // Region end
  writer.writeByte(0); // Regions end
  writer.writeByte(0); // Root end
  return writer.getUint8Array();
}

// ================= 1. 投影版本转换器组件 =================
export function ProjectorConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [detectedVersion, setDetectedVersion] = useState<number | null>(null);
  const [targetVersion, setTargetVersion] = useState<number>(7);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawDataRef = useRef<Uint8Array | null>(null);

  const processFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.litematic')) {
      setStatus('error');
      setErrorMsg('非法文件类型！仅支持解析 .litematic 格式的投影文件。');
      return;
    }
    setFile(selectedFile);
    setStatus('parsing');
    setErrorMsg('');
    setUrl('');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);
      rawDataRef.current = fileData;
      let decompressed: Uint8Array;
      try {
        decompressed = gunzipSync(fileData);
      } catch (err) {
        throw new Error('Gzip 解压失败。这可能不是一个合法的 Gzip 压缩投影文件，或文件已损坏。');
      }
      const pattern = new Uint8Array([0x03, 0x00, 0x07, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e]);
      let index = -1;
      for (let i = 0; i <= decompressed.length - pattern.length; i++) {
        let match = true;
        for (let j = 0; j < pattern.length; j++) {
          if (decompressed[i + j] !== pattern[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          index = i;
          break;
        }
      }
      if (index === -1) {
        throw new Error('在投影文件中未检索到格式版本 (Version) 信息。请检查文件是否由 Litematica 正确生成。');
      }
      const valStart = index + pattern.length;
      const currentVersion = (decompressed[valStart] << 24) |
                             (decompressed[valStart + 1] << 16) |
                             (decompressed[valStart + 2] << 8) |
                             decompressed[valStart + 3];
      setDetectedVersion(currentVersion);
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || '解析投影文件时发生未知错误。');
      setFile(null);
      setDetectedVersion(null);
    }
  };

  const handleConvert = () => {
    if (!file || !rawDataRef.current) return;
    setStatus('parsing');
    try {
      const fileData = rawDataRef.current;
      const decompressed = gunzipSync(fileData);
      const pattern = new Uint8Array([0x03, 0x00, 0x07, 0x56, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e]);
      let index = -1;
      for (let i = 0; i <= decompressed.length - pattern.length; i++) {
        let match = true;
        for (let j = 0; j < pattern.length; j++) {
          if (decompressed[i + j] !== pattern[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          index = i;
          break;
        }
      }
      if (index === -1) throw new Error('修改时发生异常：未定位到 Version 数据偏移量。');
      const valStart = index + pattern.length;
      const modified = new Uint8Array(decompressed);
      modified[valStart] = (targetVersion >> 24) & 0xff;
      modified[valStart + 1] = (targetVersion >> 16) & 0xff;
      modified[valStart + 2] = (targetVersion >> 8) & 0xff;
      modified[valStart + 3] = targetVersion & 0xff;

      const compressed = gzipSync(modified);
      const blob = new Blob([compressed], { type: 'application/octet-stream' });
      const urlStr = URL.createObjectURL(blob);
      setUrl(urlStr);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || '重组数据并压缩时发生故障。');
    }
  };

  const handleReset = () => {
    setFile(null);
    setDetectedVersion(null);
    setStatus('idle');
    setErrorMsg('');
    setUrl('');
    rawDataRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all text-fd-foreground font-sans my-4">
      {status !== 'success' && !file && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] bg-fd-muted/5 ${
            dragActive ? 'border-fd-primary bg-fd-primary/5 scale-[1.01]' : 'border-fd-border hover:border-fd-primary/50 hover:bg-fd-muted/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".litematic"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <FileUp className={`w-10 h-10 mb-3 text-fd-muted-foreground/80 ${dragActive ? 'animate-bounce text-fd-primary' : ''}`} />
          <p className="text-sm font-bold text-fd-foreground mb-1">点击或拖拽 `.litematic` 投影文件至此处</p>
          <p className="text-xs text-fd-muted-foreground">支持跨 V4、V5、V6、V7 投影格式重组，秒级转换</p>
        </div>
      )}

      {status === 'parsing' && (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-fd-primary animate-spin mb-3" />
          <p className="text-xs text-fd-muted-foreground">正在进行本地解压和 NBT 重新编译，请稍候...</p>
        </div>
      )}

      {file && status !== 'parsing' && status !== 'success' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-fd-muted/30 border border-fd-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-[10px] text-fd-muted-foreground mb-0.5">文件名</span>
              <span className="text-sm font-extrabold text-fd-foreground truncate block">{file.name}</span>
            </div>
            <div>
              <span className="block text-[10px] text-fd-muted-foreground mb-0.5">检测到原版本</span>
              <span className="text-sm font-extrabold text-fd-foreground font-mono">
                {detectedVersion !== null ? (VERSION_MAP[detectedVersion] || `自定义 (Version: ${detectedVersion})`) : '未知'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-fd-muted-foreground mb-0.5">文件大小</span>
              <span className="text-sm font-extrabold text-fd-foreground font-mono">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="self-end justify-self-start md:justify-self-end">
              <button onClick={handleReset} className="px-3 py-1 rounded-lg border border-fd-border text-xs font-semibold hover:bg-fd-muted">
                重新选择文件
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-fd-muted-foreground uppercase mb-3 tracking-wider">选择目标转换版本</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {[4, 5, 6, 7].map((v) => {
                const isActive = targetVersion === v;
                return (
                  <button
                    key={v}
                    onClick={() => setTargetVersion(v)}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between min-h-[64px] ${
                      isActive 
                        ? 'bg-fd-primary/15 text-fd-primary border-fd-primary shadow-sm' 
                        : 'bg-fd-muted/30 hover:bg-fd-accent border-fd-border text-fd-foreground'
                    }`}
                  >
                    <span className="font-extrabold text-sm">{VERSION_MAP[v].split(' ')[0]}</span>
                    <span className={`text-[10px] mt-1 ${isActive ? 'text-fd-primary/80' : 'text-fd-muted-foreground'}`}>
                      {VERSION_MAP[v].substring(VERSION_MAP[v].indexOf('('))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {detectedVersion === targetVersion && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>当前检测版本与您的目标版本一致，转换可能不需要。</span>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={detectedVersion === null}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            开始本地版本重组转换
          </button>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h5 className="text-base font-extrabold text-fd-foreground">版本转换成功！</h5>
            <p className="text-xs text-fd-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              文件字节流已成功重构，最外层 NBT 已经成功迁移至 <strong>{VERSION_MAP[targetVersion]}</strong> 格式。
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-fd-muted/30 border border-fd-border/40 text-xs font-mono font-bold max-w-md mx-auto truncate text-fd-foreground">
            {file ? `${file.name.substring(0, file.name.lastIndexOf('.'))}_converted_to_v${targetVersion}.litematic` : ''}
          </div>
          <div className="flex gap-3 max-w-xs mx-auto pt-2">
            <button onClick={handleReset} className="flex-1 py-2.5 px-4 rounded-xl border border-fd-border hover:bg-fd-accent text-xs font-semibold">
              转换其他文件
            </button>
            <a
              href={url}
              download={file ? `${file.name.substring(0, file.name.lastIndexOf('.'))}_converted_to_v${targetVersion}.litematic` : 'converted.litematic'}
              className="flex-1 py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> 立即下载
            </a>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 space-y-3.5">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>转换失败</span>
          </div>
          <p className="font-semibold">{errorMsg}</p>
          <button onClick={handleReset} className="px-3.5 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-600 font-bold">
            重新上传
          </button>
        </div>
      )}

      <div className="mt-5 p-3.5 rounded-xl bg-fd-muted/20 border border-fd-border/30 flex items-start gap-2.5 text-xs text-fd-muted-foreground/90">
        <ShieldAlert className="w-4 h-4 text-fd-primary flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-fd-foreground block mb-0.5">🔒 浏览器本地安全保障：</strong>
          转换完全在本地浏览器内存中处理，绝对不上传文件至服务器，保障您的设计隐私。
        </div>
      </div>
    </div>
  );
}

// ================= 2. 像素画投影生成器组件 =================
export function PixelArtGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(64);
  const [height, setHeight] = useState<number>(64);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [maintainRatio, setMaintainRatio] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(true);
  
  const [useDither, setUseDither] = useState<boolean>(true);
  const [useSmooth, setUseSmooth] = useState<boolean>(false);
  const [useContrast, setUseContrast] = useState<boolean>(true);
  const [useChecker, setUseChecker] = useState<boolean>(false);

  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setStatus('error');
      setErrorMsg('非法文件类型！请上传图片文件（如 PNG, JPG）。');
      return;
    }
    setFile(selectedFile);
    setStatus('idle');
    setErrorMsg('');
    setUrl('');

    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
      imgElementRef.current = img;
      if (ratio >= 1) {
        setWidth(64);
        setHeight(Math.round(64 / ratio));
      } else {
        setWidth(Math.round(64 * ratio));
        setHeight(64);
      }
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const renderPreview = () => {
    const img = imgElementRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const floatBuffer = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      floatBuffer[i] = data[i];
    }

    if (useContrast) {
      const factor = 1.35;
      for (let i = 0; i < floatBuffer.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          floatBuffer[i + c] = Math.max(0, Math.min(255, (floatBuffer[i + c] - 128) * factor + 128));
        }
      }
    }

    if (useSmooth) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          for (let c = 0; c < 3; c++) {
            const sum = 
              floatBuffer[idx + c] * 0.4 +
              floatBuffer[idx - 4 + c] * 0.15 +
              floatBuffer[idx + 4 + c] * 0.15 +
              floatBuffer[idx - width * 4 + c] * 0.15 +
              floatBuffer[idx + width * 4 + c] * 0.15;
            floatBuffer[idx + c] = sum;
          }
        }
      }
    }

    const blocks: number[] = new Array(width * height);
    
    if (useDither) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          let r = floatBuffer[idx];
          let g = floatBuffer[idx + 1];
          let b = floatBuffer[idx + 2];
          const a = floatBuffer[idx + 3];

          if (useChecker && (x + y) % 2 === 0) {
            r = Math.max(0, Math.min(255, r * 1.08));
            g = Math.max(0, Math.min(255, g * 0.92));
          }

          const blockIdx = findNearestBlock(r, g, b, a);
          blocks[y * width + x] = blockIdx;

          if (blockIdx > 0) {
            const targetColor = CONCRETE_PALETTE[blockIdx];
            const errR = r - targetColor.r;
            const errG = g - targetColor.g;
            const errB = b - targetColor.b;

            const distribute = (nx: number, ny: number, w: number) => {
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = (ny * width + nx) * 4;
                floatBuffer[nIdx] = Math.max(0, Math.min(255, floatBuffer[nIdx] + errR * w));
                floatBuffer[nIdx + 1] = Math.max(0, Math.min(255, floatBuffer[nIdx + 1] + errG * w));
                floatBuffer[nIdx + 2] = Math.max(0, Math.min(255, floatBuffer[nIdx + 2] + errB * w));
              }
            };

            distribute(x + 1, y,     7 / 16);
            distribute(x - 1, y + 1, 3 / 16);
            distribute(x,     y + 1, 5 / 16);
            distribute(x + 1, y + 1, 1 / 16);
          }
        }
      }
    } else {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = floatBuffer[idx];
          const g = floatBuffer[idx + 1];
          const b = floatBuffer[idx + 2];
          const a = floatBuffer[idx + 3];
          blocks[y * width + x] = findNearestBlock(r, g, b, a);
        }
      }
    }

    const outputImgData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const blockIdx = blocks[y * width + x];
        const color = CONCRETE_PALETTE[blockIdx];
        const outIdx = (y * width + x) * 4;
        outputImgData.data[outIdx] = color.r;
        outputImgData.data[outIdx + 1] = color.g;
        outputImgData.data[outIdx + 2] = color.b;
        outputImgData.data[outIdx + 3] = blockIdx === 0 ? 0 : 255;
      }
    }
    ctx.putImageData(outputImgData, 0, 0);
    return blocks;
  };

  const handleGenerateArt = () => {
    if (!file || !imgElementRef.current) return;
    setStatus('generating');

    try {
      const blocks = renderPreview();
      if (!blocks) throw new Error('Canvas 渲染与像素化失败，请确认图片是否损坏。');
      const usedIndices = Array.from(new Set(blocks)).sort((a, b) => a - b);
      const palette = usedIndices.map(idx => CONCRETE_PALETTE[idx].name);
      const mappedBlocks = blocks.map(idx => usedIndices.indexOf(idx));
      const uncompressedNbt = writeLitematic(width, height, mappedBlocks, palette);
      const compressed = gzipSync(uncompressedNbt);
      
      const blob = new Blob([compressed], { type: 'application/octet-stream' });
      const urlStr = URL.createObjectURL(blob);
      setUrl(urlStr);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || '生成投影文件或 Gzip 压缩时发生故障。');
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    setUrl('');
    imgElementRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (file && imgElementRef.current) {
      const timer = setTimeout(() => {
        renderPreview();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [useDither, useSmooth, useContrast, useChecker, width, height, file]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainRatio && aspectRatio) {
      setHeight(Math.max(1, Math.round(val / aspectRatio)));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainRatio && aspectRatio) {
      setWidth(Math.max(1, Math.round(val * aspectRatio)));
    }
  };

  const getOutputFileName = () => {
    if (!file) return 'converted.litematic';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
    return `${baseName}_converted_to_v6.litematic`;
  };

  return (
    <div className="p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all text-fd-foreground font-sans my-4">
      {status !== 'success' && !file && (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] bg-fd-muted/5 ${
            dragActive ? 'border-fd-primary bg-fd-primary/5 scale-[1.01]' : 'border-fd-border hover:border-fd-primary/50 hover:bg-fd-muted/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
            className="hidden"
          />
          <ImageIcon className={`w-10 h-10 mb-3 text-fd-muted-foreground/80 ${dragActive ? 'animate-pulse text-fd-primary' : ''}`} />
          <p className="text-sm font-bold text-fd-foreground mb-1">点击或拖拽图片文件至此处</p>
          <p className="text-xs text-fd-muted-foreground">支持 PNG, JPG, WEBP 等常见图片格式</p>
        </div>
      )}

      {status === 'generating' && (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-fd-primary animate-spin mb-3" />
          <p className="text-xs text-fd-muted-foreground">正在解算色彩分布，生成本地 Litematica 二进制结构...</p>
        </div>
      )}

      {file && status !== 'generating' && status !== 'success' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-6 space-y-5">
              <div className="p-4 rounded-xl bg-fd-muted/20 border border-fd-border/50 space-y-3.5">
                <span className="block text-xs font-bold text-fd-muted-foreground uppercase tracking-wider">图片尺寸设置</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-fd-muted-foreground mb-1">宽度 (方块数)</label>
                    <input
                      type="number"
                      min={1}
                      max={512}
                      value={width || ''}
                      onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-sm text-fd-foreground focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-fd-muted-foreground mb-1">高度 (方块数)</label>
                    <input
                      type="number"
                      min={1}
                      max={512}
                      value={height || ''}
                      onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-fd-border bg-fd-background text-sm text-fd-foreground focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-fd-muted-foreground font-semibold">保持原图高宽比例</span>
                  <button
                    onClick={() => {
                      setMaintainRatio(!maintainRatio);
                      if (!maintainRatio && aspectRatio) {
                        setHeight(Math.max(1, Math.round(width / aspectRatio)));
                      }
                    }}
                    className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center ${
                      maintainRatio ? 'bg-fd-primary' : 'bg-fd-muted border border-fd-border'
                    }`}
                  >
                    <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute transition-transform ${maintainRatio ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="border border-fd-border/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-4 bg-fd-muted/30 hover:bg-fd-muted/50 flex justify-between items-center text-xs font-bold text-fd-foreground border-b border-fd-border/30 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-fd-primary" /> 高级选项设置
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showAdvanced && (
                  <div className="p-4 bg-fd-card/50 space-y-4 divide-y divide-fd-border/20">
                    <div className="flex items-center justify-between pt-1">
                      <div className="pr-3">
                        <span className="text-xs font-bold block text-fd-foreground">启用抖动算法</span>
                        <span className="text-[10px] text-fd-muted-foreground leading-relaxed">使用 Floyd-Steinberg 算法优化色彩过渡，减少色带</span>
                      </div>
                      <button
                        onClick={() => setUseDither(!useDither)}
                        className={`w-10 h-5.5 rounded-full flex-shrink-0 transition-colors relative flex items-center ${
                          useDither ? 'bg-fd-primary' : 'bg-fd-muted border border-fd-border'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute transition-transform ${useDither ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="pr-3">
                        <span className="text-xs font-bold block text-fd-foreground">智能优化</span>
                        <span className="text-[10px] text-fd-muted-foreground leading-relaxed">应用均值平滑模糊减少色彩斑驳噪点，让边缘自然</span>
                      </div>
                      <button
                        onClick={() => setUseSmooth(!useSmooth)}
                        className={`w-10 h-5.5 rounded-full flex-shrink-0 transition-colors relative flex items-center ${
                          useSmooth ? 'bg-fd-primary' : 'bg-fd-muted border border-fd-border'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute transition-transform ${useSmooth ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="pr-3">
                        <span className="text-xs font-bold block text-fd-foreground">增强对比度</span>
                        <span className="text-[10px] text-fd-muted-foreground leading-relaxed">图像色彩拉伸，使转换后的方块颜色对比更鲜明强烈</span>
                      </div>
                      <button
                        onClick={() => setUseContrast(!useContrast)}
                        className={`w-10 h-5.5 rounded-full flex-shrink-0 transition-colors relative flex items-center ${
                          useContrast ? 'bg-fd-primary' : 'bg-fd-muted border border-fd-border'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute transition-transform ${useContrast ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <div className="pr-3">
                        <span className="text-xs font-bold block text-fd-foreground">棋盘式混合</span>
                        <span className="text-[10px] text-fd-muted-foreground leading-relaxed">使用交错的棋盘格排列模拟中间过渡色</span>
                      </div>
                      <button
                        onClick={() => setUseChecker(!useChecker)}
                        className={`w-10 h-5.5 rounded-full flex-shrink-0 transition-colors relative flex items-center ${
                          useChecker ? 'bg-fd-primary' : 'bg-fd-muted border border-fd-border'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm absolute transition-transform ${useChecker ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleReset} 
                  className="flex-1 py-3 px-4 rounded-xl border border-fd-border text-xs font-extrabold text-fd-foreground hover:bg-fd-accent transition-all"
                >
                  放弃并返回
                </button>
                <button
                  onClick={handleGenerateArt}
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow transition-all"
                >
                  生成像素画投影文件
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-4 rounded-xl bg-fd-muted/30 border border-fd-border/50 flex flex-col items-center justify-center min-h-[300px] text-center">
                <span className="block text-xs font-bold text-fd-muted-foreground uppercase mb-3 tracking-wider self-start">
                  游戏内方块预览效果
                </span>
                <div className="relative border border-fd-border/80 rounded-lg p-1.5 bg-black/40 overflow-hidden shadow-inner max-w-full flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full object-contain"
                    style={{ imageRendering: 'pixelated', width: '320px', height: `${Math.round(320 / (aspectRatio || 1))}px` }}
                  />
                </div>
                <span className="text-xs text-fd-foreground/90 font-semibold mt-3 leading-relaxed">
                  已将图片网格按 <strong>{width} × {height}</strong> 比例采样成 <strong>{width * height}</strong> 个混凝土及空气方块。
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center py-8 space-y-4">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h5 className="text-base font-extrabold text-fd-foreground">像素画投影文件生成成功！</h5>
            <p className="text-xs text-fd-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
              成功将上传的图片色彩序列编码为 <strong>Litematica V6</strong> 格式。方块将在游戏内的 Y=0 水平层生成，可以直接导入并投影。
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-fd-muted/30 border border-fd-border/40 text-xs font-mono font-bold max-w-md mx-auto truncate text-fd-foreground">
            {getOutputFileName()}
          </div>
          <div className="flex gap-3 max-w-xs mx-auto pt-2">
            <button onClick={handleReset} className="flex-1 py-2.5 px-4 rounded-xl border border-fd-border hover:bg-fd-accent text-xs font-semibold">
              生成其他像素画
            </button>
            <a
              href={url}
              download={getOutputFileName()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> 立即下载
            </a>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 space-y-3.5">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>生成失败</span>
          </div>
          <p className="font-semibold">{errorMsg}</p>
          <button onClick={handleReset} className="px-3.5 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-600 font-bold">
            重新选择图片
          </button>
        </div>
      )}

      <div className="mt-5 p-3.5 rounded-xl bg-fd-muted/20 border border-fd-border/30 flex items-start gap-2.5 text-xs text-fd-muted-foreground/90">
        <ShieldAlert className="w-4 h-4 text-fd-primary flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-fd-foreground block mb-0.5">🔒 浏览器本地安全保障：</strong>
          图片色彩映射与 NBT 二进制打包完全在本地处理，绝对不上传服务器，保护您的设计版权。
        </div>
      </div>
    </div>
  );
}
