# Quick Start Guide

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npm start
   ```

3. **Run on your device:**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## First Time Setup

If you don't have Expo CLI installed globally:
```bash
npm install -g expo-cli
```

Or use npx (no global install needed):
```bash
npx expo start
```

## Key Features to Try

1. **Create a Task:**
   - Tap the + button
   - Add title, description, priority, and due date
   - Save

2. **Convert Text to Checklist:**
   - Open a task
   - In the description field, highlight multiple lines of text
   - Tap "Convert to Checklist" button
   - Each line becomes a checklist item!

3. **Manage Tasks:**
   - Tap checkbox to complete
   - Tap task to view details
   - Swipe or delete button to remove

## Troubleshooting

- **"Module not found" errors**: Run `npm install` again
- **Expo Go not connecting**: Make sure your phone and computer are on the same WiFi network
- **TypeScript errors**: These should resolve after `npm install` completes

