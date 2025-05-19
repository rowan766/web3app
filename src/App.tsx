// src/App.tsx
import AIChat from './components/AIChat/AIChat';

import AgentPage from './components/agentPage/codeRevi'

function App() {
  return (
    <div className="App">
      {/* 使用默认的 DeepSeek 提供商 */}
      {/* <AIChat /> */}
      
      {/* 或者明确指定提供商 */}
      {/* <AIChat provider="deepseek" /> */}
      <AgentPage></AgentPage>
      
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