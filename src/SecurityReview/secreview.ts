import groqClient from '../groq-client';
import { SecurityReviewResult } from '../types';
import pino from 'pino';

const logger = pino({ name: 'security-review-engine' });

export class SecurityReviewEngine {
  static readonly ENGINE_ID = 'dev:security';

  /**
   * Reviews the code specifically for security vulnerabilities and weaknesses
   */
  async reviewSecurity(code: string, language: string): Promise<SecurityReviewResult> {
    logger.info({ language }, 'Performing security review');
    const systemPrompt = `You are an expert security auditor and penetration tester. Inspect the given code for potential vulnerabilities (OWASP Top 10, CWE, etc.), logic bugs, and dangerous functions.
Respond strictly in JSON matching the SecurityReviewResult interface:
export interface SecurityReviewResult {
  vulnerabilities: {
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    line?: number;
    fix?: string;
  }[];
  score: number; // 0-100 (where 100 means fully secure)
  recommendations: string[];
  approved: boolean;
}`;

    const prompt = `Language: ${language}\nCode to inspect:\n${code}`;

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
      return JSON.parse(text) as SecurityReviewResult;
    } catch (err) {
      logger.error('Failed to parse security review JSON. Returning error payload.', err);
      return {
        vulnerabilities: [],
        score: 0,
        recommendations: ['Failed to analyze vulnerabilities using structured output. Raw output: ' + text],
        approved: false
      };
    }
  }

  /**
   * Scans a string for hardcoded credentials, APIs, secrets, or keys
   */
  async detectSecrets(code: string): Promise<string[]> {
    logger.info('Scanning for hardcoded secrets');
    const secrets: string[] = [];

    // Simple regex scanner for standard patterns
    const patterns = [
      /([a-zA-Z0-9_-]{20,})\b/g, // generic long strings that might be API keys
      /AIza[0-9A-Za-z-_]{35}/g, // Google API Key
      /sk_live_[0-9a-zA-Z]{24}/g, // Stripe Secret
      /sq-sig-at-[0-9A-Za-z-_]{22}/g, // Square accessToken
      /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, // Amazon MWS Auth
      /psec_[a-zA-Z0-9]{43}/g, // Supabase service role / anon keys or similar
      /(?:key|secret|password|passwd|token|auth|credential|api_key|apikey)(?:["']?\s*[:=]\s*["'])([A-Za-z0-9_.~!@#$%^&*()+-/\\?{}|[\]`<>:;,]{8,50})(?:["'])/gi // Match patterns like api_key = "abc"
    ];

    for (const pattern of patterns) {
      let match;
      // Reset regex index
      pattern.lastIndex = 0;
      while ((match = pattern.exec(code)) !== null) {
        // Exclude dummy values
        const matchedStr = match[0];
        const isDummy = /dummy|placeholder|your_key|mykey|12345678|abcdefgh|password123/i.test(matchedStr);
        if (!isDummy && !secrets.includes(matchedStr)) {
          secrets.push(matchedStr);
        }
      }
    }

    // Enhance secret scanning via Groq to reduce false positives/negatives
    try {
      const systemPrompt = 'You are a static analysis tool for secrets detection. Identify and output any raw secrets/API keys/passwords hardcoded in the user text. Respond with a JSON array of strings containing only the found secrets.';
      const response = await groqClient.createChatCompletion({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const text = response.choices[0]?.message?.content || '[]';
      const aiSecrets = JSON.parse(text);
      if (Array.isArray(aiSecrets)) {
        for (const secret of aiSecrets) {
          if (typeof secret === 'string' && !secrets.includes(secret)) {
            secrets.push(secret);
          }
        }
      }
    } catch (err) {
      logger.warn('AI secret scanning failed or bypassed, relying on local regex patterns', err);
    }

    return secrets;
  }

  /**
   * Generates a full markdown security report for a directory
   */
  async generateSecurityReport(projectDir: string): Promise<string> {
    logger.info({ projectDir }, 'Generating markdown security report');
    const systemPrompt = 'You are a Principal Security Engineer. Generate a comprehensive security report for the project directory in beautiful Markdown. Outline best practices, key areas of focus, typical threats based on typical stack configurations, and mitigation plans.';

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please generate a security report for the project at: ${projectDir}` }
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || '';
  }
}
