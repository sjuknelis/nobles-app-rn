import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions, Pressable, Easing, AppState } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, KEY_COLOR } from './Themed';
import { getColors } from '../hooks/colorSchemeContext';

export const DateSelector = forwardRef((props,ref) => {
  const {fgColor,bgColor} = getColors(props.inverted);

  let today = new Date();
  const [selected,setSelectedInternal] = useState((today.getDay() == 0 || today.getDay() == 6) ? 0 : today.getDay() - 1);
  let refDate = new Date(today.getTime());
  let i = 0;
  while ( refDate.getDay() == 0 || refDate.getDay() == 6 ) refDate.setDate(refDate.getDate() + 1);
  while ( refDate.getDay() != 1 ) refDate.setDate(refDate.getDate() - 1);
  refDate.setDate(refDate.getDate() + props.refWeek * 7);

  const setSelected = index => {
    setSelectedInternal(index);
    const date = new Date(refDate);
    while ( date.getDay() != index + 1 ) date.setDate(date.getDate() + 1);
    props.setSelectedDate({index,date});
  }
  const changeSelected = change => {
    if ( ! props.onArrow ) {
      let newSelected = selected + change;
      newSelected %= 5;
      while ( newSelected < 0 ) newSelected += 5;
      setSelected(newSelected);
    } else {
      props.onArrow(change)
    }
  }

  useImperativeHandle(ref,() => ({
    setSelectedIndex(index) {
      setSelectedInternal(index);
    }
  }));

  const windowWidth = Dimensions.get("window").width;
  const boxSize = (windowWidth - 10) / 7;
  const dotAnim = useRef(new Animated.Value(boxSize * (selected + 1.5) - 20)).current;
  useEffect(() => {
    Animated.timing(
      dotAnim,
      {
        toValue: boxSize * (selected + 1.5) - 20,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.bezier(.25,.1,.25,1)
      }
    ).start();
  },[dotAnim,selected]);

  const [rerenderVal,setRerenderVal] = useState(null);
  useEffect(() => {
    const subscription = AppState.addEventListener("change",nextAppState => {
      setRerenderVal(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  },[]);

  const [touchFade,setTouchFade] = useState(0);

  const dayLetters = ["M","T","W","T","F"];
  const dateElements = [];
  const date = new Date(refDate);
  for ( let i = 0; i < 5; i++ ) {
    dateElements.push(
      <View key={i} style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Text style={{
          color: fgColor,
          paddingBottom: 10,
          opacity: .5
        }}>{ dayLetters[i] }</Text>
        <View style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: (props.refWeek == 0 && today.getDay() == i + 1) ? 1 : 0,
          borderColor: fgColor,
          borderRadius: 20
        }}>
          <Text style={{
            color: selected == i ? bgColor : fgColor,
            fontSize: 22
          }}>{ date.getDate() }</Text>
        </View>
      </View>
    );
    date.setDate(date.getDate() + 1);
  }

  return (
    <View style={[styles.row,{
      width: windowWidth - 10,
      height: 80
    }]} onTouchStart={event => {
      const index = Math.floor(event.nativeEvent.pageX / boxSize);
      if ( index == 0 ) setTouchFade(-1);
      else if ( index == 6 ) setTouchFade(1);
    }} onTouchEnd={event => {
      const index = Math.floor(event.nativeEvent.pageX / boxSize);
      if ( index == 0 ) {
        if ( ! props.hideLeftArrow ) changeSelected(-1);
      } else if ( index == 6 ) {
        if ( ! props.hideRightArrow ) changeSelected(1);
      } else {
        setSelected(index - 1);
      }
      setTimeout(() => {
        setTouchFade(0);
      },125);
    }}>
      <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        opacity: touchFade == -1 ? .5 : 1
      }}>
        {
          ! props.hideLeftArrow ? (
            <FontAwesome name="chevron-left" size={25} color={fgColor} />
          ) : null
        }
      </View>
      { dateElements }
      <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        opacity: touchFade == 1 ? .5 : 1
      }}>
        {
          ! props.hideRightArrow ? (
            <FontAwesome name="chevron-right" size={25} color={fgColor} />
          ) : null
        }
      </View>
      <Animated.View style={[styles.movingDot,{
        backgroundColor: fgColor,
        transform: [
          { translateX: dotAnim }
        ]
      }]}></Animated.View>
    </View>
  )
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  },
  movingDot: {
    width: 40,
    height: 40,
    borderRadius: 40,
    position: "absolute",
    top: 38,
    zIndex: -1
  }
});