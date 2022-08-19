import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, KEY_COLOR } from './Themed';
import { DateSelector } from './DateSelector';

export function WeekSelector(props) {
  const [selectedWeek,setSelectedWeek] = useState(0);
  const [selectedDate,setSelectedDateInternal] = useState(new Date());
  const [showSides,setShowSides] = useState(false);

  const windowWidth = Dimensions.get("window").width * .95;
  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: -selectedWeek * (windowWidth + 10),
        duration: 250,
        useNativeDriver: true
      }
    ).start();
    setTimeout(() => {
      setShowSides(false);
    },250);
  },[slideAnim,selectedWeek]);

  const setSelectedDate = ({index,date}) => {
    for ( let i = 0; i < 4; i++ ) {
      if ( i != index ) selectors[i].current.setSelectedIndex(index);
    }
    setSelectedDateInternal(date);
    props.setSelected(date);
  };
  const changeSelectedWeek = change => {
    setShowSides(true);
    setSelectedWeek(selectedWeek + change);
    const selectedDateCopy = new Date(selectedDate.getTime());
    selectedDateCopy.setDate(selectedDateCopy.getDate() + change * 7);
    setSelectedDateInternal(selectedDateCopy);
    props.setSelected(selectedDateCopy);
  };

  const selectors = [useRef(null),useRef(null),useRef(null),useRef(null)];
  const weekElements = [];
  for ( let i = 0; i < 4; i++ ) {
    weekElements.push((
      <Animated.View key={i} style={[styles.selectorView,{
        opacity: (selectedWeek == i || showSides) ? 1 : 0,
        left: `${i * 100}%`,
        transform: [
          { translateX: slideAnim }
        ]
      }]} pointerEvents={(selectedWeek == i || showSides) ? null : "none"}>
        <DateSelector
          ref={selectors[i]}
          refWeek={i}
          setSelectedDate={setSelectedDate}
          onArrow={changeSelectedWeek}
          hideLeftArrow={i == 0}
          hideRightArrow={i == 3}
          inverted={props.inverted}
        />
      </Animated.View>
    ));
  }

  return (
    <View style={{
      width: "100%",
      height: 80
    }}>
      { weekElements }
    </View>
  )
}

const styles = StyleSheet.create({
  selectorView: {
    position: "absolute",
    top: 0
  }
});