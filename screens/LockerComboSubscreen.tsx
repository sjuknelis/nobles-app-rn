import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, KEY_COLOR } from '../components/Themed';
import { requestAPI, pno } from '../hooks/requestAPI';
import { FlyingAnimContext, updateFlyingAnimText } from '../hooks/flyingAnimContext';
import { getColors } from '../hooks/colorSchemeContext';

export default function LockerComboSubscreen({ setSubscreen }) {
  const {fgColor,bgColor} = getColors();
  const [comboText,setComboText] = useState("");
  const [unlocked,setUnlocked] = useState(false);

  useEffect(() => {
    const fetchAboutData = async () => {
      let data = await requestAPI("aboutme.php");
      setComboText(`#${data.MACLockerNumber}\n${data.MACLockerCombo}`);
    }

    fetchAboutData()
      .catch(console.error);
  },[]);

  const [flyingAnimData,setFlyingAnimData] = useContext(FlyingAnimContext);
  const setSubscreenAndFlyingAnim = subscreen => {
    updateFlyingAnimText(flyingAnimData,setFlyingAnimData,"Locker Combo","origin");
    setSubscreen(subscreen);
  };

  return (
    <View style={{
      height: "100%"
    }}>
      <View style={{
        flex: 1
      }}>
        <TouchableOpacity style={[styles.row,{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingBottom: 30,
        }]} onPress={() => setSubscreenAndFlyingAnim("main")}>
          <FontAwesome size={25} name="chevron-left" color={fgColor} style={{
            paddingRight: 10
          }} />
          <Text style={{
            fontSize: 25,
            color: ! flyingAnimData.aboutme.animateNow ? fgColor : bgColor
          }}>Locker Combo</Text>
        </TouchableOpacity>
        <View style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <TouchableOpacity onPress={() => setUnlocked(! unlocked)}>
            <FontAwesome size={300} name="lock" color="gold" />
            <View style={{
              position: "absolute",
              top: 40,
              left: 0,
              width: "50%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent"
            }}>
              <Text style={{
                fontSize: 22,
                fontFamily: "Nunito_700Bold",
                color: "black",
                textAlign: "center"
              }}>{ unlocked ? comboText : "Tap for\nMAC locker" }</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    padding: 5
  },
  row: {
    flexDirection: "row",
    width: "100%",
    padding: 5,
    justifyContent: "center"
  }
});