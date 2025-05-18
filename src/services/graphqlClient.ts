// src/services/graphqlClient.ts
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8787/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface DeepSeekResponse {
  deepseek: {
    content: string;
    model: string;
    provider: string;
  };
}

interface AskAIResponse {
  askAI: {
    content: string;
    model: string;
    provider: string;
  };
}

export const graphqlClient = {
  async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error('No data received from GraphQL server');
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  },

  // DeepSeek 查询
  async askDeepSeek(prompt: string): Promise<string> {
    const query = `
      query askDeepSeek($prompt: String!) {
        deepseek(prompt: $prompt) {
          content
          model
          provider
        }
      }
    `;

    const data = await this.query<DeepSeekResponse>(query, { prompt });
    return data.deepseek.content;
  },

  // 添加 askAI 方法
  async askAI(prompt: string, provider: 'openai'): Promise<string> {
    const query = `
      query askAI($prompt: String!, $provider: String) {
        askAI(prompt: $prompt, provider: $provider) {
          content
          model
          provider
        }
      }
    `;

    const data = await this.query<AskAIResponse>(query, { prompt, provider });
    return data.askAI.content;
  },
};