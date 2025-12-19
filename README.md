# Task Tracker Mobile App

A simple, elegant task tracker mobile app built with React Native and Expo. Create tasks, manage priorities, set due dates, and convert highlighted text into checklist items.

## Features

- ✅ Create and manage tasks
- 📝 Rich task descriptions
- 🎯 Priority levels (Low, Medium, High)
- 📅 Due dates
- ✅ Convert highlighted text to checklist items
- 🌙 Dark theme
- 💾 Local storage (AsyncStorage)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Usage

### Creating Tasks

1. Tap the **+** button to create a new task
2. Enter a title (required)
3. Add a description (optional)
4. Set priority and due date
5. Tap **Save**

### Converting Text to Checklist

1. Open a task detail view
2. In the description field, highlight the text you want to convert
3. Tap **"Convert to Checklist"** button that appears
4. Each line of highlighted text becomes a checklist item

### Managing Tasks

- Tap a task to view details
- Tap the checkbox to mark complete/incomplete
- Swipe or use the delete button to remove tasks
- Edit tasks by opening the detail view

## Project Structure

```
├── App.tsx                 # Main app entry point
├── src/
│   ├── components/         # Reusable components
│   │   ├── TaskCard.tsx
│   │   └── TaskForm.tsx
│   ├── screens/           # Screen components
│   │   ├── TaskListScreen.tsx
│   │   └── TaskDetailScreen.tsx
│   ├── types/             # TypeScript types
│   │   └── Task.ts
│   └── utils/             # Utilities
│       ├── colors.ts
│       └── storage.ts
└── package.json
```

## Technologies

- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage

## License

Copyright (c) 2025 SouMed Technologies. All rights reserved.
