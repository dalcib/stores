import React, { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, Text, Dimensions } from "react-native";
import { Rating, Icon, ListItem } from "react-native-elements";
import Carousel from "../../components/Carousel";
import Map from "../../components/Map";
import ListReviews from "../../components/Stores/ListReviews";
import * as firebase from "firebase";

const screenWidth = Dimensions.get("window").width;

export default function Store(props) {
  const { navigation } = props;
  const { store } = navigation.state.params.store.item;
  const [imageStore, setImageStore] = useState([]);
  const [rating, setRating] = useState(store.rating);

  useEffect(() => {
    const arrayURLS = [];
    (async () => {
      await Promise.all(
        store.images.map(async idImage => {
          await firebase
            .storage()
            .ref(`stores-images/${idImage}`)
            .getDownloadURL()
            .then(imageURL => {
              arrayURLS.push(imageURL);
            });
        })
      );
      setImageStore(arrayURLS);
    })();
  }, []);

  return (
    <ScrollView style={styles.viewBody}>
      <Carousel arrayImages={imageStore} width={screenWidth} height={200} />
      <TitleStore
        name={store.name}
        description={store.description}
        rating={rating}
      />
      <StoreInfo
        location={store.location}
        name={store.name}
        address={store.address}
        phone={store.phone}
        email={store.email}
      />
      <ListReviews
        navigation={navigation}
        idStore={store.id}
        setRating={setRating}
      />
    </ScrollView>
  );
}

function TitleStore(props) {
  const { name, description, rating } = props;

  return (
    <View style={styles.viewStoreTitle}>
      <View style={{ flexDirection: "row" }}>
        <Text style={styles.nameStore}>{name}</Text>
        <Rating
          style={styles.rating}
          imageSize={20}
          readonly
          startingValue={parseFloat(rating)}
        />
      </View>
      <Text style={styles.descriptionStore}>{description}</Text>
    </View>
  );
}

function StoreInfo(props) {
  const { location, name, address, phone, email } = props;
  const listInfo = [
    {
      text: address,
      iconName: "map-marker",
      iconType: "material-community",
      action: null
    },
    {
      text: phone,
      iconName: "phone",
      iconType: "material-community",
      action: null
    },
    {
      text: email,
      iconName: "at",
      iconType: "material-community",
      action: null
    }
  ];

  return (
    <View style={styles.viewStoreInfo}>
      <Text style={styles.storeInfoTitle}>
        Información sobre la Veterinaria
      </Text>
      <Map location={location} name={name} height={100} />
      {listInfo.map((item, index) => (
        <ListItem
          key={index}
          title={item.text}
          leftIcon={{
            name: item.iconName,
            type: item.iconType,
            color: "#00a680"
          }}
          containerStyle={styles.containerListItem}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewStoreTitle: {
    margin: 15
  },
  nameStore: {
    fontSize: 20,
    fontWeight: "bold"
  },
  rating: {
    position: "absolute",
    right: 0
  },
  descriptionStore: {
    marginTop: 5,
    color: "grey"
  },
  viewStoreInfo: {
    margin: 15,
    marginTop: 25
  },
  storeInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1
  }
});
