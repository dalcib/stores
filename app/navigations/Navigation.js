import React from "react";
import { Icon } from "react-native-elements";
import { createAppContainer } from "react-navigation";
import { createBottomTabNavigator } from "react-navigation-tabs";

import StoresScreenStacks from "./StoresStacks";

const NavigationStacks = createBottomTabNavigator({
  Stores: {
    screen: StoresScreenStacks,
    navigationOptions: () => ({
      tabBarLabel: "Tiendas",
      tabBarIcon: ({ tintColor }) => (
        <Icon
          type="material-community"
          name="compass-outline"
          size={22}
          color={tintColor}
        />
      )
    })
  }
});

export default createAppContainer(NavigationStacks);
