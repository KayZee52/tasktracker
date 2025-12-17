import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { TaskListScreen } from './src/screens/TaskListScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { Task } from './src/types/Task';
import { storage } from './src/utils/storage';

export type RootStackParamList = {
  TaskList: undefined;
  TaskDetail: { task: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { theme, colors } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="TaskList" component={TaskListScreen} />
        <Stack.Screen
          name="TaskDetail"
          component={({ route, navigation }: any) => {
            const { task: initialTask } = route.params;
            const [task, setTask] = React.useState(initialTask);

            React.useEffect(() => {
              setTask(initialTask);
            }, [initialTask]);

            const handleUpdate = async (updatedTask: Task) => {
              await storage.updateTask(updatedTask);
              setTask(updatedTask);
            };

            const handleDelete = async () => {
              await storage.deleteTask(task.id);
              navigation.goBack();
            };

            return (
              <TaskDetailScreen
                task={task}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onBack={() => navigation.goBack()}
              />
            );
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

