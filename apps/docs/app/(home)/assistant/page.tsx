'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User, Loader2, HelpCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESETS = [
  {
    icon: '🎮',
    title: '版本与下载',
    question: '服务器当前的客户端版本是多少？如何下载整合包？',
  },
  {
    icon: '🔑',
    title: '账号绑定',
    question: '初次进入服务器如何进行账号绑定和验证？',
  },
  {
    icon: '⚔️',
    title: '武器强化',
    question: '铁匠系统如何强化我的“破晓者”武器？',
  },
  {
    icon: '👹',
    title: '世界 Boss',
    question: '服务器有哪些世界 Boss？伤害排名奖励机制是什么？',
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 从 LocalStorage 加载历史记录
  useEffect(() => {
    const saved = localStorage.getItem('xianyun_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // 初始欢迎消息
      setMessages([
        {
          role: 'assistant',
          content: '你好！我是闲云服务器专属 AI 助手。你可以问我关于服务器的任何问题，例如基本规则、新手教程、特色拓展系统等。我将基于服务器官方知识库为您解答。😊',
        },
      ]);
    }
  }, []);

  // 保持聊天记录到 LocalStorage
  const saveHistory = (newMsgs: Message[]) => {
    localStorage.setItem('xianyun_chat_history', JSON.stringify(newMsgs));
  };

  // 清除历史记录
  const clearHistory = () => {
    if (window.confirm('确定要清除所有聊天记录吗？')) {
      const initial: Message[] = [
        {
          role: 'assistant',
          content: '你好！我是闲云服务器专属 AI 助手。你可以问我关于服务器的任何问题，例如基本规则、新手教程、特色拓展系统等。我将基于服务器官方知识库为您解答。😊',
        },
      ];
      setMessages(initial);
      saveHistory(initial);
    }
  };

  // 发送消息
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput('');
    setIsLoading(true);
    setStatusText('闲云路由决策中...');

    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    saveHistory(newMessages);

    // 预设 AI 消息占位
    const assistantIndex = newMessages.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('网络请求异常');
      }

      setStatusText('智能思考中...');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamText = '';

      if (!reader) {
        throw new Error('未获取到流读取器');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const content = parsed.choices[0]?.delta?.content || '';
              streamText += content;

              // 渐进式更新最新那条 AI 回答的消息
              setMessages((prev) => {
                const updated = [...prev];
                if (updated[assistantIndex]) {
                  updated[assistantIndex] = { role: 'assistant', content: streamText };
                }
                return updated;
              });
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      // 流完成，存储到 LocalStorage
      setMessages((prev) => {
        saveHistory(prev);
        return prev;
      });

    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: 'assistant',
          content: '⚠️ 哎呀，助手开小差了，请检查网络并稍后重试！',
        };
        saveHistory(updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
      setStatusText('');
    }
  };

  // 辅助解析和渲染带有加粗和代码块样式的 Markdown 文本
  const renderMessageContent = (content: string) => {
    if (!content) {
      return (
        <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
          <span>{statusText || '正在思考中...'}</span>
        </div>
      );
    }

    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // 标题 3
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-cyan-400 mt-3 mb-1.5">{line.slice(4)}</h3>;
      }
      // 标题 2
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-cyan-400 mt-4 mb-2 border-b border-neutral-800 pb-1">{line.slice(3)}</h2>;
      }
      // 标题 1
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-cyan-400 mt-5 mb-2.5">{line.slice(2)}</h1>;
      }
      // 引用
      if (line.startsWith('> ')) {
        if (line.startsWith('> [!')) {
          const match = line.match(/^>\s+\[!(.*?)\](.*)$/);
          if (match) {
            const type = match[1].toUpperCase();
            const rest = match[2];
            let borderClass = 'border-cyan-500 bg-cyan-950/20 text-cyan-200';
            if (type === 'WARN' || type === 'WARNING') {
              borderClass = 'border-amber-500 bg-amber-950/20 text-amber-200';
            } else if (type === 'DANGER' || type === 'ERROR') {
              borderClass = 'border-rose-500 bg-rose-950/20 text-rose-200';
            }
            return (
              <div key={idx} className={`p-3 my-2 border-l-4 rounded-r-xl ${borderClass} text-xs md:text-sm`}>
                <strong>{type}</strong> {rest}
              </div>
            );
          }
        }
        return <blockquote key={idx} className="border-l-4 border-neutral-700 pl-3 italic text-neutral-400 my-2 text-sm">{line.slice(2)}</blockquote>;
      }
      // 无序列表
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="list-disc list-inside ml-2 my-1 text-neutral-300 text-sm md:text-base">{parseBoldAndCode(line.slice(2))}</li>;
      }
      // 有序列表
      const numListMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numListMatch) {
        return <li key={idx} className="list-decimal list-inside ml-2 my-1 text-neutral-300 text-sm md:text-base">{parseBoldAndCode(numListMatch[2])}</li>;
      }
      // 空行
      if (line.trim() === '') {
        return <div key={idx} className="h-3" />;
      }
      // 分割线
      if (line.trim() === '---') {
        return <hr key={idx} className="my-4 border-neutral-800" />;
      }
      // 普通段落
      return <p key={idx} className="text-neutral-300 leading-relaxed my-1.5 text-sm md:text-base">{parseBoldAndCode(line)}</p>;
    });
  };

  const parseBoldAndCode = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-xs font-mono text-cyan-300 border border-neutral-700">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-6 px-4 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
      
      {/* 渐变装饰背景球 */}
      <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 页面主标题 */}
      <div className="text-center z-10 mb-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            闲云 AI 智能助手
          </h1>
        </div>
        <p className="text-xs md:text-sm text-neutral-400 max-w-md">
          基于官方技能库为您提供精准、权威的解答，非知识库内容将不予作答。
        </p>
      </div>

      {/* 核心玻璃态聊天窗体 */}
      <div className="w-full max-w-4xl h-[650px] rounded-2xl border border-white/10 bg-neutral-950/40 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden z-10">
        
        {/* 窗体头部 */}
        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
                <Bot className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-neutral-950 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">闲云助手</div>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                <span>GLM-4.5-Air 模型驱动</span>
              </div>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            title="清除历史记录"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>清除聊天</span>
          </button>
        </div>

        {/* 聊天内容区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3.5 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* 头像 */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user'
                  ? 'bg-purple-950 border-purple-500/30'
                  : 'bg-cyan-950 border-cyan-500/30'
              }`}>
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-purple-400" />
                ) : (
                  <Bot className="h-4 w-4 text-cyan-400" />
                )}
              </div>

              {/* 气泡 */}
              <div className={`rounded-2xl px-4 py-3 text-sm flex flex-col border ${
                msg.role === 'user'
                  ? 'bg-purple-600/10 border-purple-500/20 text-white rounded-tr-none'
                  : 'bg-white/5 border-white/5 text-neutral-100 rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="space-y-1">
                    {renderMessageContent(msg.content)}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3.5 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 text-sm bg-white/5 border border-white/5 text-neutral-100">
                <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>{statusText || '正在思考中...'}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 预设提问和输入框底部容器 */}
        <div className="p-4 border-t border-white/5 bg-white/5 flex flex-col gap-4">
          
          {/* 预设问题 */}
          {messages.length <= 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.question)}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-left transition-all duration-200 group"
                  disabled={isLoading}
                >
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200">{preset.icon}</span>
                  <span className="text-xs font-semibold text-white">{preset.title}</span>
                  <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{preset.question}</span>
                </button>
              ))}
            </div>
          )}

          {/* 输入表单 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2.5 items-center relative"
          >
            <div className="flex-1 relative rounded-xl border border-white/10 bg-neutral-900/50 focus-within:border-cyan-500/50 focus-within:shadow-md focus-within:shadow-cyan-500/5 transition-all duration-200">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此向闲云助手提问关于服务器的规则与玩法..."
                className="w-full bg-transparent px-4 py-3.5 pr-10 text-sm text-white placeholder-neutral-500 focus:outline-none"
                disabled={isLoading}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <HelpCircle className="h-4 w-4 text-neutral-600" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3.5 rounded-xl font-medium text-white flex items-center justify-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:pointer-events-none active:scale-95 shadow-md shadow-purple-600/10"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">发送</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
