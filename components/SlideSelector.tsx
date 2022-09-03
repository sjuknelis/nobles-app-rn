import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, KEY_COLOR } from '../components/Themed';
import { getColors } from '../hooks/colorSchemeContext';

export function SlideSelector(props) {
  const {fgColor,bgColor} = getColors(props.inverted);

  const [selected,setSelectedInternal] = useState(props.preselect || 0);
  const [viewWidth,setViewWidth] = useState(0);
  const setSelected = value => {
    setSelectedInternal(value);
    props.setSelected(value);
  };

  const slideAnim = useRef(new Animated.Value((viewWidth / props.options.length) * selected)).current;
  useEffect(() => {
    Animated.timing(
      slideAnim,
      {
        toValue: (viewWidth / props.options.length) * selected,
        duration: 250,
        useNativeDriver: true
      }
    ).start();
  },[slideAnim,selected]);
  useEffect(() => {
    slideAnim.setValue((viewWidth / props.options.length) * selected);
  },[viewWidth]);

  const tapAreas = props.options.map((item,index) => {
    return (
      <TouchableOpacity key={item} style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
      }} onPress={() => setSelected(index)}>
        <Text style={{
          color: selected == index ? bgColor : fgColor
        }}>{ item }</Text>
      </TouchableOpacity>
    );
  });
  
  return (
    <View style={{
      borderColor: fgColor,
      borderWidth: 2,
      borderRadius: 10,
      height: 40,
      overflow: "hidden"
    }}>
      <View style={[styles.row,{
        width: "100%",
        height: 40,
        justifyContent: "center",
        backgroundColor: "transparent"
      }]} onLayout={event => {
        const {x,y,width,height} = event.nativeEvent.layout;
        setViewWidth(width);
      }}>
        { tapAreas }
      </View>
      <Animated.View style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: (100 / props.options.length) + "%",
          height: 36,
          backgroundColor: fgColor,
          borderRadius: 7,
          transform: [
            { translateX: slideAnim }
          ],
          zIndex: -1
        }}></Animated.View>
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
      width: "100%"
    }
});