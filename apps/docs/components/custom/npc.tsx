'use client';

import React, { useState } from 'react';

// NPC 坐标及描述列表
const NPC_DATA = [
  { name: '经验池', icon: '🌊', coord: '-193 75 6', tp: '/res tp jingyanchi', desc: '挂机获取经验瓶升级职业' },
  { name: '新手签到', icon: '📋', coord: '-62 74 20', tp: '/res tp qiandao', desc: '每日福利与任务打卡' },
  { name: '成就大师', icon: '🏆', coord: '-54 73 -3', tp: '/res tp chengjiu', desc: '查看与兑换成就积分奖励' },
  { name: '维护补偿', icon: '🔧', coord: '-69 72 -2', tp: '/res tp buchang', desc: '领取服务器停机维护奖励' },
  { name: '致富乐/世界Boss', icon: '🎰', coord: '-100 73 22', tp: '/res tp zhifule', desc: '抽奖、挑战Boss与挑战转转乐' },
  { name: '渔夫', icon: '🎣', coord: '致富乐左侧临近', tp: '/res tp yufu', desc: '兑换鱼类、购买鱼竿及饲料' },
  { name: '贡献商店/拓展附魔', icon: '🏪', coord: '-115 72 38', tp: '/res tp gongxian', desc: '使用贡献币兑换特殊装备' },
  { name: '铁匠（升级武器）', icon: '⚒️', coord: '-133 72 16', tp: '/res tp tiejiang', desc: '升级、分解、镶嵌武器装备' },
  { name: '物品回收', icon: '♻️', coord: '铁匠对面', tp: '/res tp huishou', desc: '出售杂物给系统赚取金币' },
  { name: '好友邀请', icon: '👥', coord: '铁匠旁边', tp: '/res tp yaoqing', desc: '查看并接受好友绑定邀请' },
  { name: '神秘商店（巴斯克）', icon: '🧙', coord: '-130 72 -6', tp: '/res tp mysterious', desc: '随机售卖各种稀缺珍稀道具' },
  { name: 'B站兑换', icon: '📺', coord: '-115 72 -11', tp: '/res tp bilibili', desc: 'B站宣传视频及礼包码兑换' },
  { name: '扩展农作物', icon: '🌾', coord: 'B站后面', tp: '/res tp farming', desc: '买种子和星露谷农作物产出' },
  { name: '铭牌', icon: '🪧', coord: '-100 72 -36', tp: '/res tp mingpai', desc: '定制个性化聊天框和玩家列表铭牌' },
  { name: '赞助', icon: '💎', coord: '-121 72 54', tp: '/res tp zanzhu', desc: '支持服务器运行获取积分' },
  { name: '反映Bug', icon: '🐛', coord: '-140 72 -44', tp: '/res tp bug', desc: '提交游玩过程中的异常及漏洞反馈' },
  { name: '各类宝库', icon: '📦', coord: '-135 72 57', tp: '/res tp baoku', desc: '打开各色品质的活动宝箱' },
  { name: '头颅商人', icon: '💀', coord: '-231 75 -30', tp: '/res tp skull', desc: '购买玩家、怪物等各类装饰性头颅' },
  { name: '白嫖积分', icon: '⭐', coord: '-249 75 -30', tp: '/res tp free', desc: '每日做任务领取活跃积分' },
  { name: '家具及动物', icon: '🛋️', coord: '-212 75 -55', tp: '/res tp furniture', desc: '买装饰家具和宠物马等坐骑' },
];

export function NpcDirectory() {
  const [search, setSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredNpc = NPC_DATA.filter(
    (npc) =>
      npc.name.toLowerCase().includes(search.toLowerCase()) ||
      npc.desc.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="my-6 p-6 rounded-2xl border border-fd-border bg-fd-card shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h4 className="text-base font-bold text-fd-foreground">📍 主城 NPC 快捷查找手册</h4>
        <input
          type="text"
          placeholder="搜索 NPC 名字或功能..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-fd-border bg-fd-background text-xs text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary max-w-xs w-full"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
        {filteredNpc.length > 0 ? (
          filteredNpc.map((npc, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 p-3 rounded-xl bg-fd-muted border border-fd-border hover:bg-fd-accent/10 transition-colors"
            >
              <div className="flex gap-2 flex-1 min-w-0">
                <span className="text-lg shrink-0">{npc.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-fd-foreground leading-none mb-1 flex items-center gap-1.5">
                    <span>{npc.name}</span>
                  </div>
                  <span className="block text-[10px] text-fd-muted-foreground truncate mb-1.5">{npc.desc}</span>
                  <div className="flex flex-wrap gap-1 font-mono text-[9px]">
                    <span className="px-1.5 py-0.5 rounded bg-fd-card border border-fd-border text-fd-foreground">
                      XYZ: {npc.coord}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => copyToClipboard(npc.tp, idx)}
                  className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${
                    copiedId === idx
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                      : 'bg-fd-card border-fd-border text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent'
                  }`}
                >
                  {copiedId === idx ? '✓ 已复制' : '复制 TP'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-xs text-fd-muted-foreground">
            没有找到匹配的 NPC，换个关键词试试吧 (✿◡‿◡)
          </div>
        )}
      </div>
    </div>
  );
}
