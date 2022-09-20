import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Image, TouchableOpacity, Animated, Dimensions, LayoutAnimation } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Barcode from '../components/Barcode';

import { Text, View, Container, KEY_COLOR } from '../components/Themed';
import { SubscreenController } from '../components/SubscreenController';
import { getCreds, requestAPI } from '../hooks/requestAPI';

import FinancialSubscreen from './FinancialSubscreen';
import CommunityServiceSubscreen from './CommunityServiceSubscreen';
import LockerComboSubscreen from './LockerComboSubscreen';
import { FlyingAnimContext, updateFlyingAnimText } from '../hooks/flyingAnimContext';
import { getColors } from '../hooks/colorSchemeContext';

export default function AboutMeScreen({ openMenu,navigation }) {
  const [carryState,setCarryState] = useState(null);
  return (
    <SubscreenController useManualFade={true} openMenu={openMenu} menuButton={{
      main: null,
      financial: null,
      commserve: null,
      locker: null
    }} subscreens={{
      main: (setSubscreen,options,carryState,setCarryState) => (<MainSubscreen setSubscreen={setSubscreen} carryState={carryState} setCarryState={setCarryState} />),
      financial: (setSubscreen,options,carryState,setCarryState) => (<FinancialSubscreen setSubscreen={setSubscreen} carryState={carryState} setCarryState={setCarryState} />),
      commserve: (setSubscreen,options,carryState,setCarryState) => (<CommunityServiceSubscreen setSubscreen={setSubscreen} carryState={carryState} setCarryState={setCarryState} />),
      locker: setSubscreen => (<LockerComboSubscreen setSubscreen={setSubscreen} />),
    }} titles={{
      main: () => "ABOUT ME",
      financial: () => "ABOUT ME",
      commserve: () => "ABOUT ME",
      locker: () => "ABOUT ME"
    }} />
  );
}

