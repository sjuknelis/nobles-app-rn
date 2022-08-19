/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable, View } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import AboutMeScreen from '../screens/AboutMeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import MenuScreen from '../screens/MenuScreen';
import FinancialScreen from '../screens/FinancialSubscreen';
import CommunityServiceScreen from '../screens/CommunityServiceSubscreen';
import LockerComboScreen from '../screens/LockerComboSubscreen';
import AthleticsScreen from '../screens/AthleticsScreen';
import DirectoryScreen from '../screens/DirectoryScreen';
import DirectoryResultsScreen from '../screens/DirectoryResultsSubscreen';
import DirectoryCardScreen from '../screens/DirectoryCardSubscreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

import { KEY_COLOR } from '../components/Themed';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={{
        dark: false,
        colors: {
          primary: "white",
          background: KEY_COLOR,
          card: KEY_COLOR,
          text: "white",
          border: KEY_COLOR,
          notification: KEY_COLOR
        }
      }}>
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();
function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Financial" component={FinancialScreen} options={{
        title: 'About Me',
        headerBackVisible: false
      }} />
      <Stack.Screen name="CommunityService" component={CommunityServiceScreen} options={{
        title: 'About Me',
        headerBackVisible: false
      }} />
      <Stack.Screen name="LockerCombo" component={LockerComboScreen} options={{
        title: 'About Me',
        headerBackVisible: false
      }} />
      <Stack.Screen name="DirectoryResults" component={DirectoryResultsScreen} options={{
        title: 'Results',
        headerBackVisible: false
      }} />
      <Stack.Screen name="DirectoryCard" component={DirectoryCardScreen} options={{
        title: 'Card',
        headerBackTitleStyle: {
          fontSize: 0
        }
      }} />
    </Stack.Navigator>
  );
}

const BottomTab = createBottomTabNavigator<RootTabParamList>();
function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="AboutMe"
      screenOptions={{
        tabBarActiveTintColor: "white"
      }}>
      <BottomTab.Screen
        name="AboutMe"
        component={AboutMeScreen}
        options={{
          title: 'About Me',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Athletics"
        component={AthleticsScreen}
        options={{
          title: 'Athletics',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Directory"
        component={DirectoryScreen}
        options={{
          title: 'Directory',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
