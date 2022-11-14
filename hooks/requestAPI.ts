import AsyncStorage from "@react-native-async-storage/async-storage";

const parseString = require('react-native-xml2js').parseString;
const XMLParser = require('react-xml-parser');

function processHashSeparated(text) {
  const data = text.split("#");
  let obj = {};
  for ( let i in data ) {
    if ( data[i] != "" ) {
      const split = data[i].split(":");
      obj[split[0]] = split[1];
    }
  }
  return obj;
}

export async function getCreds() {
  try {
    const jsonValue = await AsyncStorage.getItem("@creds");
    return (jsonValue ? JSON.parse(jsonValue) : {loggedIn: false});
  } catch ( err ) {
    console.error(err);
  }
}

export async function requestAPI(path,useOtherParser) {
  let uri = `https://nobilis.nobles.edu${path.indexOf("/") == -1 ? "/iosNoblesAppWeb" : ""}/${path}`;
  if ( path.indexOf("?") == -1 ) {
    const {pin,pno} = await getCreds();
    uri += `?iosPIN=${pin}&PeopleID=${pno}`;
  }
  const response = await fetch(uri);
  const text = await response.text();
  if ( text.startsWith("error") ) {
    return "error";
  } else if ( ! text.startsWith("<") ) {
    return processHashSeparated(text);
  } else {
    return new Promise((resolve,reject) => {
      if ( useOtherParser ) {
        resolve(new XMLParser().parseFromString(text));
      } else {
        parseString(text,(err,result) => {
          if ( err ) reject(err);
          resolve(result);
        });
      }
    });
  }
}

export async function tryLogIn(pinValue) {
  if ( ! pinValue ) {
    await AsyncStorage.setItem("@creds",JSON.stringify({
      loggedIn: true,
      pin: null,
      pno: null
    }));
    return {
      name: "Guest",
      grade: 0
    };
  }

  const uri = `https://nobilis.nobles.edu/iosNoblesAppWeb/aboutme.php?iosPIN=${pinValue}`;
  const response = await fetch(uri);
  const text = await response.text();
  if ( text == "InvalidPIN" ) {
    return null;
  } else {
    const personInfo = processHashSeparated(text);
    await AsyncStorage.setItem("@creds",JSON.stringify({
      loggedIn: true,
      pin: pinValue,
      pno: personInfo.PeopleID
    }));
    return {
      name: personInfo.FirstName,
      grade: personInfo.Grade
    };
  }
}

export async function logOut() {
  await AsyncStorage.setItem("@creds",JSON.stringify({
    loggedIn: false
  }));
  await AsyncStorage.setItem("@colorscheme",JSON.stringify({
    scheme: 0
  }));
  await AsyncStorage.setItem("@gamestats",JSON.stringify({
    highscore: 0,
    highscoreGrade: 0,
    games: 0
  }));
}