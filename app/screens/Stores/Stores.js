import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import ActionButton from "react-native-action-button";
import ListStores from "../../components/Stores/ListStores";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function Stores(props) {
  const { navigation } = props;
  const [user, setUser] = useState(null);
  const [stores, setStores] = useState([]);
  const [startStores, setStartStores] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalStores, setTotalStores] = useState(0);
  const [isReloadStores, setIsReloadStores] = useState(false);
  const limitStores = 12;

  useEffect(() => {
    firebase.auth().onAuthStateChanged(userInfo => {
      setUser(userInfo);
    });
  }, []);

  useEffect(() => {
    db.collection("stores")
      .get()
      .then(snap => {
        setTotalStores(snap.size);
      });

    (async () => {
      const resultStores = [];

      const stores = db
        .collection("stores")
        .orderBy("createAt", "desc")
        .limit(limitStores);

      await stores.get().then(response => {
        setStartStores(response.docs[response.docs.length - 1]);

        response.forEach(doc => {
          let store = doc.data();
          store.id = doc.id;
          resultStores.push({ store });
        });
        setStores(resultStores);
      });
    })();
    setIsReloadStores(false);
  }, [isReloadStores]);

  const handleLoadMore = async () => {
    const resultStores = [];
    stores.length < totalStores && setIsLoading(true);

    const storesDB = db
      .collection("stores")
      .orderBy("createAt", "desc")
      .startAfter(startStores.data().createAt)
      .limit(limitStores);

    await storesDB.get().then(response => {
      if (response.docs.length > 0) {
        setStartStores(response.docs[response.docs.length - 1]);
      } else {
        setIsLoading(false);
      }

      response.forEach(doc => {
        let store = doc.data();
        store.id = doc.id;
        resultStores.push({ store });
      });

      setStores([...stores, ...resultStores]);
    });
  };

  return (
    <View style={styles.viewBody}>
      <ListStores
        stores={stores}
        isLoading={isLoading}
        handleLoadMore={handleLoadMore}
        navigation={navigation}
      />
      {user && (
        <AddStoresButton
          navigation={navigation}
          setIsReloadStores={setIsReloadStores}
        />
      )}
    </View>
  );
}

function AddStoresButton(props) {
  const { navigation, setIsReloadStores } = props;
  return (
    <ActionButton
      buttonColor="#00a680"
      onPress={() => navigation.navigate("AddStores", { setIsReloadStores })}
    />
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  }
});
