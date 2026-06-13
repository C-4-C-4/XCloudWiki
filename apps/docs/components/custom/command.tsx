'use client';

import React, { useState } from 'react';

const COMMON_COMMANDS = [
  { name: '创建领地', cmd: '/res create [领地名]', desc: '创建一个名为 [领地名] 的个人领地' },
  { name: '删除领地', cmd: '/res remove [领地名]', desc: '彻底删除并释放名为 [领地名] 的领地' },
  { name: '添加成员', cmd: '/res pset [领地名] [玩家名] trusted t', desc: '给 [玩家名] 授予你领地的所有基础信任权限' },
  { name: '移除成员', cmd: '/res pset [领地名] [玩家名] trusted f', desc: '取消该玩家在领地的所有授权信任' },
  { name: '设置传送点', cmd: '/res tpset', desc: '站在领地内输入，设置领地传送的目标点' },
  { name: '设置家点', cmd: '/sethome [家名称]', desc: '在你站立的位置建立一个名为 [家名称] 的家传送点' },
  { name: '回到家点', cmd: '/home [家名称]', desc: '瞬间传送回到你之前设置的 [家名称] 处' },
  { name: '请求传送', cmd: '/tpa [玩家名]', desc: '向 [玩家名] 发起瞬间传送请求，等待对方同意' },
  { name: '同意传送', cmd: '/tpaccept', desc: '同意其他人向你发起的传送请求' },
  { name: '回出生点', cmd: '/spawn', desc: '免费瞬间传送回闲云镇主城广场' },
];

export function CommandConsole() {
  const [selectedCmd, setSelectedCmd] = useState<typeof COMMON_COMMANDS[0]>(COMMON_COMMANDS[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCmd.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <h4 className="text-base font-bold text-fd-foreground mb-4">🖥️ 常用指令交互式终端</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 指令选择侧边栏 */}
        <div className="flex flex-col gap-1.5 md:col-span-1 max-h-64 overflow-y-auto pr-1">
          {COMMON_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCmd(item);
                setCopied(false);
              }}
              className={`px-3 py-2 text-left rounded-lg text-xs font-semibold transition-all border ${
                selectedCmd.name === item.name
                  ? 'bg-fd-primary text-fd-primary-foreground border-fd-primary shadow-sm'
                  : 'bg-fd-muted text-fd-muted-foreground border-fd-border hover:bg-fd-accent'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* 交互终端展示框 */}
        <div className="md:col-span-2 flex flex-col rounded-xl bg-zinc-950 border border-zinc-800 p-4 text-emerald-400 font-mono text-xs relative overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-3 text-zinc-500 font-sans font-bold">
            <span className="size-2.5 rounded-full bg-red-500" />
            <span className="size-2.5 rounded-full bg-yellow-500" />
            <span className="size-2.5 rounded-full bg-green-500" />
            <span className="ml-1 text-[10px]">Minecraft Command Shell</span>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <span className="text-zinc-500 font-sans"># 指令用途：</span>
              <p className="text-zinc-200 font-sans text-xs leading-relaxed mt-0.5">{selectedCmd.desc}</p>
            </div>
            <div>
              <span className="text-zinc-500"># 复制指令到剪贴板后，直接在游戏聊天框中粘贴 (Ctrl+V) 并执行：</span>
              <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg text-emerald-400 text-xs font-bold font-mono mt-1.5 break-all select-all flex items-center justify-between gap-3">
                <span>{selectedCmd.cmd}</span>
                <button
                  onClick={handleCopy}
                  className={`px-2.5 py-1 text-[10px] font-sans font-black rounded border transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
                  }`}
                >
                  {copied ? '✓ 已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
