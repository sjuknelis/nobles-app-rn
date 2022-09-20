import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, Dimensions, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

import { Text, View, KEY_COLOR, LoadingItem, BigButton } from '../components/Themed';
import { requestAPI, pin, getCreds } from '../hooks/requestAPI';

export function ScheduleList({ selectedDay,providedPNO }) {
  const [scheduleData,setScheduleData] = useState(null);
  const [errorResponse,setErrorResponse] = useState(false);

  useEffect(() => {
    const fetchScheduleData = async () => {
      const creds = await getCreds();
      const qs = `?iosPIN=${creds.pin}&PeopleID=${providedPNO || creds.pno}`;
      let data = await requestAPI(`xmlschedule.php${qs}`,true);
      if ( data == "error" ) {
        setErrorResponse(true);
        return;
      }
      setScheduleData(data.getElementsByTagName("Day"));
    }

    fetchScheduleData()
      .catch(console.error);
  },[]);

  if ( scheduleData ) {
    return (
      <FlatList
        data={scheduleData[selectedDay].getElementsByTagName("Course")}
        renderItem={ScheduleItem}
        keyExtractor={item => JSON.stringify(item)}
      />
    );
  } else {
    if ( ! errorResponse ) {
      return (
        <LoadingItem anim="schedule" />
      );
    } else {
      return (
        <View style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 10
        }}>
          <Text style={{
            textAlign: "center",
            fontSize: 30,
            fontFamily: "EBGaramond_700Bold",
          }}>Sorry, your schedule could not be loaded.</Text>
          <View style={styles.row}>
            <BigButton text="Open GCal" icon="external-link" onPress={() => {
              Linking.openURL("com.google.calendar://");
            }} />
          </View>
        </View>
      );
    }
  }
}

function ScheduleItem({ item }) {
  return (
    <View style={{
      padding: 5
    }}>
      <View style={styles.row}>
        <View style={{
          flex: 1,
          borderColor: "gray",
          borderRightWidth: 2,
          marginRight: 10,
          marginBottom: -5
        }}>
          <Text style={[styles.infoText,styles.shrunk,{
            padding: 2
          }]}>
            { item.getElementsByTagName("StartTime")[0].value } { timePost(item.getElementsByTagName("StartTime")[0].value) }
          </Text>
        </View>
        <Text style={[styles.infoText,{
          fontFamily: "Nunito_700Bold",
          flex: 3,
          padding: 2
        }]} adjustFontSizeToFit={true} numberOfLines={1}>
          { item.getElementsByTagName("Description")[0].value }
        </Text>
      </View>
      <View style={styles.row}>
        <View style={{
          flex: 1,
          borderColor: "gray",
          borderRightWidth: 2,
          marginRight: 10
        }}>
          <Text style={[styles.infoText,styles.shrunk,{
            padding: 2
          }]}>
            { item.getElementsByTagName("EndTime")[0].value.slice(0,-3) } { timePost(item.getElementsByTagName("EndTime")[0].value) }
          </Text>
        </View>
        <View style={[styles.row,{
          flex: 3,
          padding: 2
        }]}>
          <FontAwesome name="location-arrow" color="gray" size={10} style={{
            marginRight: 5
          }} />
          <Text style={[styles.infoText,styles.shrunk]}>{ item.getElementsByTagName("Location")[0].value }</Text>
        </View>
      </View>
      { item.getElementsByTagName("Teacher")[0].value ? (
        <View style={styles.row}>
          <View style={{
            flex: 1,
            borderColor: "gray",
            borderRightWidth: 2,
            marginRight: 10
          }}>
            <Text style={[styles.infoText,{
              padding: 2
            }]}> </Text>
          </View>
          <View style={[styles.row,{
            flex: 3,
            padding: 2
          }]}>
            <FontAwesome name="user" color="gray" size={12} style={{
              marginRight: 5
            }} />
            <Text style={[styles.infoText,styles.shrunk]}>{ item.getElementsByTagName("Teacher")[0].value }</Text>
          </View>
        </View>
      ) : null }
    </View>
  );
}

const timePost = time => {
  const hour = parseInt(time.split(":")[0]);
  if ( hour >= 8 ) return "AM";
  else return "PM";
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center"
  },
  infoText: {
    fontFamily: "Nunito_400Regular",
    color: "black",
    fontSize: 18
  },
  shrunk: {
    color: "gray",
    fontSize: 15
  }
});