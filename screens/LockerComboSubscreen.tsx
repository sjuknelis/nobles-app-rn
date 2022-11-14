import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, KEY_COLOR } from '../components/Themed';
import { requestAPI, pno } from '../hooks/requestAPI';
import { FlyingAnimContext, updateFlyingAnimText } from '../hooks/flyingAnimContext';
import { getColors } from '../hooks/colorSchemeContext';

export default function LockerComboSubscreen({ setSubscreen }) {
  const {fgColor,bgColor} = getColors();
  const [macText,setMACText] = useState("");
  const [shattuckText,setShattuckText] = useState("");
  const [msText,setMSText] = useState("");

  useEffect(() => {
    const fetchAboutData = async () => {
      let data = await requestAPI("aboutme.php");
      setMACText(`#${data.MACLockerNumber}\n${data.MACLockerCombo}`);
      if ( ! isNaN(parseInt(data.SchoolHouseLockerNumber)) && parseInt(data.SchoolHouseLockerNumber) != 0 ) setShattuckText(`#${data.SchoolHouseLockerNumber}\n${data.SchoolHouseLockerCombo}`);
      if ( ! isNaN(parseInt(data.MSCubbyNo)) && parseInt(data.MSCubbyNo) != 0 ) setMSText(`#${data.MSCubbyNo}\n${data.MSCubbyCombo}`);
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
          <Lock label={"Tap for\nMAC locker"} hidden={macText} />
          <Lock label={"Tap for\nShattuck locker"} hidden={shattuckText} />
          <Lock label={"Tap for\nMS cubby"} hidden={msText} />
        </View>
      </View>
    </View>
  );
}

function Lock({ label,hidden }) {
  const [unlocked,setUnlocked] = useState(false);
  if ( hidden == "" ) return null;
  return (
    <TouchableOpacity onPress={() => setUnlocked(! unlocked)}>
      <FontAwesome size={300} name="lock" color="gold" />
      <View style={{
        position: "absolute",
        top: 40,
        left: 0,
        width: 193,
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
        }}>{ unlocked ? hidden : label }</Text>
      </View>
    </TouchableOpacity>
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