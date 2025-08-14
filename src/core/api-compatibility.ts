/**
 * 🔍 jpglens - API Compatibility Layer
 * Handles differences between OpenAI and Anthropic API formats
 *
 * @author Taha Bahrami (Kaito)
 * @license MIT
 */

import { AIProviderConfig } from './types.js';

/**
 * API message formats
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content:
    | string
    | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: { url: string };
      }>;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content:
    | string
    | Array<{
        type: 'text' | 'image';
        text?: string;
        source?: {
          type: 'base64';
          media_type: string;
          data: string;
        };
      }>;
}

/**
 * API request formats
 */
export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  temperature?: number;
  system?: string;
}

/**
 * API response formats
 */
export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * API Compatibility Handler
 */
export class APICompatibilityHandler {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /**
   * Detect API format based on provider and model
   */
  detectAPIFormat(): 'openai' | 'anthropic' {
    if (this.config.messageFormat && this.config.messageFormat !== 'auto') {
      return this.config.messageFormat;
    }

    // Auto-detect based on provider and model
    if (this.config.provider === 'anthropic') {
      return 'anthropic';
    }

    if (this.config.provider === 'openai') {
      return 'openai';
    }

    // For OpenRouter, detect based on model name
    if (this.config.provider === 'openrouter') {
      if (this.config.model?.includes('anthropic/') || this.config.model?.includes('claude')) {
        return 'anthropic';
      }
      if (this.config.model?.includes('openai/') || this.config.model?.includes('gpt')) {
        return 'openai';
      }
    }

    // Default to OpenAI format for compatibility
    return 'openai';
  }

  /**
   * Convert prompt and image to appropriate API format
   */
  formatRequest(prompt: string, imageBase64?: string, systemPrompt?: string): OpenAIRequest | AnthropicRequest {
    const apiFormat = this.detectAPIFormat();

    if (apiFormat === 'anthropic') {
      return this.formatAnthropicRequest(prompt, imageBase64, systemPrompt);
    } else {
      return this.formatOpenAIRequest(prompt, imageBase64, systemPrompt);
    }
  }

  /**
   * Format request for OpenAI API
   */
  private formatOpenAIRequest(prompt: string, imageBase64?: string, systemPrompt?: string): OpenAIRequest {
    const messages: OpenAIMessage[] = [];

    // Add system message if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Format user message with text and optional image
    const userContent: any[] = [{ type: 'text', text: prompt }];

    if (imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${imageBase64}`,
        },
      });
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    return {
      model: this.config.model,
      messages,
      max_tokens: this.config.maxTokens || 2000,
      temperature: this.config.temperature || 0.1,
    };
  }

  /**
   * Format request for Anthropic API
   */
  private formatAnthropicRequest(prompt: string, imageBase64?: string, systemPrompt?: string): AnthropicRequest {
    const messages: AnthropicMessage[] = [];

    // Format user message with text and optional image
    const userContent: any[] = [{ type: 'text', text: prompt }];

    if (imageBase64) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: imageBase64,
        },
      });
    }

    messages.push({
      role: 'user',
      content: userContent,
    });

    const request: AnthropicRequest = {
      model: this.config.model,
      max_tokens: this.config.maxTokens || 2000,
      messages,
      temperature: this.config.temperature || 0.1,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      request.system = systemPrompt;
    }

    return request;
  }

  /**
   * Parse response from either API format
   */
  parseResponse(response: any): {
    content: string;
    tokensUsed: number;
    model: string;
  } {
    const apiFormat = this.detectAPIFormat();

    if (apiFormat === 'anthropic') {
      return this.parseAnthropicResponse(response);
    } else {
      return this.parseOpenAIResponse(response);
    }
  }

  /**
   * Parse OpenAI API response
   */
  private parseOpenAIResponse(response: OpenAIResponse): {
    content: string;
    tokensUsed: number;
    model: string;
  } {
    return {
      content: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      model: response.model,
    };
  }

  /**
   * Parse Anthropic API response
   */
  private parseAnthropicResponse(response: AnthropicResponse): {
    content: string;
    tokensUsed: number;
    model: string;
  } {
    const content =
      response.content
        ?.filter(item => item.type === 'text')
        ?.map(item => item.text)
        ?.join('') || '';

    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return {
      content,
      tokensUsed,
      model: response.model,
    };
  }

  /**
   * Get appropriate headers for the API
   */
  getHeaders(): Record<string, string> {
    const apiFormat = this.detectAPIFormat();
    const baseHeaders = {
      'Content-Type': 'application/json',
    };

    if (apiFormat === 'anthropic') {
      return {
        ...baseHeaders,
        Authorization: `Bearer ${this.config.apiKey}`,
        'anthropic-version': '2023-06-01',
      };
    } else {
      return {
        ...baseHeaders,
        Authorization: `Bearer ${this.config.apiKey}`,
      };
    }
  }

  /**
   * Get appropriate API endpoint
   */
  getEndpoint(): string {
    if (this.config.baseUrl) {
      const apiFormat = this.detectAPIFormat();
      if (apiFormat === 'anthropic') {
        return `${this.config.baseUrl}/v1/messages`;
      } else {
        return `${this.config.baseUrl}/v1/chat/completions`;
      }
    }

    // Default endpoints
    if (this.config.provider === 'anthropic') {
      return 'https://api.anthropic.com/v1/messages';
    } else if (this.config.provider === 'openai') {
      return 'https://api.openai.com/v1/chat/completions';
    } else if (this.config.provider === 'openrouter') {
      return 'https://openrouter.ai/api/v1/chat/completions';
    }

    throw new Error(`Unknown provider: ${this.config.provider}`);
  }

  /**
   * Validate configuration for the detected API format
   */
  validateConfig(): void {
    const apiFormat = this.detectAPIFormat();

    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }

    if (!this.config.model) {
      throw new Error('Model is required');
    }

    if (apiFormat === 'anthropic') {
      if (!this.config.maxTokens) {
        throw new Error('max_tokens is required for Anthropic API');
      }
    }
  }

  /**
   * Get configuration summary
   */
  getConfigSummary(): {
    provider: string;
    model: string;
    apiFormat: string;
    endpoint: string;
  } {
    return {
      provider: this.config.provider,
      model: this.config.model,
      apiFormat: this.detectAPIFormat(),
      endpoint: this.getEndpoint(),
    };
  }
}

/**
 * Create API compatibility handler
 */
export function createAPICompatibilityHandler(config: AIProviderConfig): APICompatibilityHandler {
  return new APICompatibilityHandler(config);
}
