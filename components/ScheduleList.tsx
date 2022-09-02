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
      const data = await requestAPI(`xmlschedule.php${qs}`);
      if ( data == "error" ) {
        setErrorResponse(true);
        return;
      }

      data = data.Schedule.Day;
      for ( let i = 0; i < 5; i++ ) {
        data[i].Course[0].StartTime = i + ":00";
      }
      /*const data = [
        {
          Course: [
            {
              Description: ["Class 1"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            },{
              Description: ["Class 2"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            }
          ]
        },
        {
          Course: [
            {
              Description: ["Class 3"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            },{
              Description: ["Class 4"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            }
          ]
        },{
          Course: [
            {
              Description: ["Class 1"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            },{
              Description: ["Class 2"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            }
          ]
        },
        {
          Course: [
            {
              Description: ["Class 3"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            },{
              Description: ["Class 4"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            }
          ]
        },{
          Course: [
            {
              Description: ["Class 1"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            },{
              Description: ["Class 2"],
              StartTime: ["8:00"],
              EndTime: ["9:00 AM"],
              Location: ["Room 4"],
            }
          ]
        }
      ]*/
      setScheduleData(data);
    }

    fetchScheduleData()
      .catch(console.error);
  },[]);

  if ( scheduleData ) {
    return (
      <FlatList
        data={scheduleData[selectedDay].Course}
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
    <View style={{ padding: 5 }}>
      <View style={styles.row}>
        <View style={{ flex: 1, borderColor: "black", borderRightWidth: 2, marginRight: 10 }}>
          <Text style={[styles.infoText,{ padding: 2 }]}>{ item.StartTime[0] } { timePost(item.StartTime[0]) }</Text>
        </View>
        <Text style={[styles.infoText,{ fontFamily: "Nunito_700Bold", flex: 3, padding: 2 }]}>{ item.Description[0] }</Text>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1, borderColor: "black", borderRightWidth: 2, marginRight: 10 }}>
          <Text style={[styles.infoText,{ padding: 2 }]}>{ item.EndTime[0].slice(0,-3) } { timePost(item.EndTime[0]) }</Text>
        </View>
        <View style={[styles.row,{ flex: 3, padding: 2 }]}>
          <FontAwesome size={15} style={{ marginRight: 5 }} name="location-arrow" color="black" />
          <Text style={styles.infoText}>{ item.Location[0] }</Text>
        </View>
      </View>
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
  }
});