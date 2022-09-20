import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Animated, FlatList, Dimensions, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as Location from 'expo-location';

import { Text, View, Container, BigButton, KEY_COLOR } from '../components/Themed';
import { requestAPI, pin } from '../hooks/requestAPI';
import { getColors } from '../hooks/colorSchemeContext';
import { getWindowHeight } from '../hooks/windowHeight';

export function DirectoryCardSubscreen({ setSubscreen,options }) {
  const {fgColor,bgColor,semiColor,semiShade} = getColors();

  if ( ! options ) return null;
  let address = "";
  if ( options.getElementsByTagName("Street1")[0].value ) {
    address = options.getElementsByTagName("Street1")[0].value + "\n";
    if ( options.getElementsByTagName("Street2")[0].value ) address += options.getElementsByTagName("Street2")[0].value + "\n";
    address += `${options.getElementsByTagName("City")[0].value}, ${options.getElementsByTagName("State")[0].value} ${options.getElementsByTagName("Zip")[0].value}`;
  }

  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();
  const [bodyHeight,setBodyHeight] = useState(0);

  const [personImage,setPersonImage] = useState({
    uri: `https://nobilis.nobles.edu/images_sitewide/photos/${options.attributes.id}.jpeg`
  });

  return (
    <View style={{
      flex: 1,
      transform: [
        {translateY: -(windowHeight - bodyHeight - insets.top) + 10}
      ]
    }} onLayout={event => {
      const layout = event.nativeEvent.layout;
      setBodyHeight(layout.height);
    }}>
      <View style={{
        paddingLeft: 10,
        paddingRight: 10
      }}>
        <View style={{
          alignItems: "center"
        }}>
          <View style={{
            borderRadius: 1000,
            borderWidth: 4,
            borderColor: bgColor,
            shadowColor: semiColor,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
            elevation: 15
          }}>
            <Image
              style={{
                height: windowWidth * .35,
                aspectRatio: 1,
                borderRadius: 1000
              }}
              source={personImage}
              defaultSource={require("../assets/images/guest.png")}
              onError={() => setPersonImage(require("../assets/images/guest.png"))}
            />
          </View>
          <Text style={{
            fontFamily: "Nunito_700Bold",
            fontSize: 25,
            color: semiColor
          }}>{ options.getElementsByTagName("First")[0].value } { options.getElementsByTagName("Last")[0].value }</Text>
          <Text style={{
            fontFamily: "Nunito_400Regular",
            fontSize: 15,
            color: semiShade
          }}>{ options.getElementsByTagName("StudentGrade")[0].value ? `Grade ${options.getElementsByTagName("StudentGrade")[0].value}` : "Faculty" }</Text>
        </View>
        <InfoEntry
          text={`Email: ${options.getElementsByTagName("EmailAddress")[0].value}`}
          buttons={[
            {
              "icon": "copy",
              "action": async () => {
                await Clipboard.setStringAsync(options.getElementsByTagName("EmailAddress")[0].value);
              }
            },
            {
              "icon": "envelope",
              "action": () => {
                Linking.openURL(`mailto:${options.getElementsByTagName("EmailAddress")[0].value}`);
              }
            }
          ]}
        />
        <InfoEntry
          text={`Cell: ${options.getElementsByTagName("PhoneCell")[0].value}`}
          buttons={[
            {
              "icon": "phone",
              "action": () => {
                Linking.openURL(`tel:${options.getElementsByTagName("PhoneCell")[0].value}`);
              }
            },
            {
              "icon": "comment",
              "action": () => {
                Linking.openURL(`sms:${options.getElementsByTagName("PhoneCell")[0].value}`);
              }
            }
          ]}
        />
        <InfoEntry
          text={`Home: ${options.getElementsByTagName("PhoneHome")[0].value}`}
          buttons={[
            {
              "icon": "phone",
              "action": () => {
                Linking.openURL(`tel:${options.getElementsByTagName("PhoneHome")[0].value}`);
              }
            },
            {
              "icon": "comment",
              "action": () => {
                Linking.openURL(`sms:${options.getElementsByTagName("PhoneHome")[0].value}`);
              }
            }
          ]}
        />
        <InfoEntry
          text={`Address: ${address}`}
          buttons={[
            {
              "icon": "location-arrow",
              "action": async () => {
                const locationData = await Location.geocodeAsync(address);
                if ( locationData.length > 0 ) {
                  const label = `${options.getElementsByTagName("First")[0].value}'s Address`;
                  const locationStr = `${locationData[0].latitude},${locationData[0].longitude}`;
                  const url = Platform.select({
                    ios: `maps:0,0?q=${label}@${locationStr}`,
                    android: `geo:0,0?q=${locationStr}(${label})`
                  });
                  Linking.openURL(url);
                }
              }
            }
          ]}
        />
        <View style={styles.row}>
          <BigButton icon="calendar" text={`${options.getElementsByTagName("First")[0].value}'s Schedule`} style={{
            marginTop: 20
          }} onPress={() => {
            setSubscreen("schedule",{
              pno: options.attributes.id,
              name: options.getElementsByTagName("First")[0].value
            });
          }} />
        </View>
      </View>
    </View>
  );
}

function InfoEntry({ text,buttons }) {
  const {fgColor,bgColor} = getColors();
  if ( text.split(": ").length < 2 || text.split(": ")[1] == "" ) return null;
  return (
    <View style={[styles.row,styles.entry]}>
      <Text style={{
        flex: 3
      }}>
        { text }
      </Text>
      <View style={[styles.row,{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }]}>
        <FlatList
          key={text}
          data={buttons}
          renderItem={({item}) => (
            <TouchableOpacity style={{
              flex: 1,
              alignItems: "flex-end",
              padding: 5
            }} onPressIn={item.action}>
              <FontAwesome size={20} name={item.icon} color={fgColor} />
            </TouchableOpacity>
          )}
          numColumns={buttons.length}
          keyExtractor={item => item.icon}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  },
  entry: {
    paddingTop: 20
  }
});