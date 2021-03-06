import React, { useState, useRef } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { AirbnbRating, Button, Input } from "react-native-elements";
import Toast from "react-native-easy-toast";
import Loading from "../../components/Loading";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function AddReviewStore(props) {
  const { navigation } = props;
  const { idStore, setReviewsReload } = navigation.state.params;
  const [rating, setRating] = useState(null);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toastRef = useRef();

  const addReview = () => {
    if (rating === null) {
      toastRef.current.show("No has dado ninguna puntuación");
    } else if (!title) {
      toastRef.current.show("El título es obligatorio");
    } else if (!review) {
      toastRef.current.show("El comentario es obligatorio");
    } else {
      setIsLoading(true);
      const user = firebase.auth().currentUser;
      const payload = {
        idUser: user.uid,
        avatarUser: user.photoURL,
        idStore: idStore,
        title: title,
        review: review,
        rating: rating,
        createAt: new Date()
      };

      db.collection("reviews")
        .add(payload)
        .then(() => {
          updateStore();
        })
        .catch(() => {
          toastRef.current.show(
            "Error al enviar el comentario, inténtelo más tarde"
          );
          setIsLoading(false);
        });
    }
  };

  const updateStore = () => {
    const storeRef = db.collection("stores").doc(idStore);

    storeRef.get().then(response => {
      const storeData = response.data();
      const ratingTotal = storeData.ratingTotal + rating;
      const quantityVoting = storeData.quantityVoting + 1;
      const ratingResult = ratingTotal / quantityVoting;

      storeRef
        .update({ rating: ratingResult, ratingTotal, quantityVoting })
        .then(() => {
          setIsLoading(false);
          setReviewsReload(true);
          navigation.goBack();
        });
    });
  };

  return (
    <ScrollView>
      <View style={styles.viewBody}>
        <View style={styles.viewRating}>
          <AirbnbRating
            count={5}
            reviews={[
              "Pésimo",
              "Deficiente",
              "Normal",
              "Muy Bueno",
              "Excelente"
            ]}
            defaultRating={0}
            size={35}
            onFinishRating={value => setRating(value)}
          />
        </View>
        <View style={styles.formReview}>
          <Input
            placeholder="Título"
            containerStyle={styles.input}
            onChange={e => setTitle(e.nativeEvent.text)}
          />
          <Input
            placeholder="Comentario..."
            multiline={true}
            inputContainerStyle={styles.textArea}
            onChange={e => setReview(e.nativeEvent.text)}
          />
          <Button
            title="Enviar Comentario"
            onPress={addReview}
            containerStyle={styles.btnContainer}
            buttonStyle={styles.btn}
          />
        </View>
        <Toast ref={toastRef} position="center" opacity={0.5} />
        <Loading isVisible={isLoading} text="Enviando comentario" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewBody: {
    flex: 1
  },
  viewRating: {
    height: 110,
    backgroundColor: "#f2f2f2"
  },
  formReview: {
    margin: 10,
    marginTop: 40,
    flex: 1,
    alignItems: "center"
  },
  input: {
    marginBottom: 10
  },
  textArea: {
    height: 150,
    width: "100%",
    padding: 0,
    margin: 0
  },
  btnContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginTop: 20,
    marginBottom: 10,
    width: "95%"
  },
  btn: {
    backgroundColor: "#00a680"
  }
});
