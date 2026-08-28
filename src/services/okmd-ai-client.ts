export interface OkmdMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OkmdChatCompletionRequest {
  model: string;
  messages: OkmdMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OkmdChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OkmdMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OkmdAiClient {
  private readonly baseUrl = 'https://gen.ai.kku.ac.th/okmd/api/v1';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API Key สำหรับ OKMD AI จำเป็นต้องระบุ');
    }
    this.apiKey = apiKey;
  }

  async createChatCompletion(request: OkmdChatCompletionRequest): Promise<OkmdChatCompletionResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    // Default model if not specified, aligning with the requirement
    const payload = {
      model: request.model || 'gemini-2.5-flash-lite',
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OKMD API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return (await response.json()) as OkmdChatCompletionResponse;
    } catch (error) {
      console.error(`[OkmdAiClient] ล้มเหลวในการเชื่อมต่อกับ OKMD AI:`, error);
      throw error;
    }
  }
}
