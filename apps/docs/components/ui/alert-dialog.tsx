'use client';

import { useEffect, type ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { buttonVariants } from './button';
import { cn } from '@/lib/cn';

export type AlertDialogVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const VARIANT_STYLES: Record<AlertDialogVariant, { icon: typeof AlertTriangle; iconColor: string; iconBg: string; accentBtn: string }> = {
  default: {
    icon: Info,
    iconColor: 'text-fd-primary',
    iconBg: 'bg-fd-primary/10',
    accentBtn: 'bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    accentBtn: 'bg-emerald-500 text-white hover:bg-emerald-500/90',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    accentBtn: 'bg-amber-500 text-white hover:bg-amber-500/90',
  },
  danger: {
    icon: AlertCircle,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    accentBtn: 'bg-red-500 text-white hover:bg-red-500/90',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    accentBtn: 'bg-blue-500 text-white hover:bg-blue-500/90',
  },
};

export interface AlertDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  variant?: AlertDialogVariant;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AlertDialog({
  open,
  title,
  description,
  variant = 'default',
  confirmText = '确定',
  cancelText = '取消',
  showCancel = false,
  loading = false,
  onConfirm,
  onCancel,
}: AlertDialogProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm mx-4 bg-fd-card border border-fd-border rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onCancel}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent transition-colors z-10 disabled:opacity-50"
            >
              <X className="size-4" />
            </button>

            <div className="p-6 md:p-7">
              <div className={`inline-flex p-3 rounded-xl ${styles.iconBg} ${styles.iconColor} mb-4`}>
                <Icon className="size-6" />
              </div>

              <h3 className="text-lg font-bold text-fd-foreground">{title}</h3>
              {description && (
                <p className="text-sm text-fd-muted-foreground mt-2 leading-relaxed">
                  {description}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-fd-border">
                {showCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }), styles.accentBtn)}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
