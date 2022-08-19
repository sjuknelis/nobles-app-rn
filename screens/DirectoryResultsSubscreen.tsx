import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Animated, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, KEY_COLOR, LoadingItem } from '../components/Themed';
import { getCreds, requestAPI } from '../hooks/requestAPI';
import { getColors } from '../hooks/colorSchemeContext';

export function DirectoryResultsSubscreen({ setSubscreen,options,carryState,setCarryState }) {
  const [results,setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if ( ! options ) return;
      if ( carryState && carryState.options == options ) {
        setResults(carryState.data);
        return;
      }
      const {firstName,lastName,hometown,grade} = options;
      const {pin} = await getCreds();
      let uri = `xmlDirectory.php?iosPIN=${pin}`;
      if ( firstName != "" ) uri += `&FirstName=${firstName}`; 
      if ( lastName != "" ) uri += `&LastName=${lastName}`; 
      if ( hometown != "" ) uri += `&City=${hometown}`; 
      if ( grade != 0 ) uri += `&Grade=${[-1,7,8,9,10,11,12][grade]}`;

      let studentData = [];
      let facultyData = [];
      if ( grade != 7 ) studentData = await requestAPI(uri + "&PersonType=Student",true);
      if ( grade == 0 || grade == 7 ) facultyData = await requestAPI(uri + "&PersonType=Faculty",true);

      const data = studentData.children.concat(facultyData.children).sort((a,b) => {
        const aName = `${a.getElementsByTagName("First")[0].value} ${a.getElementsByTagName("Last")[0].value}`;
        const bName = `${b.getElementsByTagName("First")[0].value} ${b.getElementsByTagName("Last")[0].value}`;
        return aName.localeCompare(bName);
      });
      setResults(data);
      setCarryState({
        options,
        data
      });
    };

    fetchResults()
      .catch(console.error);
  },[options]);

  if ( results.length > 0 ) {
    return (
      <FlatList
        data={ results }
        renderItem={({item}) => <ResultItem item={item} setSubscreen={setSubscreen} />}
        keyExtractor={item => JSON.stringify(item)}
      />
    );
  } else {
    return (
      <LoadingItem />
    );
  }
}

function ResultItem({ item,setSubscreen }) {
  const {fgColor,bgColor,semiColor,semiShade} = getColors();

  const [personImage,setPersonImage] = useState({
    uri: `https://nobilis.nobles.edu/images_sitewide/photos/${item.attributes.id}.jpeg`
  });

  return (
    <TouchableOpacity style={[styles.row,{
      paddingBottom: 10
    }]} onPress={() => {
      setSubscreen("card",item);
    }}>
      <View style={{
        flex: 1,
        padding: 5,
        justifyContent: "center"
      }}>
        <View style={{
          width: "100%"
        }}>
          <Image
            style={{
              height: 50,
              aspectRatio: 1,
              borderRadius: 10
            }}
            source={personImage}
            defaultSource={require("../assets/images/guest.png")}
            onError={() => setPersonImage(require("../assets/images/guest.png"))}
          />
        </View>
      </View>
      <View style={{
        flex: 5,
        padding: 5,
        justifyContent: "center"
      }}>
        <Text style={{
          fontFamily: "Nunito_700Bold",
          color: semiColor
        }}>{ item.getElementsByTagName("First")[0].value } { item.getElementsByTagName("Last")[0].value }</Text>
        <Text style={{
          fontFamily: "Nunito_400Regular",
          fontSize: 15,
          color: semiShade
        }}>{ item.getElementsByTagName("StudentGrade")[0].value ? `Grade ${item.getElementsByTagName("StudentGrade")[0].value}` : "Faculty" }</Text>
      </View>
      <View style={{
        flex: 1,
        padding: 5,
        alignItems: "flex-end",
        justifyContent: "center"
      }}>
        <FontAwesome size={22} name="chevron-right" color={semiColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  }
});