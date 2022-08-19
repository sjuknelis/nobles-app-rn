import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, TextInput, TouchableOpacity, View as DefaultView } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Linking from 'expo-linking';

import { BigButton, KEY_COLOR, Text, View } from "../components/Themed";
import { tryLogIn } from "../hooks/requestAPI";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWindowHeight } from "../hooks/windowHeight";

export default function LogInScreen({ setNavigator }) {
  const [phase,setPhase] = useState("anim");
  const [pinValue,setPINValue] = useState(null);
  const [lastCopyTried,setLastCopyTried] = useState(null);
  const phases = {
    anim: (<StartAnimation />),
    entry: (<EntryScreen setPhase={setPhase} setPINValue={setPINValue} lastCopyTried={lastCopyTried} setLastCopyTried={setLastCopyTried} />),
    message: (<WelcomeMessage setPhase={setPhase} pinValue={pinValue} setNavigator={setNavigator} />)
  };

  useEffect(() => {
    setTimeout(() => {
      setPhase("entry");
    },3000);
  },[]);

  return (
    <View style={{
      backgroundColor: "white"
    }}>
      { phases[phase] }
    </View>
  );
}

function StartAnimation() {
  const windowWidth = Dimensions.get("window").width;
  console.log(windowWidth)
  const imageView = useRef();
  const [imageFinalPX,setImageFinalPX] = useState(0);
  const [imagePY,setImagePY] = useState(0);

  const [startAnims,setStartAnims] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if ( startAnims ) {
      Animated.timing(
        slideAnim,
        {
          toValue: imageFinalPX - (windowWidth / 2 - 45),
          duration: 250,
          useNativeDriver: true
        }
      ).start();
    }
  },[slideAnim,startAnims]);
  useEffect(() => {
    if ( startAnims ) {
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }
    ).start();
    }
  },[fadeAnim,startAnims]);

  setTimeout(() => {
    setStartAnims(true);
  },1000);

  const ANIM_FONT_SIZE_FACTOR = 32 / (390 - 90);

  return (
    <>
      <View style={[styles.row,{
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
      }]}>
        <DefaultView style={{
          backgroundColor: "white",
          paddingRight: 5,
          opacity: 0
        }} ref={imageView} onLayout={event => {
          const layout = event.nativeEvent.layout;
          setImageFinalPX(layout.x);
          setImagePY(layout.y);
        }}>
          <Image
            style={{
              width: 90,
              height: 90
            }}
            source={require("../assets/images/schoollogos/Nobles.png")}
          />
        </DefaultView>
        <Animated.View style={{
          opacity: fadeAnim
        }}>
          <Text style={{
            fontSize: ANIM_FONT_SIZE_FACTOR * (windowWidth - 90)
          }}>Noble and Greenough</Text>
          <Text style={{
            fontSize: ANIM_FONT_SIZE_FACTOR * (windowWidth - 90)
          }}>School</Text>
        </Animated.View>
      </View>
      <Animated.View style={{
        position: "absolute",
        top: imagePY,
        left: windowWidth / 2 - 45,
        transform: [
          {translateX: slideAnim}
        ]
      }}>
        <Image
          style={{
            width: 90,
            height: 90
          }}
          source={require("../assets/images/schoollogos/Nobles.png")}
        />
      </Animated.View>
    </>
  );
}

