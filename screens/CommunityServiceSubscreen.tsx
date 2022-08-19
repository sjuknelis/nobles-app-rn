import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Animated, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import RingBox from '../components/RingBox';

import { Text, View, KEY_COLOR } from '../components/Themed';
import { requestAPI, pno } from '../hooks/requestAPI';
import { FlyingAnimContext, updateFlyingAnimText } from '../hooks/flyingAnimContext';
import { getColors } from '../hooks/colorSchemeContext';

export default function CommunityServiceSubscreen({ setSubscreen,carryState,setCarryState }) {
  const {fgColor,bgColor,semiColor} = getColors();
  const [csData,setCSData] = useState([]);
  const [csHours,setCSHours] = useState(0);

  useEffect(() => {
    const fetchCSData = async () => {
      if ( carryState ) {
        setCSData(carryState.data);
        setCSHours(carryState.hours);
        return;
      }

      const data = (await requestAPI("xmlcommservevents.php")).Hours.Event;
      const hours = data
        .map(item => parseFloat(item.Hours))
        .reduce((a,b) => a + b);
      setCSData(data);
      setCSHours(hours);
      setCarryState({data,hours});
    }

    fetchCSData()
      .catch(console.error);
  },[]);

  const [flyingAnimData,setFlyingAnimData] = useContext(FlyingAnimContext);
  const setSubscreenAndFlyingAnim = subscreen => {
    updateFlyingAnimText(flyingAnimData,setFlyingAnimData,"Community Service","origin");
    setSubscreen(subscreen);
  };

  return (
    <View>
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
          color: ! flyingAnimData.animateNow ? fgColor : bgColor
        }}>Community Service</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <RingBox
          topLabel={csHours + " hours"}
          bottomLabel="80 hours"
          value={Math.min(csHours / 80,1)}
          isLarge={true}
          color="#0060ff"
          backgrondColor="#0040e0"
        />
      </View>
      <View style={[styles.row,{
        justifyContent: "flex-start",
      }]}>
        <Text style={[styles.infoText,{
          paddingTop: 20,
          color: semiColor,
          fontSize: 23,
        }]}>Events Completed</Text>
      </View>
        <FlatList
          data={csData}
          renderItem={({item}) => <EventItem item={item} />}
          keyExtractor={item => JSON.stringify(item)}
          ListFooterComponent={(
            <View style={{
              height: 20
            }} />
          )}
        />
    </View>
  );
}

function EventItem({ item }) {
  const {fgColor,bgColor,semiColor} = getColors();
  return (
    <View key={JSON.stringify(item)} style={[styles.row,{
      padding: 0
    }]}>
      <View style={{
        flex: 1,
        padding: 5
      }}>
        <Text style={[styles.infoText,{
          color: semiColor,
          fontSize: 18
        }]}>{ item.Organization }</Text>
      </View>
      <View style={{
        flex: 1,
        padding: 5
      }}>
        <Text style={[styles.infoText,{
          width: "100%",
          textAlign: "right",
          color: semiColor,
          fontSize: 18
        }]}>{ item.Hours } Hours</Text>
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
  },
  infoText: {
    fontFamily: "Nunito_700Bold"
  }
});