function MainSubscreen({ setSubscreen,carryState,setCarryState }) {
  const {fgColor,bgColor} = getColors();
  const windowWidth = Dimensions.get("window").width;
  const [aboutData,setAboutData] = useState({});
  const [pno,setPNO] = useState(1);

  const [flyingAnimData,setFlyingAnimData] = useContext(FlyingAnimContext);
  const setSubscreenAndFlyingAnim = (subscreen,text) => {
    updateFlyingAnimText(flyingAnimData,setFlyingAnimData,text,"dest");
    setSubscreen(subscreen);
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      const creds = await getCreds();
      setPNO(creds.pno);

      if ( carryState ) {
        setAboutData(carryState);
        setUserImage({
          uri: `https://nobilis.nobles.edu/images_sitewide/photos/${carryState.PeopleID}.jpeg`
        });
        return;
      }

      const data = await requestAPI("aboutme.php");
      let lname = data.UNID.slice(1,-2);
      lname = lname.charAt(0).toUpperCase() + lname.slice(1);
      let grade = 35 - parseInt(data.UNID.slice(-2));
      if ( ! (grade >= 9 && grade <= 12) ) grade = 0;

      data.lname = lname;
      data.nameText = `${data.FirstName} ${lname}`;
      data.email = `${data.UNID}@nobles.edu`;
      data.grade = grade;

      setAboutData(data);
      setUserImage({
        uri: `https://nobilis.nobles.edu/images_sitewide/photos/${data.PeopleID}.jpeg`
      });
      setCarryState(data);
    };

    fetchAboutData()
      .catch(console.error);
  },[]);

  const [userImage,setUserImage] = useState(require("../assets/images/guest.png"));

  const [barcodeOpen,setBarcodeOpenInternal] = useState(false);
  const [barcodeHeight,setBarcodeHeight] = useState(0);
  const setBarcodeOpen = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBarcodeOpenInternal(value);
    let barcodeHeightVal = barcodeHeight;
    const interval = setInterval(() => {
      if ( value ) barcodeHeightVal += 12;
      else barcodeHeightVal -= 12;
      setBarcodeHeight(barcodeHeightVal);
      if ( barcodeHeightVal <= 0 || barcodeHeightVal >= 100 ) clearInterval(interval);
    })
  };

  const simulatedLabel = useRef();
  useEffect(() => {
    setTimeout(() => {
      if ( ! simulatedLabel.current ) return;
      simulatedLabel.current.measure((fx,fy,width,height,px,py) => {
        const flyingAnimCopy = Object.assign({},flyingAnimData);
        flyingAnimCopy.aboutme.dest = {px,py};
        setFlyingAnimData(flyingAnimCopy);
      });
    },1000);
  },[]);

  return (
    <View>
      <View style={styles.row}>
        <View style={{
          flex: 5,
          padding: 5
        }}>
          <Image
            style={{
              width: (windowWidth - 30) * (5 / 12),
              height: (windowWidth - 30) * (5 / 12) * (800 / 640),
              borderRadius: 10
            }}
            source={userImage}
            defaultSource={require("../assets/images/guest.png")}
            onError={() => setUserImage(require("../assets/images/guest.png"))}
          />
        </View>
        <View style={{
          flex: 7,
          padding: 5
        }}>
          <Text
            style={[styles.infoText,{
              fontSize: 25
            }]}
          >
            {aboutData.nameText}
          </Text>
          <Text style={styles.infoText}>{ aboutData.email }</Text>
          <Text style={styles.infoText}>{ aboutData.grade ? `Grade: ${aboutData.grade}` : "" }</Text>
          <Text style={styles.infoText}>{ aboutData.AssemblySeat ? `Assembly seat: \n${aboutData.AssemblySeat}` : ""}</Text>
        </View>
      </View>
      <View style={{
        borderColor: fgColor,
        borderWidth: 3,
        borderRadius: 10,
        paddingLeft: 5,
        paddingRight: 5,
        marginLeft: 7.5,
        marginRight: 7.5
      }}>
        <BoxEntry icon="dollar" text="Financial" action={() => setSubscreenAndFlyingAnim("financial","Financial")} />
        <BoxEntry icon="heart" text="Community Service" action={() => setSubscreenAndFlyingAnim("commserve","Community Service")} />
        <BoxEntry icon="lock" text="Locker Combo" action={() => setSubscreenAndFlyingAnim("locker","Locker Combo")} />
        <BoxEntry icon="id-card" text="Student ID Barcode" arrow={barcodeOpen ? "chevron-down" : "chevron-right"} content={(
          <Animated.View style={[styles.row,{
            padding: 0,
            justifyContent: "center",
            height: barcodeHeight,
            overflow: "hidden"
          }]}>
            <Barcode
              value={pno.toString()}
              options={{ format: 'CODE128', background: 'white', width: 3, height: 75 }}
            />
          </Animated.View>
        )} action={() => setBarcodeOpen(! barcodeOpen)} />
      </View>
      <View style={{
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0
      }}>
        <TouchableOpacity style={[styles.row,{
          alignItems: "center",
          justifyContent: "flex-start",
          paddingBottom: 30
        }]}>
          <FontAwesome size={25} name="chevron-left" color="black" style={{
            marginRight: 10
          }} />
          <Text style={{
            fontSize: 25,
            color: "black"
          }} textRef={simulatedLabel}>Financial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BoxEntry({ icon,text,arrow,content,action }) {
  const {fgColor,bgColor,semiShade} = getColors();
  const [flyingAnimData,setFlyingAnimData] = useContext(FlyingAnimContext);
  const label = useRef();
  useEffect(() => {
    setTimeout(() => {
      if ( ! label.current ) return;
      label.current.measure((fx,fy,width,height,px,py) => {
        const flyingAnimCopy = Object.assign({},flyingAnimData);
        flyingAnimCopy.aboutme.origin[text] = {px,py};
        setFlyingAnimData(flyingAnimCopy);
      });
    },1000);
  },[]);

  return (
    <View style={{
      borderColor: semiShade,
      borderBottomWidth: 1
    }}>
      <TouchableOpacity style={styles.row} onPress={action}>
        <View style={styles.iconBox}>
          <FontAwesome size={20} name={icon} color={fgColor} />
        </View>
        <View style={{ flex: 6, paddingLeft: 5 }}>
          <Text style={{ fontSize: 25, color: flyingAnimData.aboutme.animateNow != text ? fgColor : bgColor }} textRef={label}>{ text }</Text>
        </View>
        <View style={styles.iconBox}>
          <FontAwesome size={20} name={arrow || "chevron-right"} color={fgColor} />
        </View>
      </TouchableOpacity>
      { content ? content : null }
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    padding: 5
  },
  infoText: {
    fontSize: 18,
    padding: 3
  },
  iconBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});