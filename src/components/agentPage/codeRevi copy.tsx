import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import './codeRevi.css';

// 定义数据类型
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface WorkerResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// Cloudflare Worker 服务组件
const CodeRevi: React.FC = () => {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 你好！我是 Cloudflare Worker 服务助手。' }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Cloudflare Worker 地址
  const WORKER_URL = 'https://mastra-workers.row287630.workers.dev';

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 调用 Cloudflare Worker
  const callWorkerService = async (message: string): Promise<WorkerResponse> => {
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          // 可以添加其他需要传递的参数
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Worker service:', error);
      return {
        success: false,
        message: '服务调用失败，请稍后再试'
      };
    }
  };

  // 处理表单提交
  const handleSubmit = async (): Promise<void> => {
    if (!input.trim()) return;

    // 用户消息
    const userMessage: Message = { role: 'user', content: input };
    
    // 更新UI，显示用户消息
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 调用 Cloudflare Worker 服务
      const workerResponse = await callWorkerService(input);

      // 更新UI，显示服务回答
      if (workerResponse.success) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            role: 'assistant', 
            content: workerResponse.data?.response || '收到了服务的响应，但没有具体内容' 
          }
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            role: 'assistant', 
            content: workerResponse.message || '服务处理请求时发生了错误' 
          }
        ]);
      }
    } catch (error) {
      console.error('Error in request flow:', error);
      // 显示错误消息
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: '抱歉，发生了错误。请稍后再试。' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  // 处理按键事件
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Cloudflare Worker 助手</h2>
      </div>

      {/* 聊天消息区域 */}
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>开始和Worker助手对话吧！</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content loading">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题..."
          disabled={isLoading}
          className="chat-input"
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()} 
          className="send-button"
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default CodeRevi;