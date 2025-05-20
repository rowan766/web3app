import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { MastraClient } from '@mastra/client-js';
import ReactMarkdown from 'react-markdown';
import './codeRevi.css';

// 定义类型
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface CodeDiff {
  filename: string;
  changes: {
    type: 'added' | 'removed' | 'context';
    lineNumber: number;
    content: string;
  }[];
}

// 初始化Mastra客户端
const client = new MastraClient({
  baseUrl: 'https://mastra-workers.row287630.workers.dev'
});

// 聊天界面组件
const ChatInterface: React.FC = () => {
  // 存储对话历史
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '👋 你好！我是Mastra CodeReview助手。\n\n我可以帮助你：\n- 审查代码并找出潜在问题\n- 提供代码改进建议\n- 解释复杂的代码逻辑\n- 提供最佳实践建议\n\n请分享你想要审查的代码，或者提出关于代码的问题。',
      timestamp: getCurrentTime()
    }
  ]);

  // 存储当前输入
  const [input, setInput] = useState<string>('');
  // 加载状态
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 引用聊天容器，用于自动滚动
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // 代码审查模式
  const [reviewMode, setReviewMode] = useState<'chat' | 'diff'>('chat');
  // 当前审查的文件 - 修复：在代码差异头部显示此变量
  const [currentFile, setCurrentFile] = useState<string>('');
  // 模拟代码差异数据
  const [codeDiffs, setCodeDiffs] = useState<CodeDiff[]>([]);

  // 获取代理引用
  const agent = client.getAgent('codeReviewerAgent'); // 替换为你的代理ID

  // 获取当前时间
  function getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

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
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: getCurrentTime()
    };

    // 更新UI，显示用户消息
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 准备完整的对话历史
      const conversationHistory: Message[] = [...messages, userMessage];

      // 调用Mastra代理
      const response = await agent.generate({
        messages: conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content
        }))
      });

      // 检查是否包含代码审查内容（模拟）
      const containsCode = input.includes('```') || input.toLowerCase().includes('review') || input.toLowerCase().includes('审查') || input.toLowerCase().includes('代码');

      if (containsCode) {
        // 模拟生成代码差异
        generateMockCodeDiff(input);
      }

      // 更新UI，显示代理回答
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: response.text,
          timestamp: getCurrentTime()
        }
      ]);
    } catch (error) {
      console.error('Error getting response from agent:', error);
      // 显示错误消息
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: '抱歉，发生了错误。请稍后再试。',
          timestamp: getCurrentTime()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成模拟代码差异
  const generateMockCodeDiff = (input: string) => {
    // 从输入中提取代码块
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const matches = input.match(codeBlockRegex);

    if (matches && matches.length > 0) {
      const filename = 'example.js'; // 可以从输入中提取或者使用默认值
      setCurrentFile(filename);

      // 模拟代码差异数据
      const mockDiff: CodeDiff = {
        filename,
        changes: [
          { type: 'context', lineNumber: 1, content: 'function calculateTotal(items) {' },
          { type: 'context', lineNumber: 2, content: '  let total = 0;' },
          { type: 'removed', lineNumber: 3, content: '  for (var i = 0; i < items.length; i++) {' },
          { type: 'added', lineNumber: 3, content: '  for (let i = 0; i < items.length; i++) {' },
          { type: 'context', lineNumber: 4, content: '    total += items[i].price;' },
          { type: 'context', lineNumber: 5, content: '  }' },
          { type: 'removed', lineNumber: 6, content: '  return total;' },
          { type: 'added', lineNumber: 6, content: '  return total.toFixed(2);' },
          { type: 'context', lineNumber: 7, content: '}' }
        ]
      };

      setCodeDiffs([mockDiff]);
      setReviewMode('diff');
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

  // 切换查看模式
  const toggleViewMode = (): void => {
    setReviewMode(reviewMode === 'chat' ? 'diff' : 'chat');
  };

  // 渲染代码差异视图
  const renderCodeDiff = () => {
    if (codeDiffs.length === 0) {
      return (
        <div className="empty-state">
          <p>没有可用的代码差异。请分享一些代码进行审查。</p>
        </div>
      );
    }

    return codeDiffs.map((diff, index) => (
      <div key={index} className="code-diff">
        <div className="code-diff-header">{currentFile || diff.filename}</div>
        {diff.changes.map((change, lineIndex) => (
          <div key={lineIndex} className={`diff-line diff-${change.type}`}>
            <span className="diff-line-number">{change.lineNumber}</span>
            <span className="diff-line-content">
              <span className="diff-prefix">{change.type === 'added' ? '+ ' : change.type === 'removed' ? '- ' : '  '}</span>
              {change.content}
            </span>
          </div>
        ))}
      </div>
    ));
  };

  // 使用ReactMarkdown渲染消息内容
  const renderMessageContent = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          // 修复: 修复 ReactMarkdown 组件的类型问题
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline ? (
              <pre className={match ? `language-${match[1]}` : ''}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Mastra AI 代码审查助手</h2>
        {codeDiffs.length > 0 && (
          <button onClick={toggleViewMode} className="toolbar-button">
            {reviewMode === 'chat' ? '查看代码差异' : '返回聊天'}
          </button>
        )}
      </div>

      {/* 聊天消息或代码差异区域 */}
      {reviewMode === 'chat' ? (
        <div className="chat-messages" ref={chatContainerRef}>
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>开始和AI助手对话吧！</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
                <div className="message-content">
                  {renderMessageContent(message.content)}
                  {message.timestamp && <div className="message-meta">{message.timestamp}</div>}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="message assistant-message">
              <div className="message-content loading">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="chat-messages">{renderCodeDiff()}</div>
      )}

      {/* 工具栏 */}
      <div className="toolbar">
        <button className="toolbar-button">上传代码文件</button>
        <button className="toolbar-button">选择代码片段</button>
        <button className="toolbar-button">查看建议</button>
      </div>

      {/* 输入区域 */}
      <div className="chat-input-form">
        <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="输入你的问题或粘贴代码片段..." disabled={isLoading} className="chat-input" />
        <button onClick={handleSubmit} disabled={isLoading || !input.trim()} className="send-button">
          发送
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
