import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Card, Image, Icon, Rating } from "react-native-elements";
import * as firebase from "firebase";

export default function ListTopStores(props) {
  const { stores, navigation } = props;
  return (
    <FlatList
      data={stores}
      renderItem={store => <Store store={store} navigation={navigation} />}
      keyExtractor={(item, index) => index.toString()}
    />
  );
}

function Store(props) {
  const { store, navigation } = props;
  const { name, description, images, rating } = store.item;
  const [imageStore, setImageStore] = useState(null);
  const [iconColor, setIconColor] = useState("#000");

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

  useEffect(() => {
    if (store.index === 0) {
      setIconColor("#efb819");
    } else if (store.index === 1) {
      setIconColor("#e3e4e5");
    } else if (store.index === 2) {
      setIconColor("#cd7f32");
    }
  }, []);

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Store", {
          store: store.item
        })
      }
    >
      <Card containerStyle={styles.containerCard}>
        <Icon
          type="material-community"
          name="chess-queen"
          color={iconColor}
          size={40}
          containerStyle={styles.containerIcon}
        />
        <Image
          style={styles.storeImage}
          resizeMode="cover"
          source={{ uri: imageStore }}
        />
        <View style={styles.titleRating}>
          <Text style={styles.title}>{name}</Text>
          <Rating
            imageSize={20}
            startingValue={rating}
            readonly
            style={styles.rating}
          />
        </View>
        <Text style={styles.description}>{description}</Text>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerCard: {
    marginBottom: 30,
    borderWidth: 0
  },
  containerIcon: {
    position: "absolute",
    top: -30,
    left: -30,
    zIndex: 1
  },
  storeImage: {
    width: "100%",
    height: 200
  },
  titleRating: {
    flexDirection: "row",
    marginTop: 10
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  description: {
    color: "grey",
    marginTop: 0,
    textAlign: "justify"
  }
});
