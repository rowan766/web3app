// src/components/AIChat/types.ts
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface AIChatProps {
  onSendMessage?: (message: string) => Promise<string>;
  placeholder?: string;
  provider?: 'openai' | 'deepseek';
}