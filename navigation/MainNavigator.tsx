import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useContext } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback, Pressable, Image, Easing, LayoutAnimation, BackHandler, ScrollView } from 'react-native';

import { Text, View, KEY_COLOR } from '../components/Themed';
import { FontAwesome } from '@expo/vector-icons';

import AboutMeScreen from '../screens/AboutMeScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import MenuScreen from '../screens/MenuScreen';
import AthleticsScreen from '../screens/AthleticsScreen';
import DirectoryScreen from '../screens/DirectoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { getCreds, requestAPI } from '../hooks/requestAPI';
import { initialWindowSafeAreaInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import HelpfulLinksScreen from '../screens/HelpfulLinksScreen';
import { getColors } from '../hooks/colorSchemeContext';
import { FlyingAnimContext } from '../hooks/flyingAnimContext';
import { getWindowHeight } from '../hooks/windowHeight';
import NameGameScreen from '../screens/NameGameScreen';
import { LockMenuContext } from '../hooks/lockMenuContext';

export function MainNavigator({ setNavigator }) {
  const [lockMenu,setLockMenu] = useContext(LockMenuContext);
  const [open,setOpenInternal] = useState(true);
  const setOpen = value => {
    if ( lockMenu ) return;
    setOpenInternal(value);
  };
  const [screen,setScreen] = useState("menu");
  const screens = {
    aboutme: {
      screen: (<AboutMeScreen openMenu={() => setOpen(! open)} />),
      icon: "id-card",
      title: "About Me"
    },
    schedule: {
      screen: (<ScheduleScreen openMenu={() => setOpen(! open)} />),
      icon: "calendar",
      title: "Schedule"
    },
    reservations: {
      screen: (<ReservationsScreen openMenu={() => setOpen(! open)} />),
      icon: "fort-awesome",
      title: "Reservations"
    },
    menu: {
      screen: (<MenuScreen openMenu={() => setOpen(! open)} />),
      icon: "cutlery",
      title: "Menu"
    },
    athletics: {
      screen: (<AthleticsScreen openMenu={() => setOpen(! open)} />),
      icon: "soccer-ball-o",
      title: "Athletics"
    },
    directory: {
      screen: (<DirectoryScreen openMenu={() => setOpen(! open)} isMenuOpen={open} />),
      icon: "address-book",
      title: "Directory"
    },
    helpfulLinks: {
      screen: (<HelpfulLinksScreen openMenu={() => setOpen(! open)} />),
      icon: "link",
      title: "Helpful Links"
    },
    namegame: {
      screen: (<NameGameScreen openMenu={() => setOpen(! open)} />),
      icon: "gamepad",
      title: "Name Game"
    },
    settings: {
      screen: (<SettingsScreen openMenu={() => setOpen(! open)} setNavigator={setNavigator} />),
      icon: "gear",
      title: "Settings"
    },
  };
  const guestAccessible = ["menu","athletics"];
  
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();
  const [screenY,setScreenY] = useState(0);
  const [screenWidth,setScreenWidth] = useState(0);
  const [screenHeight,setScreenHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(windowWidth * .7)).current;
  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: open ? windowWidth * .7 : 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
  },[slideAnim,open]);

  const scaleAnim = useRef(new Animated.Value(.85)).current;
  useEffect(() => {
    Animated.timing(
      scaleAnim,
      {
        toValue: open ? .85 : 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
  },[scaleAnim,open]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loadScreen = screenVal => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setScreen(screenVal);
    setTimeout(() => {
      setOpen(false);      
    },300);
  };

  const [settingsOpen,setSettingsOpen] = useState(false);
  const [settingsDisplayed,setSettingsDisplayed] = useState(false);
  const settingsFadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if ( settingsOpen ) setSettingsDisplayed(true);
    Animated.timing(
      settingsFadeAnim,
      {
        toValue: settingsOpen ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
    if ( ! settingsOpen ) {
      setTimeout(() => {
        setSettingsDisplayed(false);
      },250);
    }
  },[settingsFadeAnim,settingsOpen]);

  const [initTouchX,setInitTouchX] = useState(0);

  BackHandler.addEventListener("hardwareBackPress",() => {
    if ( ! open ) {
      setOpen(true);
      return true;
    } else if ( settingsOpen ) {
      setSettingsOpen(false);
      return true;
    }
    BackHandler.exitApp();
  });

  return (
    <>
      <MainMenu screens={screens} guestAccessible={guestAccessible} screen={screen} loadScreen={loadScreen} setSettingsOpen={setSettingsOpen} />
      <Animated.View
        style={{
          transform: [
            {translateX: slideAnim},
            {scaleX: scaleAnim},
            {scaleY: scaleAnim}
          ],
          opacity: fadeAnim,
          zIndex: 2
        }}
        onLayout={event => {
          const layout = event.nativeEvent.layout;
          setScreenY(layout.y);
          setScreenWidth(layout.width);
          setScreenHeight(layout.height);
        }}
        onTouchStart={event => setInitTouchX(event.nativeEvent.pageX)}
        onTouchEnd={event => {
          if ( initTouchX < 40 && initTouchX - event.nativeEvent.pageX < -20 ) setOpen(true);
        }}
      >
        { screens[screen].screen }
      </Animated.View>
      <Animated.View style={{
        display: open ? null : "none",
        position: "absolute",
        top: screenY,
        left: 0,
        width: screenWidth,
        height: screenHeight,
        borderRadius: 15,
        transform: [
          {translateX: slideAnim},
          {scaleX: scaleAnim},
          {scaleY: scaleAnim}
        ],
        zIndex: 10
      }}>
        <Pressable style={{
          width: "100%",
          height: "100%",
          borderRadius: 15,
          zIndex: 10
        }} onPressIn={() => setOpen(false)} />
      </Animated.View>
      <SlidingBox
        open={open}
        screenY={screenY}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        slideFactor={.61}
        scaleFactor={.81}
      />
      <SlidingBox
        open={open}
        screenY={screenY}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
        slideFactor={.51}
        scaleFactor={.74}
      />
      <Animated.View style={{
        display: settingsDisplayed ? null : "none",
        position: "absolute",
        top: insets.top,
        left: 0,
        width: windowWidth,
        height: windowHeight - insets.top - insets.bottom,
        zIndex: 3,
        opacity: settingsFadeAnim
      }}>
        <SettingsScreen openMenu={() => setSettingsOpen(false)} setNavigator={setNavigator} />
      </Animated.View>
    </>
  );
}

function MainMenu({ screens,guestAccessible,screen,loadScreen,setSettingsOpen }) {
  const {fgColor,bgColor,semiColor,semiShade} = getColors();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();

  const [buttonLayouts,setButtonLayouts] = useState({
    menu: {y: 0,height: 0}
  });
  const updateButtonLayout = (key,layout) => {
    const buttonLayoutsCopy = Object.assign({},buttonLayouts);
    buttonLayoutsCopy[key] = layout;
    setButtonLayouts(buttonLayoutsCopy);
  };

  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: buttonLayouts[screen].y - buttonLayouts.menu.y,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
  },[slideAnim,buttonLayouts,screen]);

  const [aboutData,setAboutData] = useState({});
  const [guest,setGuest] = useState(false);
  useEffect(() => {
    const fetchAboutData = async () => {
      const creds = await getCreds();
      if ( ! creds.pin ) {
        setGuest(true);
        return;
      }

      const data = await requestAPI("aboutme.php");
      let grade = 35 - parseInt(data.UNID.slice(-2));
      if ( ! (grade >= 9 && grade <= 12) ) grade = 0;
      data.grade = grade;
      setAboutData(data);
      setUserImage({
        uri: ! guest ? `https://nobilis.nobles.edu/images_sitewide/photos/${data.PeopleID}.jpeg` : ""
      });
    };

    fetchAboutData()
      .catch(console.error);
  },[]);
  
  const [userImage,setUserImage] = useState(require("../assets/images/guest.png"));

  const [scrollOuterHeight,setScrollOuterHeight] = useState(0);
  const [scrollInnerHeight,setScrollInnerHeight] = useState(0);

  return (
    <View>
      <View style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: windowHeight - insets.top - insets.bottom,
        justifyContent: "space-between"
      }}>
        <View style={{
          flex: 1
        }}>
          <View style={[styles.row,{
            paddingTop: 10,
            paddingBottom: 10,
            marginBottom: 10,
            borderBottomWidth: 1,
            borderColor: bgColor
          }]}>
            <Image
              style={{
                width: "25%",
                aspectRatio: 1,
                borderRadius: 10,
                marginLeft: 10,
                marginRight: 10,
              }}
              source={userImage}
              defaultSource={require("../assets/images/guest.png")}
              onError={() => setUserImage(require("../assets/images/guest.png"))}
            />
            <View>
              <Text style={{
                color: bgColor,
                fontSize: 27
              }}>{ ! guest ? aboutData.FirstName : "Guest" }</Text>
              <Text style={{
                color: bgColor,
                opacity: .5,
                fontSize: 16
              }}>{ aboutData.grade && ! guest ? `${aboutData.grade}th Grade` : "" }</Text>
            </View>
          </View>
          <ScrollView scrollEnabled={scrollInnerHeight > scrollOuterHeight} style={{
            flex: 1
          }} onLayout={event => {
            const layout = event.nativeEvent.layout;
            setScrollOuterHeight(layout.height);
          }}>
            <View onLayout={event => {
              const layout = event.nativeEvent.layout;
              setScrollInnerHeight(layout.height);
            }}>
              {
                Object.keys(screens).filter(key => key != "settings").filter(key => ! guest || guestAccessible.indexOf(key) > -1).map(key => (
                  <ScreenButton
                    key={key}
                    icon={screens[key].icon}
                    text={screens[key].title}
                    selected={screen == key}
                    onPress={() => loadScreen(key)}
                    updateLayout={layout => updateButtonLayout(key,layout)}
                  />
                ))
              }
              <View style={{
                height: 10
              }} />
            </View>
            <Animated.View style={{
              position: "absolute",
              top: buttonLayouts.menu.y,
              left: 0,
              width: windowWidth * .6,
              height: buttonLayouts.menu.height,
              backgroundColor: bgColor,
              borderTopRightRadius: 100,
              borderBottomRightRadius: 100,
              zIndex: -1,
              transform: [
                {translateY: slideAnim}
              ]
            }}></Animated.View>
          </ScrollView>
        </View>
        <View style={{
          marginLeft: 10,
          marginBottom: 20
        }}>
          <TouchableOpacity style={{
            width: "50%",
            marginBottom: 10,
            padding: 10,
            backgroundColor: bgColor,
            borderRadius: 15,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }} onPress={() => setSettingsOpen(true)}>
            <FontAwesome size={20} name="gear" color={fgColor} style={{
              paddingRight: 10
            }} />
            <Text style={{
              color: fgColor
            }}>Settings</Text>
          </TouchableOpacity>
          <Text style={{
            color: semiShade == "lightgray" ? "black" : "lightgray",
            opacity: .5,
            fontSize: 16
          }}>Stable Version 1.0-RN</Text>
        </View>
      </View>
    </View>
  );
}

