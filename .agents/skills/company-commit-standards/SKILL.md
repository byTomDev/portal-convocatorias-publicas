---
name: company-commit-standards
description: Guidance for preparing company-standard Git commits with clear traceability, Conventional Commits, project scopes, emojis, and mandatory user approval before execution.
--------------------------------------

# Company Commit Standards

Approach every commit as a traceability artifact, not just as a Git operation. A good commit should help another developer understand what changed, why it changed, and which company task, user story, or work item it belongs to.

This skill applies whenever you prepare or create commits in a company repository.

The goal is to keep the Git history clean, readable, professional, and aligned with company standards.

## Core principle

Never create a commit automatically.

Before running `git add` or `git commit`, you must show the user what you detected, what you plan to include, and the exact commit message you propose.

You must wait for explicit user approval before creating the commit.

Do not assume approval from context.

## Company commit format

Use this format:

```txt
type(PROJECT-00000): emoji short description
```

Example:

```txt
chore(ABC-00001): 🔧 add project gitignore
```

The commit message must include:

1. A valid Conventional Commit type.
2. A project scope with prefix and work item.
3. One meaningful emoji.
4. A short, clear description in English.

## Project scope

The scope must identify the project and the related work item, user story, or task.

Format:

```txt
PROJECT-00000
```

Examples:

```txt
ABC-00001
SE-57669
PCP-00001
```

The project prefix depends on the repository, business context, or company project code.

Rules:

1. Infer the project prefix from the repository context when it is obvious.
2. If the project prefix is not clear, ask the user before proposing the commit.
3. Do not invent real work item numbers.
4. If there is no user story, Azure DevOps item, or task number available, use `PROJECT-00001` with the correct project prefix.
5. If the correct project prefix is unknown, ask the user instead of guessing.

Examples:

```txt
feat(SE-57669): ✨ insert notifications by tax document types
chore(ABC-00001): 🔧 add project gitignore
feat(PCP-00001): ✨ add backend health endpoint
```

## Commit types

Choose the commit type based on the purpose of the change.

```txt
feat      → New feature or user-facing capability.
fix       → Bug fix.
chore     → Maintenance, setup, configuration, tooling, or repository structure.
docs      → Documentation-only changes.
refactor  → Code restructuring without changing behavior.
test      → Tests added or updated.
style     → Formatting or visual style changes without behavior change.
perf      → Performance improvement.
build     → Build system, Docker, package manager, or dependency changes.
ci        → CI/CD changes.
revert    → Revert a previous change.
```

Use `chore` for changes such as `.gitignore`, initial setup, configuration files, or repository maintenance.

Use `feat` only when the change adds a real capability to the application.

## Emoji convention

Use one emoji per commit.

The emoji must clarify the intent of the change, not decorate the message.

Recommended emojis:

```txt
✨ New feature or capability
🐛 Bug fix
🔧 Configuration, tooling, setup, or maintenance
🏗️ Project structure or architecture
📝 Documentation
♻️ Refactor
✅ Tests
🎨 Formatting or visual style
⚡ Performance
🚀 Release or deployment
🚨 Critical, risky, or production-impacting change
🔒 Security
⬆️ Dependency upgrade
⬇️ Dependency downgrade
🔥 Remove code or files
```

Use `🔧` for `.gitignore`, configuration, tooling, and setup.

Use `🏗️` for project structure or architecture changes.

Use `✨` for new features.

Use `🚨` only for risky, urgent, critical, or production-impacting changes.

## Good examples

```txt
chore(ABC-00001): 🔧 add project gitignore
chore(ABC-00001): 🏗️ create initial monorepo structure
feat(ABC-00002): ✨ add backend health endpoint
fix(ABC-00003): 🐛 correct backend docker path
docs(ABC-00004): 📝 update local setup instructions
refactor(ABC-00005): ♻️ simplify backend configuration loading
test(ABC-00006): ✅ add health endpoint test
```

## Bad examples

```txt
initial commit
changes
update files
fix stuff
feat: update project
feat(): add things
feat(ABC): update
feat(ABC-00001): update
```

Avoid vague descriptions like `update`, `changes`, `fix stuff`, or `initial commit`.

The description must explain the actual change.

## Process before proposing a commit

Before proposing a commit, inspect the repository state.

Use:

```txt
git branch --show-current
git status --short
git diff --stat
```

Review the output and identify only the files that belong to the intended commit.

If unexpected files appear, stop and ask the user what to do.

## Required confirmation message

Before committing, show the user:

```txt
Current branch:
Changed files:
Summary:
Proposed commit message:
Assumptions:
```

Example:

```txt
Current branch: develop

Changed files:
- .gitignore

Summary:
- Added ignore rules for Python, Node.js, Vite, environment files, logs, IDE folders, and OS temporary files.

Proposed commit message:
chore(ABC-00001): 🔧 add project gitignore

Assumptions:
- No Azure DevOps task was provided, so ABC-00001 is being used as the fallback work item.

Please confirm if you want me to create this commit.
```

Do not create the commit until the user confirms.

## Commit execution

After explicit approval, commit only the approved files.

Prefer:

```txt
git add .gitignore
git commit -m "chore(ABC-00001): 🔧 add project gitignore"
```

Avoid:

```txt
git add .
```

Use `git add .` only if the user explicitly approves including all current changes.

After creating the commit, show:

1. Commit hash.
2. Final `git status`.
3. Short confirmation of what was committed.

## Behavior rules

Be careful with scope.

Keep commits small.

Do not mix unrelated changes.

Do not commit generated, temporary, ignored, or environment files.

Do not push automatically.

Do not create commits without user approval.

Do not change the approved commit message unless the user asks.

Act like a careful Tech Lead preparing a clean, reviewable history.