function EntryScreen({ setPhase,setPINValue,lastCopyTried,setLastCopyTried }) {
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();

  const pinInput = useRef();
  const [pinInputValue,setPINInputValue] = useState("");

  const tryPINFromClipboard = async () => {
    const clipValue = await Clipboard.getStringAsync();
    if ( clipValue.length == 8 && clipValue != lastCopyTried ) {
      setLastCopyTried(clipValue);
      setPINValue(clipValue);
      setPhase("message");
    }
  };
  useEffect(() => {
    tryPINFromClipboard()
      .catch(console.error);
  },[]);
  
  const [inputOpen,setInputOpenInternal] = useState(false);
  const setInputOpen = value => {
    if ( value ) pinInput.current.focus();
    else pinInput.current.blur();
    tryPINFromClipboard();
    setInputOpenInternal(value);
  };

  const scrollAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(
      scrollAnim,
      {
        toValue: inputOpen ? -windowHeight : 0,
        duration: 250,
        useNativeDriver: true
      }
    ).start();
  },[scrollAnim,inputOpen]);

  return (
    <>
      <Animated.View style={{
        height: windowHeight,
        padding: 15,
        justifyContent: "space-between",
        transform: [
          {translateY: scrollAnim}
        ]
      }}>
        <View>
          <Text style={{
            fontFamily: "EBGaramond_700Bold",
            fontSize: 35,
            paddingBottom: 10
          }}>Welcome</Text>
          <Text style={{
            fontSize: 18
          }}>
            The Nobles app is the perfect place to see everything happening at Nobles. Guests can view sports scores, upcoming events, and the school calendar. Students and faculty can also view their schedules, make dining reservations, search the directory, and do much more!
          </Text>
          <View style={{
            marginTop: 30,
            justifyContent: "center"
          }}>
            <Text style={styles.centerText}>Please log in with your PIN,</Text>
            <Text style={styles.centerText}>or continue as a guest to get started</Text>
            <View style={[styles.row,{
              marginTop: 20
            }]}>
              <BigButton text="Enter PIN" icon="key" style={{
                marginBottom: 0
              }} onPress={() => setInputOpen(true)}/>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[{
                flex: 1,
                marginLeft: 10,
                marginRight: 10,
                marginBottom: 10,
                padding: 10,
                backgroundColor: "white",
                color: "white",
                borderRadius: 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center"
              }]} onPress={() => {
                setPINValue(null);
                setPhase("message");
              }}>
                <Text>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity style={{
          transform: [
            {translateY: -insets.bottom - 50}
          ]
        }} onPress={() => {
          Linking.openURL("https://mail.google.com/mail/mu/mp/710/#tl/search/Your%20pin%20for%20the%20Nobles%20app%20is%20here");
        }}>
          <Text style={{
            textAlign: "center",
            fontSize: 16
          }}>Where do I find my pin? Tap HERE or search for 'Your pin for the Nobles app is here' in your Nobles inbox.</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={{
        height: windowHeight,
        padding: 15,
        transform: [
          {translateY: scrollAnim}
        ]
      }}>
        <TouchableOpacity style={{
          width: 100,
          paddingLeft: 10,
          marginBottom: 40,
        }} onPress={() => setInputOpen(false)}>
          <FontAwesome size={30} name="chevron-left" color={KEY_COLOR} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => pinInput.current.focus()}>
          <LetterItem letter={pinInputValue.charAt(0) || "-"} />
          <LetterItem letter={pinInputValue.charAt(1) || "-"} />
          <LetterItem letter={pinInputValue.charAt(2) || "-"} />
          <LetterItem letter={pinInputValue.charAt(3) || "-"} />
          <LetterItem letter={pinInputValue.charAt(4) || "-"} />
          <LetterItem letter={pinInputValue.charAt(5) || "-"} />
          <LetterItem letter={pinInputValue.charAt(6) || "-"} />
          <LetterItem letter={pinInputValue.charAt(7) || "-"} />
        </TouchableOpacity>
        <View style={[styles.row,{
          marginTop: 15
        }]}>
          <BigButton text="Log In" style={{
            marginLeft: "25%",
            marginRight: "25%"
          }} onPress={() => {
            setPINValue(pinInputValue);
            setPhase("message");
          }} />
        </View>
        <TextInput style={{
          display: "none"
        }} onChangeText={setPINInputValue} ref={pinInput} />
      </Animated.View>
    </>
  );
}

function LetterItem({ letter,pinValue }) {
  return (
    <View style={{
      flex: 1,
      borderBottomWidth: 3,
      borderColor: KEY_COLOR,
      marginLeft: 3,
      marginRight: 3
    }}>
      <Text style={{
        width: "100%",
        fontSize: 40,
        fontFamily: "EBGaramond_700Bold",
        textAlign: "center"
      }}>{ letter }</Text>
    </View>
  );
}

function WelcomeMessage({ setPhase,pinValue,setNavigator }) {
  const [name,setName] = useState(null);

  useEffect(() => {
    const tryEnteredPIN = async () => {
      const personInfo = await tryLogIn(pinValue);
      if ( personInfo ) {
        setName(personInfo.name);
        setTimeout(() => {
          setNavigator("main");
        },2000);
      } else {
        setPhase("entry");
      }
    };

    tryEnteredPIN()
      .catch(console.error);
  },[pinValue]);

  return (
    <View style={[styles.row,{
      height: "100%",
      alignItems: "center",
      justifyContent: "center"
    }]}>
      <Text style={{
        fontSize: 35,
        fontFamily: name ? "EBGaramond_700Bold" : "EBGaramond_400Regular"
      }}>{ name ? `Welcome, ${name}!` : `Loading...` }</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  },
  animText: {
    fontSize: 32
  },
  centerText: {
    textAlign: "center"
  }
});