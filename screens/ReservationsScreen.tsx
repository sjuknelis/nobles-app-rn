import React, { useState, useEffect, useRef, useContext } from 'react';
import { StyleSheet, Image, TouchableOpacity, FlatList, Animated, Dimensions, LayoutAnimation } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, BigButton, LoadingItem, KEY_COLOR } from '../components/Themed';
import { requestAPI } from '../hooks/requestAPI';
import { ModalContext } from '../hooks/modalContext';
import { SlideSelector } from '../components/SlideSelector';
import { getColors } from '../hooks/colorSchemeContext';

export default function ReservationsScreen({ openMenu }) {
  const {fgColor,bgColor} = getColors();
  const [reservations,setReservations] = useState(null);
  const [modalData,setModalData] = useContext(ModalContext);

  const fetchReservationData = async () => {
    const reservationData = await requestAPI(`xmlMyReservations.php?username=sjuknelis24`,true);
    setReservations(reservationData.children);
  };
  useEffect(() => {
    fetchReservationData()
      .catch(console.error);
  },[]);

  const addReservation = () => {
    setModalData({
      open: true,
      content: (<ReservationModal addReservations={async (dates,meal) => {
        setReservations(null);
        setModalData({
          open: false
        });
        for ( let date of dates ) {
          await fetch(`https://nobilis.nobles.edu/webservices/reservedinner.php?username=sjuknelis24&mealtype=${["breakfast","dinner"][meal]}&date=${date}`);
        }
        fetchReservationData();
      }} close={() => {
        setModalData({
          open: false
        });
      }} />)
    });
  };
  const removeReservation = async index => {
    const reservation = reservations[index];
    setReservations(null);
    const date = reservation.getElementsByTagName("Date")[0].value;
    const meal = reservation.getElementsByTagName("MealType")[0].value;
    await fetch(`https://nobilis.nobles.edu/iosnoblesappweb/canceldinner.php?username=sjuknelis24&date=${date}&mealtype=${meal}`);
    fetchReservationData();
  };
  const removeAllReservations = async () => {
    const copyReservations = reservations.map(item => item);
    setReservations(null);
    for ( const reservation of reservations ) {
      const date = reservation.getElementsByTagName("Date")[0].value;
      const meal = reservation.getElementsByTagName("MealType")[0].value;
      await fetch(`https://nobilis.nobles.edu/iosnoblesappweb/canceldinner.php?username=sjuknelis24&date=${date}&mealtype=${meal}`);
    }
    fetchReservationData();
  }

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
        }]} onPress={removeAllReservations}>
          <FontAwesome size={20} name="trash" color={fgColor} style={{
            paddingRight: 10
          }} />
          <Text>All</Text>
        </TouchableOpacity>
      </View>
    )}>
      { ! reservations ? (
        <LoadingItem anim="menu" />
      ) : (reservations.length <= 0 ? (
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
      )) }
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
        <Text>{ capitalize(item.getElementsByTagName("MealType")[0].value) } - { item.getElementsByTagName("Date")[0].value }</Text>
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

function ReservationModal({ addReservations,close }) {
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
          }} onPress={() => close()}>
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
        backgroundColor: bgColor,
        justifyContent: "space-around"
      }}>
        <Calendar updateSelectedDays={setToCreate} />
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

