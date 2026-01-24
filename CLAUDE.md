# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ad-brief-maker** is an AI-powered tool for creating comprehensive advertising briefs with automated content generation and strategic planning.

## Current Status

This project is in the initial skeleton stage. The core implementation has not yet been built.

## Tech Stack

- **Runtime:** Node.js
- **Package Manager:** npm/yarn
- **Language:** JavaScript/TypeScript (anticipated)

## Project Structure

```
ad-brief-maker/
├── .gitignore           # Node.js project gitignore
├── LICENSE              # MIT License
├── README.md            # Project documentation
└── CLAUDE.md            # This file
```

## Common Commands

These commands will be available once package.json is set up:

```bash
npm install              # Install dependencies
npm run dev              # Run development server
npm run build            # Build for production
npm test                 # Run tests
npm start                # Start production server
```

## Development Guidelines

- Follow existing code style and conventions
- Write tests for new functionality
- Use environment variables for configuration (never commit secrets)
- Keep dependencies minimal and up-to-date

## Environment Variables

Create a `.env` file based on `.env.example` (when available). Never commit `.env` files containing secrets.
