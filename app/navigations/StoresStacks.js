import { createStackNavigator } from "react-navigation-stack";
import StoresScreen from "../screens/Stores";
import AddStoresScreen from "../screens/Stores/AddStores";

const StoresScreenStacks = createStackNavigator({
  Stores: {
    screen: StoresScreen,
    navigationOptions: () => ({
      title: "Tiendas"
    })
  },
  AddStores: {
    screen: AddStoresScreen,
    navigationOptions: () => ({
      title: "Agregar Veterinaria"
    })
  }
});

export default StoresScreenStacks;