function Calendar({ updateSelectedDays }) {
  const {fgColor,bgColor} = getColors();
  const [selectedMonth,setSelectedMonth] = useState(null);
  useEffect(() => {
    const today = new Date();
    today.setDate(1);
    setSelectedMonth(today);
  },[]);

  const [selectedDays,setSelectedDays] = useState([]);
  const daySelected = (number,isSelected) => {
    const pad = n => n < 10 ? "0" + n : n;
    const dateStr = `${pad(selectedMonth.getMonth() + 1)}/${pad(number)}/${selectedMonth.getFullYear()}`;
    const copySelectedDays = selectedDays.map(item => item);
    const index = selectedDays.indexOf(dateStr);
    if ( index == -1 ) copySelectedDays.push(dateStr);
    else copySelectedDays.splice(index,1);
    console.log(copySelectedDays)
    setSelectedDays(copySelectedDays);
    updateSelectedDays(copySelectedDays);
  };

  if ( ! selectedMonth ) return null;

  const offset = -selectedMonth.getDay() + 1;
  let maxNumber = [31,28,31,30,31,30,31,31,30,31,30,31][selectedMonth.getMonth()];
  if ( selectedMonth.getMonth() == 1 && selectedMonth.getFullYear() % 4 == 0 ) maxNumber++;
  
  const today = new Date();
  let minSelectable = today.getDate();
  today.setDate(1);
  if ( today.getMonth() != selectedMonth.getMonth() || today.getFullYear() != selectedMonth.getFullYear() ) {
    if ( today.getTime() < selectedMonth.getTime() ) minSelectable = 0;
    else if ( today.getTime() > selectedMonth.getTime() ) minSelectable = 32;
  }

  const elements = [];
  for ( let i = 0; i < 6; i++ ) {
    elements.push((
      <CalendarWeek start={offset + i * 7} maxNumber={maxNumber} minSelectable={minSelectable} daySelected={daySelected} />
    ));
  }

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity style={{
          flex: 1,
          padding: 10,
          alignItems: "center",
          justifyContent: "center"
        }} onPress={() => {
          const copySelectedMonth = new Date(selectedMonth.getTime());
          copySelectedMonth.setMonth(copySelectedMonth.getMonth() - 1);
          setSelectedMonth(copySelectedMonth);
          setSelectedDays([]);
          updateSelectedDays([]);
        }}>
          <FontAwesome name="chevron-left" color={fgColor} size={20} />
        </TouchableOpacity>
        <View style={{
          flex: 4,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={{
            textAlign: "center"
          }}>{ ["January","February","March","April","May","June","July","August","September","October","November","December"][selectedMonth.getMonth()] } { selectedMonth.getFullYear() }</Text>
        </View>
        <TouchableOpacity style={{
          flex: 1,
          margin: 5,
          padding: 3,
          alignItems: "center",
          justifyContent: "center"
        }} onPress={() => {
          const copySelectedMonth = new Date(selectedMonth.getTime());
          copySelectedMonth.setMonth(copySelectedMonth.getMonth() + 1);
          setSelectedMonth(copySelectedMonth);
          setSelectedDays([]);
          updateSelectedDays([]);
        }}>
          <FontAwesome name="chevron-right" color={fgColor} size={20} />
        </TouchableOpacity>
      </View>
      { elements }
    </View>
  );
}

function CalendarWeek({ start,maxNumber,minSelectable,daySelected }) {
  if ( start > maxNumber ) return null;
  const elements = [];
  for ( let i = 0; i < 7; i++ ) {
    elements.push((
      <CalendarDay key={i} number={start + i} maxNumber={maxNumber} faded={start + i < minSelectable || i == 0 || i == 6} daySelected={daySelected} />
    ));
  }
  return (
    <View style={styles.row}>
      { elements }
    </View>
  );
}

function CalendarDay({ number,maxNumber,faded,daySelected }) {
  const {fgColor,bgColor} = getColors();
  const [selected,setSelected] = useState(false);
  const outOfBounds = number <= 0 || number > maxNumber;
  const selectable = ! outOfBounds && ! faded;

  useEffect(() => {
    setSelected(false);
  },[number]);

  return (
    <TouchableOpacity style={{
      flex: 1
    }} onPress={() => {
      if ( ! selectable ) return;
      daySelected(number,! selected);
      setSelected(! selected);
    }}>
      <View style={{
        margin: 5,
        padding: 3,
        borderRadius: 100,
        backgroundColor: selected ? fgColor : bgColor
      }}>
        <Text style={{
          color: outOfBounds ^ selected ? bgColor : fgColor,
          textAlign: "center",
          opacity: selectable ? 1 : .5
        }}>{ number }</Text>
      </View>
    </TouchableOpacity>
  )
}

/*<Calendar
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
        />*/

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  }
});