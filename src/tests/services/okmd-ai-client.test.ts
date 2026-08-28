import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { OkmdAiClient, OkmdChatCompletionRequest } from "../../services/okmd-ai-client.js";

describe("OkmdAiClient", () => {
  const apiKey = "test-api-key";
  let client: OkmdAiClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    client = new OkmdAiClient(apiKey);
    originalFetch = global.fetch;

    // Polyfill global fetch for testing if not available (Node < 18)
    if (!global.fetch) {
        (global as any).fetch = mock.fn();
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should throw error if API key is not provided", () => {
    assert.throws(() => {
      new OkmdAiClient("");
    }, /API Key สำหรับ OKMD AI จำเป็นต้องระบุ/);
  });

  it("should generate response via createChatCompletion successfully", async () => {
    const mockResponse = {
      id: "chatcmpl-123",
      object: "chat.completion",
      created: 1677652288,
      model: "gemini-2.5-flash-lite",
      choices: [{
        index: 0,
        message: {
          role: "assistant",
          content: "Hello from OKMD AI!"
        },
        finish_reason: "stop"
      }],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21
      }
    };

    const fetchMock = mock.fn(async (...args: any[]) => {
      return {
        ok: true,
        json: async () => mockResponse
      };
    });
    (global as any).fetch = fetchMock;

    const request: OkmdChatCompletionRequest = {
      model: "gemini-2.5-flash-lite",
      messages: [
        { role: "user", content: "Say hello!" }
      ]
    };

    const response = await client.createChatCompletion(request);

    assert.strictEqual(response.model, "gemini-2.5-flash-lite");
    assert.strictEqual(response.choices[0].message.content, "Hello from OKMD AI!");

    const fetchCalls = fetchMock.mock.calls;
    assert.strictEqual(fetchCalls.length, 1);

    const callArgs = fetchCalls[0].arguments as any[];
    const url = callArgs[0];
    const options = callArgs[1];

    assert.strictEqual(url, "https://gen.ai.kku.ac.th/okmd/api/v1/chat/completions");
    assert.strictEqual(options.method, "POST");
    assert.strictEqual(options.headers["Authorization"], `Bearer ${apiKey}`);

    const body = JSON.parse(options.body);
    assert.strictEqual(body.model, "gemini-2.5-flash-lite");
    assert.strictEqual(body.messages[0].content, "Say hello!");
  });

  it("should handle API error responses", async () => {
    const fetchMock = mock.fn(async (...args: any[]) => {
      return {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Invalid token"
      };
    });
    (global as any).fetch = fetchMock;

    const request: OkmdChatCompletionRequest = {
      model: "gemini-2.5-flash-lite",
      messages: [
        { role: "user", content: "Say hello!" }
      ]
    };

    await assert.rejects(
      async () => {
        await client.createChatCompletion(request);
      },
      /OKMD API Error: 401 Unauthorized - Invalid token/
    );
  });
});
