import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import Toast from "react-native-easy-toast";
import ListTopStores from "../components/Ranking/ListTopStores";

import { firebaseApp } from "../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function TopStores(props) {
  const { navigation } = props;
  const [stores, setStores] = useState([]);
  const toastRef = useRef();

  useEffect(() => {
    (async () => {
      db.collection("stores")
        .orderBy("rating", "desc")
        .limit(5)
        .get()
        .then(response => {
          const storesArray = [];
          response.forEach(doc => {
            let store = doc.data();
            store.id = doc.id;
            storesArray.push(store);
          });
          setStores(storesArray);
        })
        .catch(() => {
          toastRef.current.show(
            "Error al cargar el Ranking, inténtelo más tarde",
            3000
          );
        });
    })();
  }, []);

  return (
    <View>
      <ListTopStores stores={stores} navigation={navigation} />
      <Toast ref={toastRef} position="center" opacity={0.7} />
    </View>
  );
}
