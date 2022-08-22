//alternative way to access db and auth sdks to use in front-end

// import firebase from "firebase/compat/app";
// import "firebase/compat/auth";
// import "firebase/compat/firestore";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/// App's Firebase configuration ///
export const firebaseConfig = {
  apiKey: "AIzaSyBPGFsHysID6yKcLAZXNv3G2u558ynGb_c",
  authDomain: "ragtag-products.firebaseapp.com",
  projectId: "ragtag-products",
  storageBucket: "ragtag-products.appspot.com",
  messagingSenderId: "439413832259",
  appId: "1:439413832259:web:081fceb0ae56e5e7d172f6",
};

//Initialize Firebase
export const app = initializeApp(firebaseConfig);
//Initialize cloud Firestore and get a reference to the service
export const db = getFirestore(app);
//Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
