# CozanetOS Development Engine (`cozanet-development`)

> **AI-Native OS Development, Code Synthesis, and Repository Engineering Platform**

`cozanet-development` is the software engineering brain of CozanetOS. It provides the system with full self-development and software creation capabilities, empowering autonomous agents to write code, review architectures, fix security vulnerabilities, run test suites, and manage git-based repositories with professional-grade engineering discipline.

---

## 🚀 Key Capabilities

- **Code Generation**: Complete code generation from natural language specs, supporting full file structures, class architectures, and multi-file codebases.
- **Intelligent Code Completion**: Sub-second, context-aware autocompletion that adheres to project-wide design patterns and styling rules.
- **Code Review**: Automated PR code reviews analyzing algorithmic logic, optimization paths, coding standards, and readability.
- **Security Review (SAST)**: Static application security testing targeting common vulnerabilities (OWASP Top 10, memory safety, SQL injection, secrets exposure).
- **Static Analysis**: Seamless integration with linters (ESLint, Ruff, Pylint) and type checkers (MyPy, tsc) to verify semantic correctness.
- **Debugging & Log Analysis**: Stack trace interpretation and contextual diagnostics to automatically propose and apply patches for runtime errors.
- **Test Generation**: Automatic generation of unit, integration, and end-to-end testing scripts based on source code analysis.
- **Test Execution**: Sandbox-isolated test runner executing unit tests and reporting parsed coverage and failure reports.
- **Documentation Generation**: Automated JSDoc, Docstrings, and structured Markdown file creation derived from parsing code syntax trees.
- **Safe Code Refactoring**: Structure-aware refactoring (e.g., renaming variables, extracting functions, upgrading API versions) across multiple files.
- **Architecture Analysis**: Inspects and visualizes import paths and dependencies, detecting tight coupling or architectural design smell.
- **Dependency & Package Management**: Auto-detects, updates, and audits dependencies across package managers (`npm`, `pip`, `cargo`, `go.mod`, etc.).
- **Git & Repo Integration**: Programmatically handles git operations: branches, commits, rebases, merges, pull request creation, and visual diff analysis.
- **Multi-Repository Awareness**: Coordinates tasks spanning multiple related repositories, keeping APIs and versions synchronized.
- **Build & CI/CD Automation**: Automatically creates and runs build pipelines, verifying compiles and configuring actions (GitHub Actions, GitLab CI).

---

## 🛠️ Architecture & Component Breakdown

```
        ┌────────────────────────────────────────────────────────┐
        │                     cozanet-agents                     │
        └───────────────────────────┬────────────────────────────┘
                                    ▼
        ┌────────────────────────────────────────────────────────┐
        │                  cozanet-development                   │
        │                                                        │
        │  ┌───────────────────────┐    ┌──────────────────────┐ │
        │  │      LSP Bridge       │    │  VCS & Git Operator  │ │
        │  └───────────────────────┘    └──────────────────────┘ │
        │  ┌───────────────────────┐    ┌──────────────────────┐ │
        │  │     Parser & AST      │    │  Sandbox Test Runner │ │
        │  └───────────────────────┘    └──────────────────────┘ │
        └────────────────────────────────────────────────────────┘
```

- **LSP Bridge**: Interfaces directly with Language Server Protocol servers to leverage autocomplete, type references, and fast error checks.
- **Parser & AST**: Interprets Abstract Syntax Trees to enable safe structural modifications without corrupting runtime semantics.
- **Sandbox Test Runner**: Executes compiles and test scripts in highly controlled, CPU/Memory-throttled containers.

---

## 🔌 API & Interface Overview

`cozanet-development` exposes structured endpoints to analyze, refactor, and commit code.

### Generate a Code Patch

```bash
curl -X POST http://localhost:8090/v1/dev/patch   -H "Content-Type: application/json"   -d '{
    "file_path": "src/auth.ts",
    "issue": "Fix potential timing attack in password comparison",
    "repository": "my-secure-app"
  }'
```

**Response:**
```json
{
  "status": "applied",
  "diff": "--- src/auth.ts
+++ src/auth.ts
@@ -10,3 +10,3 @@
-return input === password;
+return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(password));",
  "tests_passed": true
}
```

---

## 🔗 Integration with Other CozanetOS Modules

- `cozanet-agents`: Supplies the essential tools and LSP-grade capabilities for developers agents (e.g., Devin-style coding workflows).
- `cozanet-terminal`: Spawns sandboxed processes to execute tests, linters, package installations, and native compile tasks.
- `cozanet-security`: Feeds generated code through active verification modules to prevent the system from executing or proposing malicious code.
- `cozanet-filesystem`: Accesses, reads, and writes project directories safely via virtualized, version-controlled file volumes.

---

## ⚡ Quick-Start Notes

### Prerequisites
- Node.js >= 20.x, Python >= 3.10
- Language runtimes and LSPs pre-configured (e.g., `pyright`, `typescript-language-server`)

### Installation
```bash
git clone https://github.com/CozanetOS/cozanet-development.git
cd cozanet-development
npm install
npm run build
```

### Start the Agentic Dev-Server
```bash
npm run start:devserver
# API Server active on http://localhost:8090
```
