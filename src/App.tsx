// src/App.tsx
import React from 'react';
import AIChat from './components/AIChat/AIChat';

function App() {
  return (
    <div className="App">
      <h1>AI Chat Demo</h1>
      {/* 使用默认的 DeepSeek 提供商 */}
      {/* <AIChat /> */}
      
      {/* 或者明确指定提供商 */}
      <AIChat provider="deepseek" />
      
      {/* 或者提供自定义的消息处理函数 */}
      {/* <AIChat 
        onSendMessage={async (message) => {
          // 自定义处理逻辑
          return `自定义响应: ${message}`;
        }}
      /> */}
    </div>
  );
}

export default App;