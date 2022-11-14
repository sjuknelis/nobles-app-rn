import React, { useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set as dSet } from 'firebase/database';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getCreds, requestAPI } from './requestAPI';

export const FirebaseContext = React.createContext();

const firebaseConfig = {
  apiKey: "AIzaSyA6psVQGugH5tf9ZNM6iT4zJQ7MMnU3KIQ",
  authDomain: "nobles-20183.firebaseapp.com",
  databaseURL: "https://nobles-20183-default-rtdb.firebaseio.com",
  projectId: "nobles-20183",
  storageBucket: "nobles-20183.appspot.com",
  messagingSenderId: "401842201893",
  appId: "1:401842201893:web:7f09b789d4b312874826cc"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();

function setupRef(path,data,setData) {
  onValue(ref(db,path),snapshot => {
    if ( data[path] ) return;
    let copy = Object.assign({},data);
    copy.data[path] = snapshot.val();
    setData(copy);
  });
}

export async function setupFirebase(data,setData) {
  const paths = [
    "global",
    "leaderboards/7",
    "leaderboards/8",
    "leaderboards/9",
    "leaderboards/10",
    "leaderboards/11",
    "leaderboards/12",
    "leaderboards/main",
    "leaderboards/old 2021-2022"
  ];
  for ( const path of paths ) setupRef(path,data,setData);

  const {pin,pno} = await getCreds();
  const aboutData = await requestAPI("aboutme.php");
  const email = `${aboutData.UNID}@nobles.edu`;
  signInWithEmailAndPassword(auth,email,pin.toLowerCase())
    .then(credential => {
      let copy = Object.assign({},data);
      copy.uid = credential.user.uid;
      setData(copy);
    })
    .catch(error => {
      console.error(error);
      if ( error.message == "Firebase: Error (auth/user-not-found)." ) {
        createUserWithEmailAndPassword(auth,email,pin.toLowerCase())
          .then(credential => {
            let copy = Object.assign({},data);
            copy.uid = credential.user.uid;
            setData(copy);
            console.error("created user",copy.uid);
          })
          .catch(error => {
            console.error(error);
          });
      }
    });
}

export async function setLeaderboardScore(firebaseData,selectedGrade,aboutData,score,updateScore) {
  if ( updateScore ) {
    dSet(ref(db,`leaderboards/${selectedGrade ? selectedGrade + 7 : "main"}/${firebaseData.uid}`),{
      i: aboutData.PeopleID,
      n: `${aboutData.FirstName} ${aboutData.lname}`,
      s: score
    });
  }
  let globalCopy = Object.assign({},firebaseData.data.global);
  globalCopy.games_played++;
  globalCopy.total_score += score;
  dSet(ref(db,"global"),globalCopy);
}