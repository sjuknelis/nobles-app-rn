import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, EBGaramond_400Regular, EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';

import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';

import React, { useEffect, useState } from 'react';
import { KEY_COLOR } from './components/Themed';
import { MainNavigator } from './navigation/MainNavigator';
import LogInScreen from './screens/LogInScreen';

import { FlyingAnimContext } from './hooks/flyingAnimContext';
import { AboutMeFlyingAnimController } from './components/AboutMeFlyingAnimController';
import { ModalContext } from './hooks/modalContext';
import { ModalController } from './components/ModalController';
import { getCreds } from './hooks/requestAPI';
import { ColorSchemeContext, getInitColorScheme, SCHEMES } from './hooks/colorSchemeContext';
import { Platform, UIManager } from 'react-native';
import { FirebaseContext, setupFirebase } from './hooks/firebaseContext';
import { LockMenuContext } from './hooks/lockMenuContext';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function App() {
  const [navigatorInUse,setNavigatorInUse] = useState(null);
  const navigators = {
    main: (<MainNavigator setNavigator={setNavigatorInUse} />),
    login: (<LogInScreen setNavigator={setNavigatorInUse} />)
  };
  useEffect(() => {
    const checkCreds = async () => {
      const creds = await getCreds();
      setNavigatorInUse(creds.loggedIn ? "main" : "login");
    };

    checkCreds()
      .catch(console.error);
  },[]);

  const [colorScheme,setColorScheme] = useState(0);
  const [firebaseData,setFirebaseData] = useState({
    uid: null,
    data: {}
  });
  useEffect(() => {
    setupFirebase(firebaseData,setFirebaseData);
  },[]);
  (async () => {
    setColorScheme(await getInitColorScheme());
  })();
  const [modalData,setModalData] = useState({
    open: false
  });
  const [flyingAnimData,setFlyingAnimData] = useState({
    aboutme: {
      animateNow: null,
      finalPos: null,
      origin: {
        Financial: {px: 0,py : 0},
        "Community Service": {px: 0,py : 0},
        "Locker Combo": {px: 0,py : 0},
      },
      dest: {px: 0,py: 0}
    }
  });
  const [lockMenu,setLockMenu] = useState(false);

  let [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_700Bold,
    Nunito_400Regular,
    Nunito_700Bold
  });
  const isLoadingComplete = useCachedResources();
  if ( ! isLoadingComplete || ! fontsLoaded ) return null;

  const bgColor = navigatorInUse == "main" ? SCHEMES[colorScheme][0] : "white";
  
  return (
    <ColorSchemeContext.Provider value={[colorScheme,setColorScheme]}>
      <ModalContext.Provider value={[modalData,setModalData]}>
        <FirebaseContext.Provider value={[firebaseData,setFirebaseData]}>
          <FlyingAnimContext.Provider value={[flyingAnimData,setFlyingAnimData]}>
            <LockMenuContext.Provider value={[lockMenu,setLockMenu]}>
              <SafeAreaProvider style={{
                backgroundColor: bgColor
              }}>
                <SafeAreaView>
                  { navigators[navigatorInUse] || null }
                </SafeAreaView>
                { true ? (<AboutMeFlyingAnimController />) : null }
                <ModalController />
              </SafeAreaProvider>
              <StatusBar style={navigatorInUse == "main" ? (SCHEMES[colorScheme][1] == "white" ? "light" : "dark") : "dark"} backgroundColor={bgColor} />
            </LockMenuContext.Provider>
          </FlyingAnimContext.Provider>
        </FirebaseContext.Provider>
      </ModalContext.Provider>
    </ColorSchemeContext.Provider>
  );
}