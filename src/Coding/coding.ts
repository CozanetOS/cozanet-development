import groqClient from '../groq-client';
import { CodeGenerationRequest } from '../types';
import pino from 'pino';

const logger = pino({ name: 'coding-engine' });

export class CodingEngine {
  static readonly ENGINE_ID = 'dev:coding';

  /**
   * Generates clean, production-ready code based on a specification
   */
  async generateCode(req: CodeGenerationRequest): Promise<string> {
    logger.info({ language: req.language, framework: req.framework }, 'Generating code based on spec');

    const systemPrompt = 'You are an expert software engineer. Generate clean, production-quality code. Respond ONLY with the requested code blocks, without explaining or wrapping in markdown unless necessary for syntax highlighting.';
    
    let prompt = `Language: ${req.language}\n`;
    if (req.framework) prompt += `Framework: ${req.framework}\n`;
    if (req.style) prompt += `Style Guidelines: ${req.style}\n`;
    if (req.context) prompt += `Context:\n${req.context}\n`;
    prompt += `\nSpecification:\n${req.spec}\n`;

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
   * Completes a partial piece of code
   */
  async completeCode(partial: string, language: string, context?: string): Promise<string> {
    logger.info({ language }, 'Completing partial code');
    const systemPrompt = 'You are an expert developer. Complete the given incomplete snippet. Output ONLY the completed portion that directly appends to the code, or the full combined function/snippet in a neat format.';
    
    let prompt = `Language: ${language}\n`;
    if (context) prompt += `Context of execution:\n${context}\n`;
    prompt += `\nPartial Code to Complete:\n${partial}\n`;

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
   * Explains how a snippet of code works
   */
  async explainCode(code: string): Promise<string> {
    logger.info('Explaining code snippet');
    const systemPrompt = 'You are an expert software instructor. Explain the following code clearly, covering its functionality, input/outputs, complexity, and design choices.';

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Refactors code based on instructions
   */
  async refactorCode(code: string, instructions: string): Promise<string> {
    logger.info({ instructions }, 'Refactoring code');
    const systemPrompt = 'You are an expert refactoring assistant. Improve the readability, modularity, or efficiency of the given code according to the users instructions. Maintain exact behavior unless requested otherwise.';

    const prompt = `Code:\n${code}\n\nInstructions:\n${instructions}`;

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
   * Translates code from one language to another
   */
  async translateCode(code: string, fromLang: string, toLang: string): Promise<string> {
    logger.info({ fromLang, toLang }, 'Translating code');
    const systemPrompt = `You are an expert translator of programming languages. Translate code from ${fromLang} to ${toLang}. Ensure language-specific best practices are maintained.`;

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || '';
  }
}
