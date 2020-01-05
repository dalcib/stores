import { createStackNavigator } from "react-navigation-stack";
import StoresScreen from "../screens/Stores";

const StoresScreenStacks = createStackNavigator({
  Stores: {
    screen: StoresScreen,
    navigationOptions: () => ({
      title: "Tiendas"
    })
  }
});

export default StoresScreenStacks;
