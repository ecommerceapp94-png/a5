import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AIMessage } from '@/types';
import { loadJSON, saveJSON, STORAGE_KEYS } from '@/utils/storage';
import { AI_GREETINGS, pseudoAIReply } from '@/components/ai/aiResponses';

interface AIAssistantContextValue {
  open: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  messages: AIMessage[];
  sending: boolean;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextValue | undefined>(undefined);

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadJSON<AIMessage[]>(STORAGE_KEYS.aiHistory, []);
      if (stored.length === 0) {
        const greetingIndex = Math.floor(Math.random() * AI_GREETINGS.length);
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text: AI_GREETINGS[greetingIndex],
            createdAt: Date.now(),
          },
        ]);
      } else {
        setMessages(stored);
      }
    })();
  }, []);

  useEffect(() => {
    saveJSON(STORAGE_KEYS.aiHistory, messages).catch(() => undefined);
  }, [messages]);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIMessage = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      role: 'user',
      text: text.trim(),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 700 + Math.random() * 600));
    const reply: AIMessage = {
      id: `assistant-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      role: 'assistant',
      text: pseudoAIReply(text, userMsg.createdAt),
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, reply]);
    setSending(false);
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  const value = useMemo<AIAssistantContextValue>(
    () => ({
      open,
      show: () => setOpen(true),
      hide: () => setOpen(false),
      toggle: () => setOpen((prev) => !prev),
      messages,
      send,
      sending,
      clear,
    }),
    [open, messages, sending, send, clear],
  );

  return <AIAssistantContext.Provider value={value}>{children}</AIAssistantContext.Provider>;
};

export function useAIAssistant(): AIAssistantContextValue {
  const ctx = useContext(AIAssistantContext);
  if (!ctx) throw new Error('useAIAssistant must be used inside AIAssistantProvider');
  return ctx;
}
