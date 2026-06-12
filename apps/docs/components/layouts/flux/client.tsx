'use client';
import {
  DocsLayout,
  DocsLayoutProps,
  NavigationPanel,
  NavigationPanelOverlay,
  NavigationPanelProps,
} from 'fumadocs-ui/layouts/flux';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function LayoutClient(props: DocsLayoutProps) {
  return (
    <DocsLayout
      {...props}
      renderNavigationPanel={(panel) => <CustomNavigationPanel {...panel} />}
    >
      {props.children}
    </DocsLayout>
  );
}

function CustomNavigationPanel(props: NavigationPanelProps) {
  const [mounted, setMounted] = useState(false);

  const variants = {
    show: {
      opacity: 1,
      y: 0,
    },
    hide: {
      opacity: 0,
      y: '100%',
    },
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NavigationPanel layout="size" {...props}>
      {(node) => (
        <AnimatePresence mode="popLayout">
          <motion.div
            key="content"
            variants={variants}
            initial={mounted && 'hide'}
            animate="show"
            exit="hide"
            transition={{ duration: 0.2 }}
          >
            {node}
          </motion.div>
        </AnimatePresence>
      )}
    </NavigationPanel>
  );
}
