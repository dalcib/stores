import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import Modal from "../Modal";
import uuid from "uuid/v4";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

const WidthScreen = Dimensions.get("window").width;

export default function AddStoreForm(props) {
  const { toastRef, setIsLoading, navigation, setIsReloadStores } = props;
  const [imagesSelected, setImagesSelected] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [phoneStore, setPhoneStore] = useState("");
  const [emailStore, setEmailStore] = useState("");
  const [isVisibleMap, setIsVisibleMap] = useState(false);
  const [locationStore, setLocationStore] = useState(null);

  const addStore = () => {
    if (!storeName || !storeAddress || !storeDescription) {
      toastRef.current.show("Todos los campos son obligatorios"), 2000;
    } else if (imagesSelected.length === 0) {
      toastRef.current.show("Debes subir al menos 1 imagen"), 2000;
    } else if (!locationStore) {
      toastRef.current.show("Debes localizar la Veterinaria en el Mapa"), 2000;
    } else {
      setIsLoading(true);
      uploadImageStorage(imagesSelected).then(arrayImages => {
        db.collection("stores")
          .add({
            name: storeName,
            address: storeAddress,
            description: storeDescription,
            location: locationStore,
            phone: phoneStore,
            email: emailStore,
            images: arrayImages,
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createAt: new Date(),
            createBy: firebase.auth().currentUser.uid
          })
          .then(() => {
            setIsLoading(false);
            setIsReloadStores(true);
            navigation.navigate("Stores");
          })
          .catch(() => {
            setIsLoading(false);
            toastRef.current.show("Error al crear, inténtelo más tarde");
          });
      });
    }
  };

  const uploadImageStorage = async imageArray => {
    const imageBlob = [];
    await Promise.all(
      imageArray.map(async image => {
        const response = await fetch(image);
        const blob = await response.blob();
        const ref = firebase
          .storage()
          .ref("stores-images")
          .child(uuid());
        await ref.put(blob).then(result => {
          imageBlob.push(result.metadata.name);
        });
      })
    );
    return imageBlob;
  };

  return (
    <ScrollView>
      <PortadaImageStore imageStore={imagesSelected[0]} />
      <FormAdd
        setStoreName={setStoreName}
        setStoreAddress={setStoreAddress}
        setStoreDescription={setStoreDescription}
        setPhoneStore={setPhoneStore}
        setEmailStore={setEmailStore}
        setIsVisibleMap={setIsVisibleMap}
        locationStore={locationStore}
      />
      <UploadImage
        imagesSelected={imagesSelected}
        setImagesSelected={setImagesSelected}
        toastRef={toastRef}
      />
      <Button
        title="Crear Veterinaria"
        onPress={addStore}
        buttonStyle={styles.btnAddStore}
      />
      <Map
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        setLocationStore={setLocationStore}
        toastRef={toastRef}
      />
    </ScrollView>
  );
}

function PortadaImageStore(props) {
  const { imageStore } = props;
  return (
    <View style={styles.viewPhoto}>
      {imageStore ? (
        <Image
          source={{ uri: imageStore }}
          style={{ width: WidthScreen, height: 200 }}
        />
      ) : (
        <Image
          source={require("../../../assets/img/no-image.png")}
          style={{ width: WidthScreen, height: 200 }}
        />
      )}
    </View>
  );
}

function UploadImage(props) {
  const { imagesSelected, setImagesSelected, toastRef } = props;
  const imageSelect = async () => {
    const resultPermission = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );
    const resultPermissionCamera =
      resultPermission.permissions.cameraRoll.status;

    if (resultPermission === "denied") {
      toastRef.current.show("Es necesario aceptar los permisos de la Galería"),
        3000;
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3]
      });

      if (result.cancelled) {
        toastRef.current.show(
          "Has cerrado la Galería sin seleccionar ninguna Imagen",
          2000
        );
      } else {
        setImagesSelected([...imagesSelected, result.uri]);
      }
    }
  };

  const removeImage = image => {
    const arrayImages = imagesSelected;
    Alert.alert(
      "Eliminar Imagen",
      "¿Estás seguro de que quieres eliminar la imagen?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          onPress: () =>
            setImagesSelected(
              arrayImages.filter(imageUrl => imageUrl !== image)
            )
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.viewImages}>
      {imagesSelected.length < 5 && (
        <Icon
          type="material-community"
          name="camera"
          color="#a7a7a7"
          containerStyle={styles.containerIcon}
          onPress={imageSelect}
        />
      )}

      {imagesSelected.map(imageStore => (
        <Avatar
          key={imageStore}
          onPress={() => removeImage(imageStore)}
          style={styles.miniatureStyle}
          source={{ uri: imageStore }}
        />
      ))}
    </View>
  );
}

function FormAdd(props) {
  const {
    setStoreName,
    setStoreAddress,
    setStoreDescription,
    setPhoneStore,
    setEmailStore,
    setIsVisibleMap,
    locationStore
  } = props;
  return (
    <View styles={styles.viewForm}>
      <Input
        placeholder="Nombre Veterinaria"
        containerStyle={styles.input}
        onChange={e => setStoreName(e.nativeEvent.text)}
      />
      <Input
        placeholder="Dirección"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "google-maps",
          color: locationStore ? "#00a680" : "#c2c2c2",
          onPress: () => setIsVisibleMap(true)
        }}
        onChange={e => setStoreAddress(e.nativeEvent.text)}
      />
      <Input
        placeholder="Teléfono"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "phone"
        }}
        onChange={e => setPhoneStore(e.nativeEvent.text)}
      />
      <Input
        placeholder="Correo de Contacto"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "at"
        }}
        onChange={e => setEmailStore(e.nativeEvent.text)}
      />
      <Input
        placeholder="Descripción"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={e => setStoreDescription(e.nativeEvent.text)}
      />
    </View>
  );
}

function Map(props) {
  const { isVisibleMap, setIsVisibleMap, setLocationStore, toastRef } = props;
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const resultPermissions = await Permissions.askAsync(
        Permissions.LOCATION
      );
      const statusPermissions = resultPermissions.permissions.location.status;

      if (statusPermissions !== "granted") {
        toastRef.current.show("Debes aceptar los permisos de ubicación"), 3000;
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001
        });
      }
    })();
  }, []);

  const confirmLocation = () => {
    setLocationStore(location);
    toastRef.current.show("Localización Guardada");
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={region => setLocation(region)}
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              draggable
            />
          </MapView>
        )}
        <View style={styles.viewMapBtn}>
          <Button
            title="Guardar"
            onPress={confirmLocation}
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
          />
          <Button
            title="Cancelar"
            onPress={() => setIsVisibleMap(false)}
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewPhoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 20
  },
  viewImages: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    backgroundColor: "#e3e3e3"
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10
  },
  input: {
    marginBottom: 10
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0
  },
  mapStyle: {
    width: "100%",
    height: 550
  },
  viewMapBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  viewMapBtnContainerSave: {
    paddingRight: 5
  },
  viewMapBtnSave: {
    backgroundColor: "#00a680"
  },
  viewMapBtnContainerCancel: {
    paddingLeft: 5
  },
  viewMapBtnCancel: {
    backgroundColor: "#a60d0c"
  },
  btnAddStore: {
    backgroundColor: "#00a680",
    margin: 20
  }
});
