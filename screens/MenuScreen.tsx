import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Image, TouchableOpacity, FlatList, Animated, Dimensions, LayoutAnimation, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, LoadingItem } from '../components/Themed';
import { WeekSelector } from '../components/WeekSelector';
import { requestAPI } from '../hooks/requestAPI';
import { getColors } from '../hooks/colorSchemeContext';

export default function MenuScreen({ openMenu }) {
  const {fgColor,bgColor} = getColors();
  const [menu,setMenu] = useState(null);
  const [meal,setMealInternal] = useState(0);
  const [selectedDate,setSelectedDateInternal] = useState(new Date());
  const weekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const setSelectedDate = date => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDateInternal(date);
  }
  const setMeal = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMealInternal(value);
  }
  
  useEffect(() => {
    const fetchMenuData = async () => {
      console.log("hi")
      let date = new Date();
      const lunchData = {};
      const dinnerData = {};
      for ( let week = 0; week < 4; week++ ) {
        const lunchWeekInfo = await (await fetch(`https://nobleandgreenough.flikisdining.com/menu/api/weeks/school/noble-and-greenough-school/menu-type/lunch/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`)).json();
        for ( const dayInfo of lunchWeekInfo.days ) {
          lunchData[dayInfo.date] = dayInfo;
        }
        const dinnerWeekInfo = await (await fetch(`https://nobleandgreenough.flikisdining.com/menu/api/weeks/school/noble-and-greenough-school/menu-type/dinner/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`)).json();
        for ( const dayInfo of dinnerWeekInfo.days ) {
          dinnerData[dayInfo.date] = dayInfo;
        }
        date.setDate(date.getDate() + 7);
      }
      setMenu([lunchData,dinnerData]);
    };

    fetchMenuData()
      .catch(console.error);
  },[]);

  const pad = n => n < 10 ? "0" + n : n;
  let menuItems = [];
  if ( menu ) menuItems = menu[meal][`${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`].menu_items;

  return (
    <Container title="MENU" menuButton={{
      icon: "bars",
      action: openMenu
    }} upperChildren={(
      <View style={{
        padding: 5
      }}>
        <WeekSelector setSelected={setSelectedDate} inverted={true} />
      </View>
    )}>
      {
        menu ? (
          <ScrollView>
            <View style={styles.row}>
              <TappableImage source={require("../assets/images/lunch.jpeg")} text="Lunch" isSelected={meal == 0} select={() => setMeal(0)} />
              <TappableImage source={require("../assets/images/dinner.jpeg")} text="Dinner" isSelected={meal == 1} select={() => setMeal(1)} />
            </View>
            <View style={{
              borderWidth: 5,
              borderColor: fgColor,
              borderRadius: 10,
              padding: 10,
              margin: 5
            }}>
              <View style={styles.row}>
                <View style={{
                  flex: 1,
                  padding: 5,
                  alignItems: "center"
                }}>
                  <FontAwesome size={60} name="fort-awesome" color={fgColor} />
                </View>
                <View style={{
                  flex: 3,
                  padding: 5
                }}>
                  <Text style={{
                    fontSize: 28
                  }}>The Castle Menu</Text>
                  <Text>{ weekDays[selectedDate.getDay()] } { ["Lunch","Dinner"][meal] }</Text>
                </View>
              </View>
              { menuItems.length > 0 ? (
                <FlatList
                  data={menuItems}
                  renderItem={({item}) => <MenuItem item={item} />}
                  keyExtractor={item => JSON.stringify(item)}
                  scrollEnabled={false}
                />
              ) : (
                <View style={[styles.row,styles.section]}>
                  <Text>Menu has not been published yet</Text>
                </View>
              ) }
            </View>
          </ScrollView>
        ) : (
          <LoadingItem anim="menu" />
        )
      }
    </Container>
  );
}

function MenuItem({ item }) {
  const {fgColor,bgColor} = getColors();
  if ( item.is_section_title ) {
    return (
      <View key={JSON.stringify(item)} style={[styles.row,styles.section,{
        borderColor: fgColor
      }]}>
        <Text>{ item.text }</Text>
      </View>
    );
  } else {
    return (
      <Text key={JSON.stringify(item)} style={[styles.row,styles.menuItem]}>{ item.text }</Text>
    );
  }
}

function TappableImage(props) {
  const {fgColor,bgColor} = getColors();
  return (
    <TouchableOpacity style={{
      flex: 1,
      padding: 5
    }} onPress={props.select}>
      <Image
        style={{
          width: "100%",
          height: 80,
          borderColor: fgColor,
          borderWidth: props.isSelected ? 5 : 0,
          borderRadius: 10
        }}
        blurRadius={props.isSelected ? 0 : 8}
        source={props.source}
      />
      <View style={{
        position: "absolute",
        top: 5,
        left: 5,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent"
      }}>
        <Text style={{
          color: "white",
          fontSize: 25,
          fontFamily: "EBGaramond_400Regular"
        }}>{props.text.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingBottom: 5,
    paddingLeft: "2.5%",
    paddingRight: "2.5%",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    width: "100%"
  },
  section: {
    borderBottomWidth: 2
  },
  menuItem: {
    fontSize: 18,
    textAlign: "center",
    padding: 3
  }
});