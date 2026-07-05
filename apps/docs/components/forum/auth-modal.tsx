'use client';

/**
 * 登录/注册弹窗组件 (带精致动画)
 */

import { useState, type FormEvent } from 'react';
import { X, Gamepad2, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiLogin, apiRegister } from './api';
import { useAuth } from './auth-context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [gameId, setGameId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!gameId.trim() || !password) {
      setError('请填写所有字段');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('两次密码不一致');
      return;
    }

    setIsSubmitting(true);

    const apiFn = mode === 'login' ? apiLogin : apiRegister;
    const { data, error: apiError } = await apiFn(gameId.trim(), password);

    setIsSubmitting(false);

    if (apiError || !data) {
      setError(apiError || '操作失败');
      return;
    }

    login(data.token, data.user);
    onClose();
    setGameId('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setConfirmPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md mx-4 bg-fd-card border border-fd-border rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors z-10"
            >
              <X className="size-4" />
            </button>

            <div className="p-6 md:p-8">
              {/* 标题 */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-fd-foreground">
                  {mode === 'login' ? '登录论坛' : '注册账户'}
                </h2>
                <p className="text-xs text-fd-muted-foreground mt-1.5">
                  {mode === 'login' ? '使用游戏 ID 登录你的账户' : '使用游戏 ID 创建新账户'}
                </p>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'login' ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'login' ? 12 : -12 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-fd-foreground mb-1.5">游戏 ID</label>
                      <div className="relative">
                        <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
                        <input
                          type="text"
                          value={gameId}
                          onChange={(e) => setGameId(e.target.value)}
                          placeholder="输入你的游戏 ID"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all text-sm"
                          maxLength={32}
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-fd-foreground mb-1.5">密码</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="输入密码"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all text-sm"
                          maxLength={64}
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                      </div>
                    </div>

                    {mode === 'register' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-xs font-medium text-fd-foreground mb-1.5">确认密码</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground" />
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="再次输入密码"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-fd-border bg-fd-background text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary/20 focus:border-fd-primary transition-all text-sm"
                            maxLength={64}
                            autoComplete="new-password"
                          />
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5"
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-xl bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          处理中...
                        </>
                      ) : mode === 'login' ? (
                        '登录'
                      ) : (
                        '注册'
                      )}
                    </button>
                  </motion.div>
                </AnimatePresence>
              </form>

              {/* 切换模式 */}
              <div className="mt-6 text-center text-xs text-fd-muted-foreground">
                {mode === 'login' ? (
                  <>
                    还没有账户？{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-fd-primary hover:underline font-medium transition-colors"
                    >
                      立即注册
                    </button>
                  </>
                ) : (
                  <>
                    已有账户？{' '}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="text-fd-primary hover:underline font-medium transition-colors"
                    >
                      去登录
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
