# CozanetOS Development Engines

Powerful development engines powered by AI (via Groq round-robin routing), designed to supercharge autonomous coding, reviewing, testing, documentation, and metadata project management.

## Project Structure

- **`src/groq-client.ts`**: Round-robin LLM completions routing requests smoothly across up to 3 keys (`GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`).
- **`src/Coding/coding.ts`**: `CodingEngine` (`dev:coding`) - Generate, complete, explain, refactor, and translate code.
- **`src/Review/review.ts`**: `CodeReviewEngine` (`dev:review`) - Structured JSON analysis for code quality, architectural comparison, and improvements suggestions.
- **`src/SecurityReview/secreview.ts`**: `SecurityReviewEngine` (`dev:security`) - Strict OWASP risk audit and hardcoded secrets detection.
- **`src/Git/git.ts`**: `GitEngine` (`dev:git`) - High-level Git interface powered by `simple-git`.
- **`src/Testing/testing.ts`**: `TestingEngine` (`dev:testing`) - Test executions, automated tests coverage generation, linting, and TS compilation checks.
- **`src/Documentation/docs.ts`**: `DocumentationEngine` (`dev:docs`) - Generating inline comments, beautiful repository READMEs, automated Keep a Changelog files, and Q&A chat.
- **`src/Dependency/dependency.ts`**: `DependencyEngine` (`dev:dependency`) - Auditing packages, outdated inspection, updates, and package.json structure maps.
- **`src/ProjectManager/projectmanager.ts`**: `ProjectManager` (`dev:projects`) - Storing and listing project metadata with standard Supabase integrations.

## Features

- **No Custom Code Boilerplate**: Built fully on industry standards (`groq-sdk`, `simple-git`, `execa`, `@supabase/supabase-js`, `zod`, `pino`, `uuid`).
- **Production-Ready Typing**: Fully covered in TypeScript.
- **Strict Error Handling & Validation**: Logs outputs gracefully via Pino, provides strict interface parsing.
