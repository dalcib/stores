import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAJO5l9th9fo6WwhuyXmx_tGTd-_teIVeQ",
  authDomain: "stores-66192.firebaseapp.com",
  databaseURL: "https://stores-66192.firebaseio.com",
  projectId: "stores-66192",
  storageBucket: "stores-66192.appspot.com",
  messagingSenderId: "38803141652",
  appId: "1:38803141652:web:10e4c3e5d8460acb6e2301"
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
