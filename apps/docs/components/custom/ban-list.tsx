"use client";

import React, { useState } from 'react';
import { Skull, Zap, Flame, Swords, Package, AlertTriangle, Calendar } from 'lucide-react';

interface BanItem {
  no: string;
  name: string;
  type: 'permanent' | 'temporary';
  typeName: string;
  avatar: 'skull' | 'zap' | 'flame' | 'swords' | 'package' | 'alert';
  reason: string;
  desc: string;
  date: string;
}

const banData: BanItem[] = [
  {
    no: "01",
    name: "MengNan66666",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'skull',
    reason: "刷取 · 隐匿物资",
    desc: "利用 BUG 刷取并隐匿巨量珍贵物资",
    date: "2024 年 12 月 21 日"
  },
  {
    no: "02",
    name: "kongbai1213",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'skull',
    reason: "刷取 · 隐匿物资",
    desc: "利用 BUG 刷取并隐匿巨量珍贵物资",
    date: "2024 年 12 月 21 日"
  },
  {
    no: "03",
    name: "Logos114514",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'skull',
    reason: "刷取 · 隐匿物资",
    desc: "利用 BUG 刷取并隐匿巨量珍贵物资",
    date: "2024 年 12 月 21 日"
  },
  {
    no: "04",
    name: "ykk",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'zap',
    reason: "考古外挂 · 作弊刷取",
    desc: "使用非法的考古作弊外挂手段，刷取大量附魔之眼",
    date: "2024 年 7 月"
  },
  {
    no: "05",
    name: "shijia",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'flame',
    reason: "超高载荷建筑",
    desc: "在四区违规建造超高载荷刷怪塔，经警告后仍不整改",
    date: "2024 年 8 月 30 日"
  },
  {
    no: "06",
    name: "Long_i",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'swords',
    reason: "领地侵占 · 恶意击杀",
    desc: "强行抢占他人领地、在出生点恶意围杀新人等多项恶劣行为",
    date: "2024 年 6 月"
  },
  {
    no: "07",
    name: "Polaris",
    type: 'permanent',
    typeName: "永久封禁",
    avatar: 'package',
    reason: "盗窃 · 消极逃避",
    desc: "恶意盗窃他人箱子内物资，并对处罚消极应对、装死逃避",
    date: "2024 年 5 月"
  },
  {
    no: "08",
    name: "20091209",
    type: 'temporary',
    typeName: "暂封7天",
    avatar: 'alert',
    reason: "主城区袭击",
    desc: "于主城区违规使用火箭弹烟花，大范围轰击袭击其他玩家",
    date: "2023 年 9 月 16 日"
  },
  {
    no: "09",
    name: "hanxue_",
    type: 'temporary',
    typeName: "暂封7天",
    avatar: 'alert',
    reason: "欺诈 · 诱导新手",
    desc: "利用欺诈手段多次骗取新手玩家金币，情节恶劣，清空所得补偿受害者",
    date: "2026 年 6 月 2 日"
  },
  {
    no: "10",
    name: "M1Ne1Ga",
    type: 'temporary',
    typeName: "暂封1天",
    avatar: 'alert',
    reason: "侮辱谩骂",
    desc: "违反《服务器聊天规范》第 2-2 条“侮辱谩骂”",
    date: "2026 年 6 月 2 日"
  }
];

