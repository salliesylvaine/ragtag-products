//Initialize firebase Admin resources
import * as firebaseAdmin from "firebase-admin";
firebaseAdmin.initializeApp();

//references firestore sdk
export const db = firebaseAdmin.firestore();

//references auth sdk
export const auth = firebaseAdmin.auth();
