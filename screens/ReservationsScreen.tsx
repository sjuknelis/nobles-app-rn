import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Image, TouchableOpacity, FlatList, Animated, Dimensions, LayoutAnimation } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

import { Text, View, Container, BigButton } from '../components/Themed';
import { requestAPI } from '../hooks/requestAPI';
import { ModalContext } from '../hooks/modalContext';
import { SlideSelector } from '../components/SlideSelector';
import { getColors } from '../hooks/colorSchemeContext';

export default function ReservationsScreen({ openMenu }) {
  const {fgColor,bgColor} = getColors();
  const [reservations,setReservations] = useState([
    {
      type: "breakfast",
      date: "2022-08-15"
    },
    {
      type: "dinner",
      date: "2022-08-16"
    },
  ]);
  const [modalData,setModalData] = useContext(ModalContext);

  const addReservation = () => {
    setModalData({
      open: true,
      content: (<ReservationModal addReservations={(dates,meal) => {
        setReservations(reservations.concat(dates.map(date => ({type: ["breakfast","dinner"][meal],date}))));
        setModalData({
          open: false
        });
      }} />)
    });
  };
  const removeReservation = index => {
    setReservations(reservations.slice(0,index).concat(reservations.slice(index + 1)));
  };

  return (
    <Container title="RESERVATIONS" menuButton={{
      icon: "bars",
      action: openMenu
    }} upperChildren={(
      <View style={[styles.row,{
        justifyContent: "center"
      }]}>
        <TouchableOpacity style={[styles.row,{
          backgroundColor: bgColor,
          width: "25%",
          marginTop: 5,
          marginBottom: 10,
          marginRight: 10,
          padding: 5,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center"
        }]} onPress={() => addReservation()}>
          <FontAwesome size={20} name="plus" color={fgColor} style={{
            paddingRight: 10
          }} />
          <Text>New</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row,{
          backgroundColor: bgColor,
          width: "25%",
          marginTop: 5,
          marginBottom: 10,
          marginLeft: 10,
          padding: 5,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center"
        }]} onPress={() => setReservations([])}>
          <FontAwesome size={20} name="trash" color={fgColor} style={{
            paddingRight: 10
          }} />
          <Text>All</Text>
        </TouchableOpacity>
      </View>
    )}>
      { reservations.length <= 0 ? (
        <Text style={{
          marginTop: "75%",
          marginBottom: "75%",
          fontSize: 30,
          fontFamily: "EBGaramond_700Bold",
          textAlign: "center"
        }}>No Reservations</Text>
      ) : (
        <FlatList
          data={reservations}
          renderItem={({item,index}) => <ReservationItem item={item} removeItem={() => removeReservation(index)} />}
          keyExtractor={(item,index) => JSON.stringify({item,index})}
        />
      ) }
    </Container>
  );
}

function ReservationItem({ item,removeItem }) {
  const {fgColor,bgColor} = getColors();
  const date = new Date(item.date);
  date.setDate(date.getDate() + 1);
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
  return (
    <View style={[styles.row,{
      borderBottomWidth: 1,
      borderColor: fgColor,
      paddingTop: 10,
      paddingBottom: 10
    }]}>
      <View style={{
        flex: 1,
        alignItems: "center"
      }}>
        <FontAwesome size={40} name="cutlery" color={fgColor} />
      </View>
      <View style={{
        flex: 5,
        justifyContent: "center"
      }}>
        <Text>{capitalize(item.type)} - {date.getMonth() + 1}/{date.getDate()}/{date.getFullYear()}</Text>
      </View>
      <View style={{
        flex: 1,
        justifyContent: "center"
      }}>
        <TouchableOpacity style={{
          width: "100%",
          alignItems: "center"
        }} onPress={removeItem}>
          <FontAwesome size={30} name="trash" color={fgColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRICES = [4,6];

function ReservationModal({ addReservations }) {
  const {fgColor,bgColor} = getColors();
  const [meal,setMeal] = useState(0);
  const [toCreate,setToCreate] = useState([]);

  const pad = n => n < 10 ? "0" + n : n;

  return (
    <View style={{
      height: "100%"
    }}>
      <View style={{
        width: "100%",
        backgroundColor: fgColor,
        padding: 10
      }}>
        <View style={[styles.row,{
          paddingBottom: 10
        }]}>
          <TouchableOpacity style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FontAwesome size={20} name="chevron-left" color={bgColor} />
          </TouchableOpacity>
          <View style={{
            flex: 5
          }}>
            <Text style={{
              fontFamily: "EBGaramond_700Bold",
              fontSize: 22,
              color: bgColor,
              textAlign: "center"
            }}>New Reservation</Text>
          </View>
          <View style={{
            flex: 1
          }} />
        </View>
        <SlideSelector options={["Breakfast","Dinner"]} setSelected={setMeal} inverted={true} />
      </View>
      <View style={{
        flex: 1,
        justifyContent: "space-around"
      }}>
        <Calendar
          markedDates={(() => {
            let out = {};
            for ( const date of toCreate ) {
              out[date] = {selected: true,selectedColor: fgColor};
            }
            return out;
          })()}
          onDayPress={day => {
            let toCreateCopy = [...toCreate];
            if ( toCreate.indexOf(day.dateString) <= -1 ) toCreateCopy.push(day.dateString);
            else toCreateCopy = toCreateCopy.filter(item => item != day.dateString);
            setToCreate(toCreateCopy);
          }}
          minDate={`${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`}
          hideDayNames={true}
        />
        <View style={{
        }}>
          <View style={{
            opacity: toCreate.length == 0 ? .75 : 1,
          }}>
            <TouchableOpacity style={{
              margin: 10,
              padding: 10,
              backgroundColor: fgColor,
              borderRadius: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }} disabled={toCreate.length == 0} onPress={() => addReservations(toCreate,meal)}>
              <Text style={{
                color: bgColor,
                textAlign: "center",
                fontSize: 16
              }}>Make {toCreate.length} {["Breakfast","Dinner"][meal]} Reservations - ${PRICES[meal] * toCreate.length}</Text>
            </TouchableOpacity>
          </View>
        </View>
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