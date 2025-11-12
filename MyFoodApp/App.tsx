// App.tsx
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ShopDetailScreen from "./src/screens/ShopDetailScreen";
import FoodDetailScreen from "./src/screens/FoodDetailScreen";
import CartScreen from "./src/screens/CartScreen";
import PaymentQrScreen from "./src/screens/PaymentQrScreen";
import AllCartScreen from "./src/screens/AllCartScreen";
import BillsScreen from "./src/screens/BillsScreen";
import BillDetailScreen from "./src/screens/BillDetailScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { user: any } | undefined;
  ShopDetail: { shop: any } | undefined;
  FoodDetail: { menuItemId: number; shop: any };
  AllCart: { userId: number };
  Cart: { userId: number; shopId?: number; shopName?: string };
  PaymentQr: { amount: number; orderId: number; userId: number };
  Bills: { userId: number };
  BillDetail: { orderId: number; userId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [user, setUser] = useState<any>(null);

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Home"
            children={(props) => (
              <HomeScreen
                {...props}
                currentUser={user}
              />
            )}
          />

          <Stack.Screen
            name="ShopDetail"
            component={ShopDetailScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="FoodDetail"
            component={FoodDetailScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="AllCart"
            component={AllCartScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="PaymentQr"
            component={PaymentQrScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Bills" 
            component={BillsScreen}
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="BillDetail"
            component={BillDetailScreen}
            options={{ headerShown:false }} 
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Login"
            children={(props) => (
              <LoginScreen
                {...props}
                onLoggedIn={(u: any) => setUser(u)}
                onGoSignUp={() => props.navigation.navigate("Register")}
              />
            )}
          />

          <Stack.Screen
            name="Register"
            children={(props) => (
              <RegisterScreen
                {...props}
                onRegistered={(u: any) => setUser(u)}
                onGoSignIn={() => props.navigation.goBack()}
              />
            )}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default App;
