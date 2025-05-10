// App.tsx
import AIChat from './components/AIChat/AIChat'
import './App.css'

function App() {
  // 模拟 AI 响应的函数
  const handleSendMessage = async (message: string): Promise<string> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 这里你可以调用真实的 AI API
    // const response = await fetch('your-ai-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message })
    // });
    // const data = await response.json();
    // return data.reply;
    
    // 模拟响应
    return `这是对"${message}"的回答。在实际应用中，你需要连接到真实的 AI API，比如 OpenAI、Claude API 等。`;
  };

  return (
    <div className="app">
      <h1>AI 问答助手</h1>
      <AIChat 
        onSendMessage={handleSendMessage}
        placeholder="问我任何问题..."
      />
    </div>
  )
}

export default App