// src/components/AIChat/AIChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './AIChat.module.css';
import type { Message, AIChatProps } from './types';
import { graphqlClient } from '../../services/graphqlClient';

const AIChat: React.FC<AIChatProps> = ({ 
  onSendMessage, 
  placeholder = "输入你的问题...",
  provider = 'deepseek'  // 默认使用 DeepSeek
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'deepseek'>(provider);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let response: string;
      
      // 如果提供了自定义的 onSendMessage，使用它
      if (onSendMessage) {
        response = await onSendMessage(userMessage.content);
      } else {
        // 否则使用 GraphQL 客户端
        try {
          // 首选：使用智能 AI（支持故障转移）
          response = await graphqlClient.askAI(userMessage.content, selectedProvider);
        } catch (error) {
          console.error(`${selectedProvider} failed, trying direct DeepSeek...`);
          // 备选：直接调用 DeepSeek
          try {
            response = await graphqlClient.askDeepSeek(userMessage.content);
          } catch (deepseekError) {
            console.error('DeepSeek also failed:', deepseekError);
            throw deepseekError;
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}。请稍后再试。`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 渲染消息内容，支持 Markdown
  const renderMessageContent = (message: Message) => {
    if (message.role === 'user') {
      // 用户消息保持纯文本
      return <div className={styles.messageText}>{message.content}</div>;
    }
    
    // AI 消息使用 Markdown 渲染
    return (
      <div className={styles.messageMarkdown}>
        <ReactMarkdown
          components={{
            // 自定义代码块渲染
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !className;
              
              return isInline ? (
                <code className={styles.inlineCode} {...rest}>
                  {children}
                </code>
              ) : (
                <pre className={styles.codeBlock}>
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </pre>
              );
            },
            // 确保链接在新窗口打开
            a(props) {
              return (
                <a {...props} target="_blank" rel="noopener noreferrer">
                  {props.children}
                </a>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        {/* 添加提供商选择器（可选） */}
        <div className={styles.providerSelector}>
          <button
            className={`${styles.providerButton} ${selectedProvider === 'deepseek' ? styles.active : ''}`}
            onClick={() => setSelectedProvider('deepseek')}
          >
            DeepSeek
          </button>
          <button
            className={`${styles.providerButton} ${selectedProvider === 'openai' ? styles.active : ''}`}
            onClick={() => setSelectedProvider('openai')}
          >
            OpenAI
          </button>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div className={styles.messageContent}>
                {renderMessageContent(message)}
              </div>
              <div className={styles.messageTime}>
                {message.timestamp.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageContent}>
                <div className={styles.loading}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!inputValue.trim() || isLoading}
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;