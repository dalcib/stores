import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList } from "react-native";
import { Button, Avatar, Rating } from "react-native-elements";

import { firebaseApp } from "../../utils/firebase";
import firebase from "firebase/app";
import "firebase/firestore";
const db = firebase.firestore(firebaseApp);

export default function ListReviews(props) {
  const { navigation, idStore, setRating } = props;
  const [reviews, setReviews] = useState([]);
  const [reviewsReload, setReviewsReload] = useState(false);

  useEffect(() => {
    (async () => {
      const resultReviews = [];
      const arrayRating = [];

      db.collection("reviews")
        .where("idStore", "==", idStore)
        .get()
        .then(response => {
          response.forEach(doc => {
            resultReviews.push(doc.data());
            arrayRating.push(doc.data.rating);
          });

          let numSum = 0;
          arrayRating.map(value => {
            numSum = numSum + value;
          });
          const countRating = arrayRating.length;
          const resultRating = numSum / countRating;
          const resultRatingFinish = resultRating ? resultRating : 0;

          setReviews(resultReviews);
          setRating(resultRatingFinish);
        });

      setReviewsReload(false);
    })();
  }, [reviewsReload]);

  return (
    <View>
      <Button
        buttonStyle={styles.btnAddReview}
        titleStyle={styles.btnTitleAddReview}
        title="Escribir una opinión"
        icon={{
          type: "material-community",
          name: "square-edit-outline",
          color: "#00a680"
        }}
        onPress={() =>
          navigation.navigate("AddReviewStore", {
            idStore: idStore,
            setReviewsReload: setReviewsReload
          })
        }
      />
      <FlatList
        data={{ reviews }}
        renderItem={review => <Review review={review} />}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

function Review(props) {
  //const {} = props;

  return <Text>HOLA</Text>;
}

const styles = StyleSheet.create({
  btnAddReview: {
    backgroundColor: "transparent"
  },
  btnTitleAddReview: {
    color: "#00a680"
  }
});
