# Contributing to SecureChat

Thank you for considering contributing to SecureChat! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Specify your environment (browser, OS, device)
- Include screenshots if applicable

### Suggesting Features

- Check if the feature has already been suggested in the Issues section
- Use the feature request template when creating a new issue
- Provide a clear description of the feature and its benefits
- Consider how it fits with the existing architecture and security model

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature/bugfix
3. Make your changes
4. Run tests to ensure they pass
5. Create a pull request following the template
6. Link any related issues

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/encrypted-messaging-app.git
cd encrypted-messaging-app

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev
```

## Coding Guidelines

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code restructuring
- `test:` for test additions or modifications
- `chore:` for build process or tooling changes

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting and naming conventions
- Write meaningful comments and documentation
- Include unit tests for new features

### Security Considerations

- Never commit encryption keys, passwords, or sensitive information
- Any changes to the encryption system must be reviewed by security experts
- Client-side encryption must be maintained for all sensitive data
- Follow the principle of least privilege

## Testing

- All new features should include tests
- Run existing tests before submitting a PR:
  ```bash
  pnpm test
  ```

## Documentation

- Update documentation to reflect your changes
- Use JSDoc comments for functions and components
- Include explanations of security implementations where relevant

## Security Review Process

Security-related changes go through an additional review process:

1. Initial PR review by maintainers
2. Security review by designated security experts
3. Manual testing of encryption/decryption flows
4. Final approval

Thank you for contributing to SecureChat! 