import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, LayoutAnimation } from 'react-native';

import { Text, View, Container, KEY_COLOR } from '../components/Themed';

export function SubscreenController({ useManualFade,openMenu,subscreens,titles,menuButton,upperChildren,minUpperHeights,defaultCarryState,backMovements }) {
  const [active,setActiveInternal] = useState("main");

  const [fadingOut,setFadingOut] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: fadingOut ? 0 : 1,
        duration: 250,
        useNativeDriver: true
      }
    ).start();
  },[fadeAnim,fadingOut]);

  const optionsObj = {};
  for ( const key in subscreens ) optionsObj[key] = null;
  const [options,setOptions] = useState(optionsObj);

  const [carryState,setCarryState] = useState(defaultCarryState || optionsObj);
  const carryStateActive = carryState[active];
  const setCarryStateActive = value => {
    const carryStateCopy = Object.assign({},carryState);
    carryStateCopy[active] = value;
    setCarryState(carryStateCopy);
  }

  const setActive = (newSubscreen,optionsParam) => {
    if ( useManualFade ) setFadingOut(true);
    else LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimeout(() => {
      if ( optionsParam ) {
        const optionsCopy = Object.assign({},options);
        optionsCopy[newSubscreen] = optionsParam;
        setOptions(optionsCopy);
      }
      setActiveInternal(newSubscreen);
      if ( useManualFade ) setFadingOut(false);
    },250);
  };

  let activeMenuChoice = null;
  if ( menuButton ) {
    const activeMenuChoiceFunction = menuButton[active];
    if ( activeMenuChoiceFunction ) activeMenuChoice = activeMenuChoiceFunction(setActive);
    else activeMenuChoice = { icon: "bars",action: openMenu };
  }
  let activeUpperChildren = null;
  if ( upperChildren ) activeUpperChildren = upperChildren[active](setActive,setCarryStateActive);
  
  return (
    <View>
      <Container title={titles[active](options[active])} menuButton={activeMenuChoice} upperChildren={activeUpperChildren} minUpperHeight={(minUpperHeights || {})[active]}>
        <Animated.View style={{
          flex: 1,
          width: "100%",
          opacity: fadeAnim
        }}>
          { subscreens[active](setActive,options[active],carryStateActive,setCarryStateActive) }
        </Animated.View>
      </Container>
    </View>
  );
}