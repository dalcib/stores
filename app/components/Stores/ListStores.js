import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { Image } from "react-native-elements";
import * as firebase from "firebase";

export default function ListStores(props) {
  const { stores, isLoading, handleLoadMore } = props;
  return (
    <View>
      {stores ? (
        <FlatList
          data={stores}
          renderItem={store => <Store store={store} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0}
          ListFooterComponent={<FooterList isLoading={isLoading} />}
        />
      ) : (
        <View style={styles.loaderStores}>
          <ActivityIndicator size="large" />
          <Text>Cargando Veterinarias</Text>
        </View>
      )}
    </View>
  );
}

function Store(props) {
  const { store } = props;
  const { name, address, description, images } = store.item.store;
  const [imageStore, setImageStore] = useState(null);

  useEffect(() => {
    const image = images[0];
    firebase
      .storage()
      .ref(`stores-images/${image}`)
      .getDownloadURL()
      .then(result => {
        setImageStore(result);
      });
  });

  return (
    <TouchableOpacity onPress={() => console.log("ir al store")}>
      <View style={styles.viewStore}>
        <View style={styles.viewStoreImage}>
          <Image
            resizeMode="cover"
            source={{ uri: imageStore }}
            style={styles.imageStore}
            PlaceholderContent={<ActivityIndicator color="#fff" />}
          />
        </View>
        <View>
          <Text style={styles.storeName}>{name}</Text>
          <Text style={styles.storeAddress}>{address}</Text>
          <Text style={styles.storeDescription}>
            {description.substr(0, 60)}...
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FooterList(props) {
  const { isLoading } = props;

  if (isLoading) {
    return (
      <View style={styles.loadingStores}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return (
      <View style={styles.notFoundStores}>
        <Text>No hay más Veterinarias por cargar</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingStores: {
    marginTop: 20,
    alignItems: "center"
  },
  viewStore: {
    flexDirection: "row",
    margin: 10
  },
  viewStoreImage: {
    marginRight: 15
  },
  imageStore: {
    width: 80,
    height: 80
  },
  storeName: {
    fontWeight: "bold"
  },
  storeAddress: {
    paddingTop: 2,
    color: "grey"
  },
  storeDescription: {
    paddingTop: 2,
    color: "grey",
    width: 300
  },
  loaderStores: {
    marginTop: 10,
    marginBottom: 10
  },
  notFoundStores: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center"
  }
});
