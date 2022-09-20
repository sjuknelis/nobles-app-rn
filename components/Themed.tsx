import { useEffect, useRef, useContext, useState } from 'react';
import { StyleSheet, Text as DefaultText, View as DefaultView, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getColors } from '../hooks/colorSchemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getWindowHeight } from '../hooks/windowHeight';
import Lottie from 'lottie-react-native';

export const KEY_COLOR = "rgb(25,61,119)";

export function Text(props) {
  const {style,textRef,...otherProps} = props;
  const {fgColor,bgColor} = getColors();

  return <DefaultText style={[{
    color: fgColor,
    fontSize: 20,
    fontFamily: "EBGaramond_400Regular"
  },style]} ref={textRef} {...otherProps} />;
}

export function View(props) {
  const {style,...otherProps} = props;
  const {fgColor,bgColor} = getColors();

  return <DefaultView style={[style]} {...otherProps} />;
}

export function Container({ children,title,titleSize,upperChildren,minUpperHeight,menuButton,noContrastBG,style,...otherProps }) {
  const {fgColor,bgColor} = getColors();
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();

  return (
    <View style={[{
      height: windowHeight,
      backgroundColor: fgColor,
      zIndex: 10,
      paddingTop: insets.top,
      transform: [
        {translateY: -insets.top}
      ]
    },style]}>
      <DefaultView style={{
        flexDirection: "row",
        width: "100%",
        height: minUpperHeight || null,
        zIndex: 10
      }}>
        <TouchableOpacity style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 90
        }} onPress={(menuButton || {action: () => {}}).action}>
          <FontAwesome size={30} name={(menuButton || {icon: "bars"}).icon} color={bgColor} />
        </TouchableOpacity>
        <View style={{
          flex: 3,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={{
            color: bgColor,
            fontFamily: "EBGaramond_700Bold",
            fontSize: 35,
            textAlign: "center"
          }} adjustsFontSizeToFit={true} numberOfLines={1}>
            { title }
          </Text>
        </View>
        <View style={{
          flex: 1
        }}>
          
        </View>
      </DefaultView>
      <View style={{
        zIndex: 10
      }}>
        { upperChildren }
      </View>
      <View style={{
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: Platform.OS == "ios" ? 15 : 0,
        borderBottomRightRadius: Platform.OS == "ios" ? 15 : 0,
        padding: 5,
        marginTop: 10,
        backgroundColor: ! noContrastBG ? bgColor : fgColor
      }}>
        { children }
      </View>
    </View>
  );
}

export function BigButton(props) {
  const {icon,text,inverted,onPress,size,style,...otherProps} = props;
  const {fgColor,bgColor} = getColors(! inverted);

  return (
    <TouchableOpacity style={[{
      flex: 1,
      margin: 10,
      padding: 10,
      backgroundColor: bgColor,
      color: fgColor,
      borderRadius: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center"
    },style]} onPress={onPress}>
      { icon ? (
        <FontAwesome size={size || 20} name={icon} color={fgColor} style={{
          paddingRight: 10
        }} />
      ) : null }
      <Text style={{
        color: fgColor,
        fontSize: size || 20
      }}>{ text }</Text>
    </TouchableOpacity>
  )
}

export function LoadingItem(props) {
  const {anim,style,...otherProps} = props;
  const anims = {
    athletics: require("../lottie/athletics.json"),
    directory: require("../lottie/directory.json"),
    menu: require("../lottie/menu.json"),
    namegame: require("../lottie/namegame.json"),
    schedule: require("../lottie/schedule.json")
  };

  return (
    <View style={[{
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      margin: anim ? 50 : 0
    },style]} {...otherProps}>
      {
        anim ? (
          <Lottie source={anims[anim]} autoPlay loop />
        ) : (
          <Text style={{
            fontSize: 35,
            fontFamily: "EBGaramond_700Bold"
          }}>Loading...</Text>
        )
      }
    </View>
  );
}

export function CheckboxSet({ labels,setSelected }) {
  const {fgColor,bgColor} = getColors();
  const [selected,setSelectedInternal] = useState(new Array(labels.length).fill(true));
  const toggle = index => {
    const selectedCopy = selected.map(item => item);
    selectedCopy[index] = ! selectedCopy[index];
    setSelectedInternal(selectedCopy);
    setSelected(selectedCopy);
  }

  const rows = [];
  for ( let i = 0; i < labels.length; i += 3 ) {
    rows.push((
      <View key={i} style={{
        flexDirection: "row",
        width: "100%"
      }}>
        {
          labels.slice(i,i + 3).map((item,j) => (
            <TouchableOpacity key={j} style={{
              flex: 1,
              flexDirection: "row",
              width: "100%",
              alignItems: "center",
              justifyContent: "center"
            }} onPress={() => toggle(i + j)}>
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                borderColor: fgColor,
                backgroundColor: selected[i + j] ? fgColor : bgColor,
                borderWidth: 3,
                marginRight: 10
              }} />
              <Text>{ item }</Text>
            </TouchableOpacity>
          ))
        }
      </View>
    ));
  }

  return (
    <View>
      { rows }
    </View>
  );
}