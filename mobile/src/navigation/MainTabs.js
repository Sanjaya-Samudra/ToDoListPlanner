import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";
import CustomTabBar from "./CustomTabBar";

import DashboardScreen from "../screens/dashboard/DashboardScreen";
import TaskListScreen from "../screens/tasks/TaskListScreen";
import TaskDetailScreen from "../screens/tasks/TaskDetailScreen";
import CreateEditTaskScreen from "../screens/tasks/CreateEditTaskScreen";
import AIChatScreen from "../screens/ai/AIChatScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import NotificationScreen from "../screens/notifications/NotificationScreen";
import StatsScreen from "../screens/stats/StatsScreen";
import SearchScreen from "../screens/search/SearchScreen";

const Tab = createBottomTabNavigator();
const TasksStack = createNativeStackNavigator();
const StatsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const TasksNavigator = () => (
  <TasksStack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
    <TasksStack.Screen name="TaskList" component={TaskListScreen} />
    <TasksStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ headerShown: true, headerBackTitle: "Back", title: "Task Details" }} />
    <TasksStack.Screen name="CreateEditTask" component={CreateEditTaskScreen} options={{ headerShown: true, title: "New Task", presentation: "modal" }} />
    <TasksStack.Screen name="Search" component={SearchScreen} options={{ headerShown: true, headerBackTitle: "Back", title: "Search Tasks" }} />
  </TasksStack.Navigator>
);

const StatsNavigator = () => (
  <StatsStack.Navigator screenOptions={{ headerShown: false }}>
    <StatsStack.Screen name="StatsMain" component={StatsScreen} />
  </StatsStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: true, headerBackTitle: "Back", title: "Notifications" }} />
  </ProfileStack.Navigator>
);

const MainTabs = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} />
      <Tab.Screen name="TasksTab" component={TasksNavigator} />
      <Tab.Screen name="StatsTab" component={StatsNavigator} />
      <Tab.Screen name="AIChat" component={AIChatScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabs;
