# Troubleshooting Guide

## EMFILE: Too Many Open Files Error

If you encounter the "EMFILE: too many open files" error, here are solutions:

### Solution 1: Install Watchman (Recommended)

Watchman is Facebook's file watching service and is the recommended solution for React Native/Expo projects on macOS.

**Install with Homebrew:**
```bash
brew install watchman
```

After installation, restart the Expo server:
```bash
npm start
```

### Solution 2: Increase File Limit Temporarily

If you can't install Watchman, you can increase the file limit for the current session:

```bash
ulimit -n 10240
npm start
```

**Note:** This only works for the current terminal session. You'll need to run it each time.

### Solution 3: Make File Limit Permanent (macOS)

To make the file limit increase permanent, add this to your `~/.zshrc` or `~/.bash_profile`:

```bash
ulimit -n 10240
```

Then restart your terminal or run:
```bash
source ~/.zshrc
```

## TypeScript Errors

If you see TypeScript-related errors, make sure all dependencies are installed:

```bash
npm install
```

## Metro Bundler Issues

If Metro bundler has issues, try:

1. Clear the cache:
```bash
npx expo start -c
```

2. Reset Metro bundler:
```bash
rm -rf node_modules
npm install
npx expo start -c
```

