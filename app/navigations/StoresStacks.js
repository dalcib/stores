import { createStackNavigator } from "react-navigation-stack";
import StoresScreen from "../screens/Stores";
import AddStoresScreen from "../screens/Stores/AddStores";
import StoreScreen from "../screens/Stores/Store";

const StoresScreenStacks = createStackNavigator({
  Stores: {
    screen: StoresScreen,
    navigationOptions: () => ({
      title: "Veterinarias"
    })
  },
  AddStores: {
    screen: AddStoresScreen,
    navigationOptions: () => ({
      title: "Agregar Veterinaria"
    })
  },
  Store: {
    screen: StoreScreen,
    navigationOptions: props => ({
      title: props.navigation.state.params.store.item.store.name
    })
  }
});

export default StoresScreenStacks;
