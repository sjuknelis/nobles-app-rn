import React, { useState, useEffect, useRef } from 'react';
import ActivityRings from 'react-native-activity-rings';

import { Text, View, KEY_COLOR } from '../components/Themed';
import { getColors } from '../hooks/colorSchemeContext';

export default function RingBox(props) {
  const {fgColor,bgColor,semiColor} = getColors();
  const RING_RAD = props.isLarge ? 100 : 70;
  const [shownValue,setShownValue] = useState(.01);
  useEffect(() => {
    let internalShown = .01;
    const updateShown = () => {
      setShownValue(internalShown);
      internalShown += .025;
      if ( internalShown < props.value ) requestAnimationFrame(updateShown);
    }
    setTimeout(updateShown,200);
  },[props.value]);

  return (
    <View style={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {
        props.name ? (<Text style={{
          fontSize: 25,
          fontFamily: "Nunito_700Bold",
          color: semiColor,
          paddingBottom: 15
        }}>{props.name}</Text>) : (<View></View>)
      }
      <View>
        <ActivityRings
          data={
            [
              {
                value: shownValue,
                color: props.color,
                backgroundColor: props.backgroundColor
              }
            ]
          }
          config={
            {
              width: RING_RAD * 2 + 30,
              height: RING_RAD * 2 + 30,
              radius: RING_RAD,
              ringSize: props.isLarge ? 22 : 18
            }
          }
        />
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: RING_RAD * 2 + 30,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent"
        }}>
          <Text style={{
            color: semiColor,
            fontSize: props.isLarge ? 28 : 22,
            fontFamily: "Nunito_700Bold"
          }}>{props.topLabel}</Text>
          <View style={{
            borderColor: semiColor,
            borderTopWidth: 3
          }}>
            <Text style={{
              color: semiColor,
              fontSize: props.isLarge ? 28 : 22,
              fontFamily: "Nunito_700Bold"
            }}>{props.bottomLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}