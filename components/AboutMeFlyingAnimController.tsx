import { useContext, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { getColors } from "../hooks/colorSchemeContext";
import { FlyingAnimContext } from "../hooks/flyingAnimContext";
import { KEY_COLOR, View, Text } from "./Themed";

export function AboutMeFlyingAnimController() {
  return (
    <View style={{
      position: "absolute"
    }}>
      <FlyingText />
    </View>
  )
}

function FlyingText() {
  const {fgColor,bgColor} = getColors();
  const [flyingAnimData,setFlyingAnimData] = useContext(FlyingAnimContext);
  const [animatingX,setAnimatingX] = useState(false);
  const [animatingY,setAnimatingY] = useState(false);

  const flyPXAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if ( animatingX ) return;
    if ( flyingAnimData.aboutme.animateNow ) {
      setAnimatingX(true);
      const originPX = flyingAnimData.aboutme.origin[flyingAnimData.aboutme.animateNow].px;
      const destPX = flyingAnimData.aboutme.dest.px;

      const startPX = flyingAnimData.aboutme.finalPos == "dest" ? originPX : destPX;
      const endPX = flyingAnimData.aboutme.finalPos == "dest" ? destPX : originPX;

      flyPXAnim.setValue(startPX);
      Animated.timing(
        flyPXAnim,
        {
          toValue: endPX,
          duration: 250,
          useNativeDriver: true
        }
      ).start();
      setTimeout(() => {
        setAnimatingX(false);
      },500);
    }
  },[flyPXAnim,flyingAnimData]);
  const flyPYAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if ( animatingY ) return;
    if ( flyingAnimData.aboutme.animateNow ) {
      setAnimatingY(true);
      const originPY = flyingAnimData.aboutme.origin[flyingAnimData.aboutme.animateNow].py;
      const destPY = flyingAnimData.aboutme.dest.py;

      const startPY = flyingAnimData.aboutme.finalPos == "dest" ? originPY : destPY;
      const endPY = flyingAnimData.aboutme.finalPos == "dest" ? destPY : originPY;
      console.log(startPY,endPY);

      flyPYAnim.setValue(startPY);
      Animated.timing(
        flyPYAnim,
        {
          toValue: endPY,
          duration: 250,
          useNativeDriver: true
        }
      ).start();
      setTimeout(() => {
        const flyingAnimCopy = Object.assign({},flyingAnimData);
        flyingAnimCopy.aboutme.animateNow = null;
        setFlyingAnimData(flyingAnimCopy);
        setAnimatingY(false);
      },500);
    }
  },[flyPYAnim,flyingAnimData]);

  if ( flyingAnimData.aboutme.animateNow ) {
    return (
      <Animated.Text pointerEvents={"none"} style={{
        position: "absolute",
        top: 0,
        left: 0,
        fontSize: 25,
        transform: [
          {translateX: flyPXAnim},
          {translateY: flyPYAnim}
        ],
        opacity: 1,
        color: fgColor,
        fontFamily: "EBGaramond_400Regular",
      }}>{ flyingAnimData.aboutme.animateNow }</Animated.Text>
    );
  } else {
    return null;
  }
}