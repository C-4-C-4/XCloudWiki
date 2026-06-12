'use client';
import type { Tool, UIMessage } from 'ai';

export type ChatUIMessage = UIMessage;
export type SearchTool = Tool<{ query: string; limit: number }>;
