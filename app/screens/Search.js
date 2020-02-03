import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, Image, Text } from "react-native";
import { SearchBar, ListItem, Icon } from "react-native-elements";
import { useDebouncedCallback } from "use-debounce";
import { FireSQL } from "firesql";
import firebase from "firebase/app";

const fireSQL = new FireSQL(firebase.firestore(), { includeId: "id" });

export default function Search(props) {
  const { navigation } = props;
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    onSearch();
  }, [search]);

  const [onSearch] = useDebouncedCallback(() => {
    if (search) {
      fireSQL
        .query(`SELECT * FROM stores WHERE name LIKE '${search}%'`)
        .then(response => {
          setStores(response);
        });
    }
  }, 300);

  return (
    <View>
      <SearchBar
        placeholder="Buscar veterinaria..."
        onChangeText={e => setSearch(e)}
        value={search}
        containerStyle={styles.searchBar}
      />
      {stores.length === 0 ? (
        <NoFoundStores />
      ) : (
        <FlatList
          data={stores}
          renderItem={store => <Store store={store} navigation={navigation} />}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

function Store(props) {
  const { store, navigation } = props;
  const { name, images } = store.item;
  const [imageStore, setImageStore] = useState(null);

  useEffect(() => {
    const image = images[0];
    firebase
      .storage()
      .ref(`stores-images/${image}`)
      .getDownloadURL()
      .then(response => {
        setImageStore(response);
      });
  }, []);

  return (
    <ListItem
      title={name}
      leftAvatar={{ source: { uri: imageStore } }}
      rightIcon={<Icon type="material-community" name="chevron-right" />}
      onPress={() => navigation.navigate("Store", { store: store.item })}
    />
  );
}

function NoFoundStores() {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={require("../../assets/img/no-result-found.png")}
        resizeMode="cover"
        style={{ width: 200, height: 200 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginBottom: 20
  }
});
