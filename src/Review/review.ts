import groqClient from '../groq-client';
import { CodeReview } from '../types';
import pino from 'pino';

const logger = pino({ name: 'code-review-engine' });

export class CodeReviewEngine {
  static readonly ENGINE_ID = 'dev:review';

  /**
   * Reviews the code and returns structured feedback
   */
  async reviewCode(code: string, language: string, context?: string): Promise<CodeReview> {
    logger.info({ language }, 'Reviewing code');
    const systemPrompt = `You are an expert code reviewer. Analyze the code for bugs, quality issues, styling, complexity, and performance.
Provide output strictly formatted as a JSON object matching this TypeScript type:
export interface CodeReview {
  issues: {
    line?: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }[];
  suggestions: string[];
  score: number; // 0-100
  summary: string;
  approved: boolean;
}
Return only JSON.`;

    let prompt = `Language: ${language}\n`;
    if (context) prompt += `Context:\n${context}\n`;
    prompt += `\nCode to review:\n${code}`;

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(text) as CodeReview;
    } catch (err) {
      logger.error('Failed to parse JSON response from Groq. Returning raw text structure.', err);
      return {
        issues: [],
        suggestions: ['Could not parse review output properly. Raw output: ' + text],
        score: 0,
        summary: 'Error processing structured output from LLM.',
        approved: false
      };
    }
  }

  /**
   * Compares two separate implementations for efficiency, correctness, and style
   */
  async compareImplementations(codeA: string, codeB: string): Promise<string> {
    logger.info('Comparing two implementations');
    const systemPrompt = 'You are an expert system architect. Compare these two implementations. Evaluate their Big-O complexity, readability, robustness, and overall architectural soundness.';
    
    const prompt = `--- IMPLEMENTATION A ---\n${codeA}\n\n--- IMPLEMENTATION B ---\n${codeB}\n`;

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Suggests top improvements for a piece of code
   */
  async suggestImprovements(code: string): Promise<string[]> {
    logger.info('Suggesting improvements');
    const systemPrompt = 'You are a senior developer. Given the code snippet, return a JSON array of strings, where each string is a distinct, high-impact suggestion for optimization, refactoring, or modernization.';

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions;
      }
      return [text];
    } catch (err) {
      logger.error('Failed to parse suggestions array', err);
      return [text];
    }
  }
}
