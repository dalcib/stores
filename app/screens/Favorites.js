import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import Loading from "../components/Loading";
import Toast from "react-native-easy-toast";
import { NavigationEvents } from "react-navigation";

import { firebaseApp } from "../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function Favorites(props) {
  const { navigation } = props;
  const [stores, setStores] = useState([]);
  const [reloadStores, setReloadStores] = useState(false);
  const [isVisibleLoading, setIsVisibleLoading] = useState(false);
  const [userLogged, setUserLogged] = useState(false);
  const toastRef = useRef();

  firebase.auth().onAuthStateChanged(user => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  useEffect(() => {
    if (userLogged) {
      const idUser = firebase.auth().currentUser.uid;
      db.collection("favorites")
        .where("idUser", "==", idUser)
        .get()
        .then(response => {
          const idStoresArray = [];
          response.forEach(doc => {
            idStoresArray.push(doc.data().idStore);
          });

          getDataStores(idStoresArray).then(response => {
            const stores = [];
            response.forEach(doc => {
              let store = doc.data();
              store.id = doc.id;
              stores.push(store);
            });
            setStores(stores);
          });
        });
    }
    setReloadStores(false);
  }, [reloadStores]);

  const getDataStores = idStoresArray => {
    const arrayStores = [];
    idStoresArray.forEach(idStore => {
      const result = db
        .collection("stores")
        .doc(idStore)
        .get();
      arrayStores.push(result);
    });
    return Promise.all(arrayStores);
  };

  if (!userLogged) {
    return (
      <UserNoLogged setReloadStores={setReloadStores} navigation={navigation} />
    );
  }

  if (stores.length === 0) {
    return <NotFoundStores setReloadStores={setReloadStores} />;
  }

  return (
    <View style={styles.viewBody}>
      <NavigationEvents onWillFocus={() => setReloadStores(true)} />
      {stores ? (
        <FlatList
          data={stores}
          renderItem={store => (
            <Store
              store={store}
              navigation={navigation}
              setIsVisibleLoading={setIsVisibleLoading}
              setReloadStores={setReloadStores}
              toastRef={toastRef}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderStore}>
          <ActivityIndicator size="large" />
          <Text>Cargando Veterinarias</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={1} />
      <Loading text="Eliminando Veterinaria" isVisible={isVisibleLoading} />
    </View>
  );
}

function Store(props) {
  const {
    store,
    navigation,
    setIsVisibleLoading,
    setReloadStores,
    toastRef
  } = props;
  const { id, name, images } = store.item;
  const [imageStore, setImageStore] = useState(null);
  const imageUri = imageStore != null ? imageStore : "";
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

  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Eliminar Veterinaria de Favoritos",
      "¿Estás seguro de que quieres eliminarlo?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: removeFavorite
        }
      ],
      { cancelable: false }
    );
  };

  const removeFavorite = () => {
    setIsVisibleLoading(true);
    db.collection("favorites")
      .where("idStore", "==", id)
      .where("idUser", "==", firebase.auth().currentUser.uid)
      .get()
      .then(response => {
        response.forEach(doc => {
          const idFavorite = doc.id;
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsVisibleLoading(false);
              setReloadStores(true);
              toastRef.current.show("Veterinaria eliminada correctamente");
            })
            .catch(() => {
              toastRef.current.show("Error al eliminar, inténtelo más tarde");
            });
        });
      });
  };

  return (
    <View style={styles.store}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Store", { store: store.item })}
      >
        <Image
          resizeMode="cover"
          source={imageUri.length != 0 ? { uri: imageUri } : null}
          style={styles.image}
          PlaceholderContent={<ActivityIndicator color="#fff" />}
        />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Icon
          type="material-community"
          name="heart"
          color="#e0115f"
          containerStyle={styles.favorite}
          onPress={confirmRemoveFavorite}
          size={40}
          underlayColor="transparent"
        />
      </View>
    </View>
  );
}

function NotFoundStores(props) {
  const { setReloadStores } = props;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NavigationEvents onWillFocus={() => setReloadStores(true)} />
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        No tienes veterinarias en tu lista
      </Text>
    </View>
  );
}

function UserNoLogged(props) {
  const { setReloadStores, navigation } = props;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <NavigationEvents onWillFocus={() => setReloadStores(true)} />
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Necesitas estar logeado para ver esta sección.
      </Text>
      <Button
        title="Ir al login"
        onPress={() => navigation.navigate("Login")}
        containerStyle={{ marginTop: 20, width: "80%" }}
        buttonStyle={{ backgroundColor: "#00a680" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#f2f2f2"
  },
  loaderStore: {
    marginTop: 10,
    marginBottom: 10
  },
  store: {
    margin: 10
  },
  image: {
    width: "100%",
    height: 180
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#fff"
  },
  name: {
    fontWeight: "bold",
    fontSize: 20
  },
  favorite: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100
  }
});
