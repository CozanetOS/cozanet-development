import groqClient from '../groq-client';
import pino from 'pino';

const logger = pino({ name: 'documentation-engine' });

export class DocumentationEngine {
  static readonly ENGINE_ID = 'dev:docs';

  /**
   * Generates inline documentation (JSDoc, docstrings) for code snippets
   */
  async generateDocs(code: string, language: string): Promise<string> {
    logger.info({ language }, 'Generating inline documentation');
    const systemPrompt = `You are a technical writer and developer. Add comprehensive, clear, and neat JSDoc or language-specific docstrings and comments to the following code.
Return the complete code block containing the newly introduced documentation. Do not modify standard code structures.`;

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

  /**
   * Generates a neat, production-quality README.md for a project
   */
  async generateReadme(projectInfo: object): Promise<string> {
    logger.info('Generating project README');
    const systemPrompt = 'You are an open-source technical writer. Create a detailed, beautiful, and complete README.md in Markdown using the provided structured info.';

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(projectInfo, null, 2) }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Generates a formatted Changelog from Git logs
   */
  async generateChangelog(gitLog: any[]): Promise<string> {
    logger.info('Generating changelog');
    const systemPrompt = 'You are a release manager. Based on the list of Git commit messages provided, generate a detailed, categorised, and professional CHANGELOG.md following Keep a Changelog guidelines.';

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(gitLog, null, 2) }
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Answers developers questions about code context and implementation
   */
  async answerQuestion(question: string, codebase: string): Promise<string> {
    logger.info({ question }, 'Answering question on codebase');
    const systemPrompt = 'You are a friendly, highly intelligent development assistant. Answer developer questions accurately based on the codebase context provided.';

    const prompt = `--- CODEBASE CONTEXT ---\n${codebase}\n\n--- QUESTION ---\n${question}`;

    const response = await groqClient.createChatCompletion({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || '';
  }
}