export function BanList() {
  const [filter, setFilter] = useState<'all' | 'permanent' | 'temporary'>('all');

  const filteredData = banData.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case 'skull':
        return <Skull className="w-5 h-5 text-fd-muted-foreground" />;
      case 'zap':
        return <Zap className="w-5 h-5 text-fd-muted-foreground" />;
      case 'flame':
        return <Flame className="w-5 h-5 text-fd-muted-foreground" />;
      case 'swords':
        return <Swords className="w-5 h-5 text-fd-muted-foreground" />;
      case 'package':
        return <Package className="w-5 h-5 text-fd-muted-foreground" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-fd-muted-foreground" />;
      default:
        return <Skull className="w-5 h-5 text-fd-muted-foreground" />;
    }
  };

  return (
    <div className="ban-list-container">
      {/* 筛选过滤按钮组 */}
      <div className="ban-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部 ({banData.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'permanent' ? 'active' : ''}`}
          onClick={() => setFilter('permanent')}
        >
          永久封禁 ({banData.filter(i => i.type === 'permanent').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'temporary' ? 'active' : ''}`}
          onClick={() => setFilter('temporary')}
        >
          临时封禁 ({banData.filter(i => i.type === 'temporary').length})
        </button>
      </div>

      {/* 简洁无高发光的卡片网格 */}
      <div className="ban-grid">
        {filteredData.map(item => (
          <div key={item.no} className="ban-card">
            {/* 卡片顶栏 */}
            <div className="ban-card-header">
              <span className="ban-no">NO.{item.no}</span>
              <span className={`ban-badge ${item.type}`}>
                {item.typeName}
              </span>
            </div>

            {/* 用户与违规分类 */}
            <div className="ban-user-section">
              <div className="ban-avatar-box">
                {renderIcon(item.avatar)}
              </div>
              <div className="ban-info-box">
                <h4 className="ban-username">{item.name}</h4>
                <span className="ban-reason-tag">{item.reason}</span>
              </div>
            </div>

            {/* 违规事实 */}
            <div className="ban-desc-box">
              {item.desc}
            </div>

            {/* 处罚时间底栏 */}
            <div className="ban-footer">
              <Calendar className="w-3.5 h-3.5" />
              <span>处罚发布时间：{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .ban-list-container {
          margin-top: 1.5rem;
        }

        .ban-filters {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--color-fd-border, rgba(255, 255, 255, 0.08));
          padding-bottom: 0.75rem;
        }

        .filter-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-fd-muted-foreground, #9ca3af);
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--color-fd-foreground, #ffffff);
          background: rgba(255, 255, 255, 0.03);
        }

        .filter-btn.active {
          color: var(--color-fd-primary, #3b82f6);
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .ban-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.25rem;
        }

        @media (min-width: 768px) {
          .ban-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .ban-card {
          background: var(--color-fd-card, rgba(20, 20, 25, 0.5));
          border: 1px solid var(--color-fd-border, rgba(255, 255, 255, 0.06));
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: all 0.2s ease;
        }

        .ban-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-fd-primary, rgba(59, 130, 246, 0.3));
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .ban-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ban-no {
          font-size: 0.75rem;
          font-weight: 700;
          font-family: monospace;
          color: var(--color-fd-muted-foreground, #9ca3af);
          letter-spacing: 0.5px;
        }

        .ban-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
        }

        .ban-badge.permanent {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
        }

        .ban-badge.temporary {
          background: rgba(234, 179, 8, 0.08);
          color: #eab308;
          border: 1px solid rgba(234, 179, 8, 0.15);
        }

        .ban-user-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ban-avatar-box {
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-fd-border, rgba(255, 255, 255, 0.06));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ban-info-box {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
          text-align: left;
        }

        .ban-username {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-fd-foreground, #ffffff);
          margin: 0 !important;
          line-height: 1.2;
        }

        .ban-reason-tag {
          font-size: 0.75rem;
          color: var(--color-fd-muted-foreground, #9ca3af);
        }

        .ban-desc-box {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--color-fd-foreground, #e5e7eb);
          border-left: 2.5px solid var(--color-fd-border, rgba(255, 255, 255, 0.15));
          text-align: left;
        }

        .ban-footer {
          border-top: 1px dashed var(--color-fd-border, rgba(255, 255, 255, 0.05));
          padding-top: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--color-fd-muted-foreground, #9ca3af);
          margin-top: auto;
          text-align: left;
        }
      `}</style>
    </div>
  );
}
