import { createStackNavigator } from "react-navigation-stack";
import TopStoresScreen from "../screens/TopStores";

const TopListScreenStacks = createStackNavigator({
  TopStores: {
    screen: TopStoresScreen,
    navigationOptions: () => ({
      title: "Ranking Tiendas"
    })
  }
});

export default TopListScreenStacks;
