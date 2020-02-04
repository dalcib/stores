import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, View, ScrollView, Text, Dimensions } from "react-native";
import { Rating, Icon, ListItem } from "react-native-elements";
import Carousel from "../../components/Carousel";
import Map from "../../components/Map";
import ListReviews from "../../components/Stores/ListReviews";
import Toast from "react-native-easy-toast";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

const screenWidth = Dimensions.get("window").width;

export default function Store(props) {
  const { navigation } = props;
  const { store } = navigation.state.params;
  const [imageStore, setImageStore] = useState([]);
  const [rating, setRating] = useState(store.rating);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLogged, setUserLogged] = useState(false);
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

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

  useEffect(() => {
    if (userLogged) {
      db.collection("favorites")
        .where("idStore", "==", store.id)
        .where("idUser", "==", firebase.auth().currentUser.uid)
        .get()
        .then(response => {
          if (response.docs.length === 1) {
            setIsFavorite(true);
          }
        });
    }
  }, [userLogged]);

  const addFavorite = () => {
    if (!userLogged) {
      toastRef.current.show(
        "Para usar el sistema de favoritos debes iniciar sesión",
        2000
      );
    } else {
      const payload = {
        idUser: firebase.auth().currentUser.uid,
        idStore: store.id
      };

      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true);
          toastRef.current.show("Veterinaria añadida a la Lista de Favoritos");
        })
        .catch(() => {
          toastRef.current.show(
            "Error al añadir la veterinaria a la lista de favoritos, inténtelo más tarde",
            2000
          );
        });
    }
  };

  const removeFavorite = () => {
    db.collection("favorites")
      .where("idStore", "==", store.id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then(response => {
        response.forEach(doc => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsFavorite(false);
              toastRef.current.show("Veterinaria eliminada de favoritos");
            })
            .catch(() => {
              toastRef.current.show(
                "No se ha podido eliminar, inténtelo más tarde"
              );
            });
        });
      });
  };

  return (
    <ScrollView style={styles.viewBody}>
      <View style={styles.viewFavorite}>
        <Icon
          type="material-community"
          name={isFavorite ? "heart" : "heart-outline"}
          onPress={isFavorite ? removeFavorite : addFavorite}
          color={isFavorite ? "#e0115f" : "#000"}
          size={35}
          underlayColor="transparent"
        />
      </View>
      <Carousel arrayImages={imageStore} width={screenWidth} height={250} />
      <TitleStore
        name={store.name}
        description={store.description}
        rating={rating}
      />
      <StoreInfo
        location={store.location}
        city={store.city}
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
      <Toast ref={toastRef} position="center" opacity={0.5} />
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
  const { location, name, address, phone, email, city } = props;

  const listInfo = [
    {
      text: city,
      iconName: "city",
      iconType: "material-community",
      action: null
    },
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
  viewFavorite: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 100,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 15,
    paddingRight: 5
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
