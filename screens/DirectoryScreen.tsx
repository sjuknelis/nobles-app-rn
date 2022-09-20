import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, BigButton, KEY_COLOR } from '../components/Themed';
import { SubscreenController } from '../components/SubscreenController';
import { SlideSelector } from '../components/SlideSelector';

import { DirectoryResultsSubscreen } from './DirectoryResultsSubscreen';
import { DirectoryCardSubscreen } from './DirectoryCardSubscreen';
import { DirectoryScheduleScreen } from './DirectoryScheduleScreen';
import { DateSelector } from '../components/DateSelector';
import { getColors } from '../hooks/colorSchemeContext';

export default function DirectoryScreen({ openMenu,isMenuOpen }) {
  const {fgColor,bgColor} = getColors();
  const windowWidth = Dimensions.get("window").width;

  return (
    <SubscreenController openMenu={openMenu} subscreens={{
      main: (setSubscreen,options,carryState,setCarryState,isMenuOpen) => (<MainSubscreen setSubscreen={setSubscreen} openMenu={openMenu} isMenuOpen={isMenuOpen} />),
      results: (setSubscreen,options,carryState,setCarryState) => (<DirectoryResultsSubscreen setSubscreen={setSubscreen} openMenu={openMenu} options={options} carryState={carryState} setCarryState={setCarryState} />),
      card: (setSubscreen,options) => (<DirectoryCardSubscreen setSubscreen={setSubscreen} openMenu={openMenu} options={options} />),
      schedule: (setSubscreen,options,carryState,setCarryState) => (<DirectoryScheduleScreen setSubscreen={setSubscreen} options={options} carryState={carryState} />)
    }} menuButton={{
      main: null,
      results: null,
      card: setSubscreen => ({
        icon: "chevron-left",
        action: () => setSubscreen("results")
      }),
      schedule: setSubscreen => ({
        icon: "chevron-left",
        action: () => setSubscreen("card")
      })
    }} upperChildren={{
      main: () => null,
      results: setSubscreen => (
        <TouchableOpacity style={[styles.row,{
          backgroundColor: bgColor,
          width: "50%",
          marginLeft: "25%",
          marginTop: 5,
          marginBottom: 10,
          padding: 5,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center"
        }]} onPress={() => setSubscreen("main")}>
          <FontAwesome size={20} name="search" color={fgColor} style={{
            paddingRight: 10
          }} />
          <Text>Search Again</Text>
        </TouchableOpacity>
      ),
      card: () => null,
      schedule: (setSubscreen,setCarryState) => (
        <View style={{
          padding: 5
        }}>
          <DateSelector refWeek={0} setSelectedDate={({index,date}) => setCarryState(index)} inverted={true} />
        </View>
      )
    }} defaultCarryState={{
      main: null,
      results: null,
      card: null,
      schedule: 0
    }} titles={{
      main: () => "DIRECTORY",
      results: () => "DIRECTORY",
      card: () => " ",
      schedule: options => `${options.name}'s Schedule`
    }} minUpperHeights={{
      card: windowWidth * .175
    }} isMenuOpen={isMenuOpen} />
  );
}

function MainSubscreen({ openMenu,setSubscreen,isMenuOpen }) {
  const [firstName,setFirstName] = useState("");
  const [lastName,setLastName] = useState("");
  const [hometown,setHometown] = useState("");
  const [grade,setGrade] = useState(0);

  const officeNames = ["Michael Scott","Dwight Schrute","Jim Halpert","Pam Beesly","Ryan Howard","Stanley Hudson","Kevin Malone","Meredith Palmer","Angela Martin","Oscar Martinez","Phyllis Vance","Roy Anderson","Jan Levinson","Toby Flenderson","Kelly Kapoor","Andy Bernard","Creed Bratton","Darryl Philbin","Erin Hannon","Gabe Lewis","Holly Flax"]
    .map(item => item.split(" "));
  const [officeNameIndex,setOfficeNameIndex] = useState(Math.floor(Math.random() * officeNames.length));

  const firstNameInput = useRef(null);
  const lastNameInput = useRef(null);
  const hometownInput = useRef(null);
  useEffect(() => {
    if ( isMenuOpen ) {
      firstNameInput.current.blur();
      lastNameInput.current.blur();
      hometownInput.current.blur();
    }
  },[isMenuOpen]);

  return (
    <View>
      <InputEntry label="First name" placeholderIcon="user" placeholder={officeNames[officeNameIndex][0]} onChangeText={setFirstName} inputRef={firstNameInput} />
      <InputEntry label="Last name" placeholderIcon="user" placeholder={officeNames[officeNameIndex][1]} onChangeText={setLastName} inputRef={lastNameInput} />
      <InputEntry label="Hometown" placeholderIcon="building" placeholder="Scranton" onChangeText={setHometown} inputRef={hometownInput} />
      <View style={styles.row}>
        <View style={{
          flex: 1,
          padding: 5,
          justifyContent: "center"
        }}>
          <Text>Class:</Text>
        </View>
        <View style={{
          flex: 6,
          padding: 5
        }}>
          <SlideSelector options={["Any","VI","V","IV","III","II","I","Fac."]} setSelected={setGrade} />
        </View>
      </View>
      <View style={[styles.row,{
        justifyContent: "center"
      }]}>
        <BigButton icon="search" text="Search" onPress={() => {
          setSubscreen("results",{
            firstName,
            lastName,
            hometown,
            grade
          });
        }} />
      </View>
    </View>
  );
}

function InputEntry({ label,placeholderIcon,placeholder,onChangeText,inputRef }) {
  const {fgColor,bgColor,semiColor,semiShade} = getColors();
  const [textVal,setTextVal] = useState("");
  
  return (
    <View style={styles.row}>
      <View style={{
        flex: 2,
        padding: 5,
        justifyContent: "center"
      }}>
        <Text adjustsFontSizeToFit={true} numberOfLines={1}>{ label }:</Text>
      </View>
      <View style={{
        flex: 5,
        padding: 5
      }}>
        <TextInput ref={inputRef} style={{
          fontSize: 20,
          fontFamily: "EBGaramond_400Regular",
          borderColor: fgColor,
          borderWidth: 2,
          borderRadius: 10,
          padding: 5,
          color: semiColor
        }} onChangeText={val => {
          setTextVal(val);
          onChangeText(val);
        }} />
        { 
          textVal.length == 0 ? (
            <View style={{
              position: "absolute",
              top: 15,
              left: 15,
              zIndex: -1,
              flexDirection: "row"
            }}>
              <FontAwesome size={20} name={placeholderIcon} color={semiShade} />
              <Text style={{
                color: semiShade,
                top: -4,
                paddingLeft: 5
              }}>{ placeholder }</Text>
            </View>
          ) : null
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  }
});