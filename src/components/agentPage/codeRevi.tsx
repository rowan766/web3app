import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { MastraClient } from '@mastra/client-js';
import './codeRevi.css';

// 定义类型
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 初始化Mastra客户端
const client = new MastraClient({
  baseUrl: 'https://mastra-workers.row287630.workers.dev',
});

// 聊天界面组件
const ChatInterface: React.FC = () => {
  // 存储对话历史
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 你好！我是Mastra CodeReview助手。' }
  ]);
  // 存储当前输入
  const [input, setInput] = useState<string>('');
  // 加载状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 引用聊天容器，用于自动滚动
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 获取代理引用
  const agent = client.getAgent('codeReviewerAgent'); // 替换为你的代理ID

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
      // 准备完整的对话历史
      const conversationHistory: Message[] = [...messages, userMessage];
      
      // 调用Mastra代理
      const response = await agent.generate({
        messages: conversationHistory,
      });

      // 更新UI，显示代理回答
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: response.text }
      ]);
    } catch (error) {
      console.error('Error getting response from agent:', error);
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
        <h2>Mastra AI 助手</h2>
      </div>

      {/* 聊天消息区域 */}
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>开始和AI助手对话吧！</p>
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

export default ChatInterface;