import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Card, Image, Rating } from "react-native-elements";

import { firebaseApp } from "../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function TopStores() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    (async () => {
      db.collection("stores")
        .orderBy("rating", "desc")
        .limit(5)
        .get()
        .then(response => {
          const storesArray = [];
        })
        .catch(() => {
          console.log("error al cargar el rating");
        });
    })();
  }, []);

  return (
    <View>
      <Text>Estamos en el ranking de Tiendas.</Text>
    </View>
  );
}