function ScreenButton({ icon,text,selected,onPress,updateLayout }) {
  const {fgColor,bgColor} = getColors(selected);
  const windowWidth = Dimensions.get("window").width;

  return (
    <TouchableOpacity style={{
      flexDirection: "row",
      width: windowWidth * .6,
      alignItems: "center",
      borderTopRightRadius: 100,
      borderBottomRightRadius: 100,
      paddingTop: 5,
      paddingBottom: 5,
      marginTop: 5,
      marginBottom: 5
    }} onPress={onPress} onLayout={event => {
      updateLayout(event.nativeEvent.layout);
    }}>
      <View style={{
        flex: 1,
        alignItems: "center"
      }}>
        <FontAwesome size={20} name={icon} color={bgColor} />
      </View>
      <Text style={{
        flex: 4,
        fontSize: 20,
        color: bgColor,
        padding: 5
      }}>{ text }</Text>
    </TouchableOpacity>
  )
}

function SlidingBox({ open,screenY,screenWidth,screenHeight,slideFactor,scaleFactor }) {
  const {fgColor,bgColor,semiColor} = getColors();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();

  const slideAnim = useRef(new Animated.Value(windowWidth * slideFactor)).current;
  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: open ? windowWidth * slideFactor : 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
  },[slideAnim,open]);

  const scaleAnim = useRef(new Animated.Value(scaleFactor)).current;
  useEffect(() => {
    Animated.timing(
      scaleAnim,
      {
        toValue: open ? scaleFactor : 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
  },[scaleAnim,open]);

  return (
    <Animated.View style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: windowWidth,
      height: windowHeight,
      backgroundColor: semiColor == "white" ? "black" : "white",
      borderRadius: 15,
      opacity: 0.3,
      transform: [
        {translateX: slideAnim},
        {scaleX: scaleAnim},
        {scaleY: scaleAnim}
      ],
      zIndex: 1
    }} />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  }
});