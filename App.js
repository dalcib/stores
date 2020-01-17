import React from "react";
import Navigation from "./app/navigations/Navigation";
import { firebaseApp } from "./app/utils/firebase";
import { YellowBox } from "react-native";

YellowBox.ignoreWarnings(["Setting a timer"]);
YellowBox.ignoreWarnings([
  "VirtualizedLists should never be nested" // TODO: Remove when fixed
]);

export default function App() {
  return <Navigation />;
}
