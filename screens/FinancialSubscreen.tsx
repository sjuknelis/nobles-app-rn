import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import RingBox from '../components/RingBox';

import { Text, View, KEY_COLOR } from '../components/Themed';
import { requestAPI } from '../hooks/requestAPI';
import { FlyingAnimContext, updateFlyingAnimText } from '../hooks/flyingAnimContext';
import { getColors } from '../hooks/colorSchemeContext';

export default function FinancialSubscreen({ setSubscreen,carryState,setCarryState }) {
  const {fgColor,bgColor} = getColors();
  const [finData,setFinData] = useState({});

  useEffect(() => {
    const fetchFinData = async () => {
      if ( carryState ) {
        setFinData(carryState);
        return;
      }

      const data = await requestAPI("spendinglimits.php");
      setFinData(data);
      setCarryState(data);
    }

    fetchFinData()
      .catch(console.error);
  },[]);

  const [flyingAnimData,setFlyingAnimData] = useContext(FlyingAnimContext);
  const setSubscreenAndFlyingAnim = subscreen => {
    updateFlyingAnimText(flyingAnimData,setFlyingAnimData,"Financial","origin");
    setSubscreen(subscreen);
  };

  return (
    <View>
      <TouchableOpacity style={[styles.row,{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingBottom: 20
      }]} onPress={() => setSubscreenAndFlyingAnim("main")}>
        <FontAwesome size={25} name="chevron-left" color={fgColor} style={{
          marginRight: 10
        }} />
        <Text style={{
          fontSize: 25,
          color: ! flyingAnimData.animateNow ? fgColor : bgColor
        }}>Financial</Text>
      </TouchableOpacity>
      <View style={[styles.row,{
        paddingBottom: 20
      }]}>
        <View style={{ flex: 1, padding: 5 }}>
          <RingBox
            topLabel={"$" + parseFloat(finData.BookstoreSpent || "0").toFixed(2)}
            bottomLabel={"$" + parseFloat(finData.BookstoreAmount || "0").toFixed(2)}
            value={parseFloat(finData.BookstoreSpent || "0") / parseFloat(finData.BookstoreAmount)}
            name="Bookstore"
            color="#ffa000"
            backgrondColor="#e08000"
          />
        </View>
        <View style={{ flex: 1, padding: 5 }}>
          <RingBox
            topLabel={"$" + parseFloat(finData.SnacksSpent || "0").toFixed(2)}
            bottomLabel={"$" + parseFloat(finData.SnackBarAmount || "0").toFixed(2)}
            value={parseFloat(finData.SnacksSpent || "0") / parseFloat(finData.SnackBarAmount)}
            name="Snack Bar"
            color="#30d020"
            backgrondColor="#20b000"
          />
        </View>
      </View>
      <View style={styles.row}>
        <RingBox
          topLabel={"$" + parseFloat(finData.AthleticstoreSpent || "0").toFixed(2)}
          bottomLabel={"$" + parseFloat(finData.AthleticstoreAmount || "0").toFixed(2)}
          value={parseFloat(finData.AthleticstoreSpent || "0") / parseFloat(finData.AthleticstoreAmount)}
          name="Athletic Store"
          color="#0060ff"
          backgrondColor="#0040e0"
        />
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
  }
});