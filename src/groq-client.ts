import Groq from 'groq-sdk';
import pino from 'pino';

const logger = pino({ name: 'groq-client' });

export class RoundRobinGroqClient {
  private clients: Groq[] = [];
  private currentIndex = 0;

  constructor() {
    const keys = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3
    ].filter(Boolean) as string[];

    if (keys.length === 0) {
      // Fallback to standard GROQ_API_KEY if none of the numbered ones are provided
      const fallbackKey = process.env.GROQ_API_KEY;
      if (fallbackKey) {
        logger.info('Using fallback GROQ_API_KEY');
        this.clients.push(new Groq({ apiKey: fallbackKey }));
      } else {
        logger.warn('No Groq API keys found in environment variables!');
      }
    } else {
      logger.info(`Initialized RoundRobinGroqClient with ${keys.length} keys`);
      for (const key of keys) {
        this.clients.push(new Groq({ apiKey: key }));
      }
    }
  }

  /**
   * Get the next Groq client instance in round-robin fashion
   */
  getClient(): Groq {
    if (this.clients.length === 0) {
      throw new Error('No Groq API clients available. Please set GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY_3 or GROQ_API_KEY.');
    }
    const client = this.clients[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.clients.length;
    return client;
  }

  /**
   * Helper method to perform a chat completion using round-robin client selection
   */
  async createChatCompletion(params: Parameters<Groq['chat']['completions']['create']>[0]): Promise<ReturnType<Groq['chat']['completions']['create']>> {
    const client = this.getClient();
    return client.chat.completions.create(params);
  }
}

export const groqClient = new RoundRobinGroqClient();
export default groqClient;
