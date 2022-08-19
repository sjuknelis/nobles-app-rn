import { BlurView } from "expo-blur";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { getColors } from "../hooks/colorSchemeContext";
import { ModalContext } from "../hooks/modalContext";
import { getWindowHeight } from "../hooks/windowHeight";
import { KEY_COLOR, View } from "./Themed";

export function ModalController() {
  const {fgColor,bgColor} = getColors();
  const windowHeight = getWindowHeight();
  const [modalData,setModalData] = useContext(ModalContext);
  const [blurIntensity,setBlurIntensity] = useState(0);
  const [content,setContent] = useState(null);
  const [modalHeight,setModalHeight] = useState(0);
  useEffect(() => {
    if ( modalData.open ) setContent(modalData.content);
    let blurIntensityInternal = blurIntensity;
    const changeAmount = modalData.open ? 5 : -5;
    const changeIntensity = () => {
      blurIntensityInternal += changeAmount;
      setBlurIntensity(blurIntensityInternal);
      if ( ! (blurIntensityInternal < 0 || blurIntensityInternal > 100) ) {
        requestAnimationFrame(changeIntensity);
      } else {
        if ( ! modalData.open ) setContent(null);
        setBlurIntensity(Math.max(Math.min(blurIntensityInternal,100),0));
      }
    };
    changeIntensity();
  },[modalData]);

  return (
    <View style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: blurIntensity > 0 ? null : "none"
    }}>
      <BlurView intensity={blurIntensity} style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%"
      }}></BlurView>
      <TouchableOpacity style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%"
      }} activeOpacity={1} onPress={() => setModalData({open: false})} />
      <View style={{
        position: "absolute",
        top: (windowHeight - modalHeight) / 2,
        left: "15%",
        width: "70%",
        backgroundColor: "white",
        borderWidth: 3,
        borderColor: fgColor,
        borderRadius: 10,
        opacity: blurIntensity / 100
      }} onLayout={event => {
        const layout = event.nativeEvent.layout;
        setModalHeight(layout.height);
      }}>
        { content }
      </View>
    </View>
  )
}