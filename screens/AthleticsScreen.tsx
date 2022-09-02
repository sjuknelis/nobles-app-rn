import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, Animated, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import { Text, View, Container, KEY_COLOR, LoadingItem } from '../components/Themed';
import { WeekSelector } from '../components/WeekSelector';
import { SlideSelector } from '../components/SlideSelector';
import { requestAPI } from '../hooks/requestAPI';
import { processGameText,processTeamText,processOpponentText,schoolLogos } from '../hooks/teamInfo';
import { getColors } from '../hooks/colorSchemeContext';

export default function AthleticsScreen({ openMenu }) {
  const [mode,setMode] = useState(0);

  const upcoming = useMemo(() => <UpcomingView />,[]);
  const results = useMemo(() => <ResultsView />,[]);

  return (
    <Container title="ATHLETICS" menuButton={{
      icon: "bars",
      action: openMenu
    }} upperChildren={(
      <View style={[styles.row,{
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10
      }]}>
        <View style={{
          flex: 4
        }}>
          <SlideSelector options={["Upcoming","Results"]} setSelected={setMode} inverted={true} />
        </View>
      </View>
    )}>
      <View style={mode == 0 ? styles.fullWidth : styles.hidden}>
        { upcoming }
      </View>
      <View style={mode == 1 ? styles.fullWidth : styles.hidden}>
        { results }
      </View>
    </Container>
  );
}

function UpcomingView() {
  const [athleticsData,setAthleticsData] = useState([]);
  const [viewLimit,setViewLimit] = useState(100);
  
  useEffect(() => {
    const fetchAthleticsData = async () => {
      let data = (await requestAPI("/webservices/gameschedule.php?eventtypes=AllGameSchedule",true)).children;
      data = data
        .map(item => {
          item.timestamp = new Date(item.getElementsByTagName("eventDate")[0].value.split("/").join("-")).getTime();
          return item;
        })
        .sort((a,b) => a.timestamp - b.timestamp);
      setAthleticsData(data);
    };

    fetchAthleticsData()
      .catch(console.error);
  },[]);

  return (
    <View style={{
      width: "100%",
      flex: 1
    }}>
      { athleticsData.length > 0 ? (
        <FlatList
          data={athleticsData}
          renderItem={({item,index}) => <UpcomingItem item={item} showDate={index == 0 || athleticsData[index - 1].timestamp != item.timestamp} />}
          keyExtractor={item => JSON.stringify(item)}
          maxToRenderPerBatch={30}
        />
      ) : (
        <LoadingItem anim="athletics" />
      ) }
    </View>
  );
}

function UpcomingItem({ item,showDate }) {
  const {fgColor,bgColor,semiColor} = getColors();
  const opponent = processOpponentText(item.getElementsByTagName("opponent")[0].value);

  return (
    <View>
      { showDate ? (
        <View style={[styles.row,{
          paddingTop: 10,
          paddingBottom: 10,
          borderColor: "#ccc",
          borderBottomWidth: 1
        }]}>
          <Text style={{
            fontFamily: "EBGaramond_700Bold"
          }}>{ `${item.getElementsByTagName("eventMonth")[0].value}/${item.getElementsByTagName("eventDay")[0].value}/${item.getElementsByTagName("eventYear")[0].value}` }</Text>
        </View>
      ) : null }
      <View style={[styles.row,{
        paddingTop: 10,
        paddingBottom: 10,
        borderColor: "#ccc",
        borderBottomWidth: 1
      }]}>
        <View style={{
          flex: 5
        }}>
          <Text style={{
            fontFamily: "Nunito_700Bold",
            fontSize: 18,
            color: semiColor
          }}>{ processGameText(item.getElementsByTagName("activity")[0].value) }</Text>
          <View style={[styles.row,{
            alignItems: "center"
          }]}>
            <Image
              source={schoolLogos[Object.keys(schoolLogos).indexOf(opponent) > -1 ? opponent : "None"]}
              style={[styles.image,{
                marginRight: 5
              }]}
            />
            <Text style={{
              fontFamily: "Nunito_700Bold",
              fontSize: 17,
              color: semiColor
            }}>{ opponent }</Text>
          </View>
        </View>
        <View style={{
          flex: 1,
          borderColor: "#ccc",
          borderLeftWidth: 1,
          justifyContent: "center"
        }}>
          <Text style={[styles.center,{
            fontFamily: "Nunito_400Regular",
            fontSize: 15,
            color: item.getElementsByTagName("homeAway")[0].value == "Home" ? "lime" : "red"
          }]}>{ item.getElementsByTagName("homeAway")[0].value == "Home" ? "HOME" : "AWAY" }</Text>
          <Text style={[styles.center,{
            color: semiColor,
            fontFamily: "Nunito_400Regular",
            fontSize: 15
          }]}>{ item.getElementsByTagName("startTime")[0].value.split(" ")[0] }</Text>
        </View>
      </View>
    </View>
  );
}

function ResultsView() {
  const [athleticsData,setAthleticsData] = useState([]);
  
  useEffect(() => {
    const fetchAthleticsData = async () => {
      let data = (await requestAPI("/webservices/gameschedule.php?eventtypes=ContestResults",true)).children;
      data = data
        .map(item => {
          item.timestamp = new Date(item.getElementsByTagName("eventDate")[0].value.split("/").join("-")).getTime();
          return item;
        })
        .sort((a,b) => a.timestamp - b.timestamp);
      setAthleticsData(data);
    };

    fetchAthleticsData()
      .catch(console.error);
  },[]);

  return (
    <View style={{
      width: "100%",
      flex: 1
    }}>
      { athleticsData.length > 0 ? (
        <FlatList
          data={athleticsData}
          renderItem={({item,index}) => <ResultsItem item={item} showDate={index == 0 || athleticsData[index - 1].getElementsByTagName("eventDate")[0].value != item.getElementsByTagName("eventDate")[0].value} />}
          keyExtractor={item => JSON.stringify(item)}
          ListFooterComponent={(
            <View style={{
              height: 60
            }} />
          )}
        />
      ) : (
        <LoadingItem anim="athletics" />
      ) }
    </View>
  );
}

function ResultsItem({ item,showDate }) {
  const {fgColor,bgColor,semiColor} = getColors();
  const scoreData = item.getElementsByTagName("Result")[0].value.split(" ");
  let localScore = -1;
  let opponentScore = -1;
  if ( scoreData.length > 2 ) {
    if ( scoreData[0] == "W" ) {
      localScore = scoreData[1];
      opponentScore = scoreData[3];
    } else {
      localScore = scoreData[3];
      opponentScore = scoreData[1];
    }
  }

  const localStyle = {
    color: scoreData[0] != "L" ? semiColor : "gray"
  };
  const opponentStyle = {
    color: scoreData[0] != "W" ? semiColor : "gray"
  };
  const opponent = processOpponentText(item.getElementsByTagName("opponent")[0].value);

  return (
    <View>
      { showDate ? (
        <View style={[styles.row,{
          paddingTop: 10,
          paddingBottom: 10,
          borderColor: "#ccc",
          borderBottomWidth: 1
        }]}>
          <Text style={{
            fontSize: 20,
            fontFamily: "EBGaramond_700Bold"
          }}>{ `${item.getElementsByTagName("eventMonth")[0].value}/${item.getElementsByTagName("eventDay")[0].value}/${item.getElementsByTagName("eventYear")[0].value}` }</Text>
        </View>
      ) : null }
      <View style={{
        paddingTop: 10,
        paddingBottom: 10,
        borderColor: "#ccc",
        borderBottomWidth: 1
      }}>
        <View style={styles.row}>
          <Text style={{
            fontSize: 15,
            fontFamily: "Nunito_400Regular",
            color: "lightgray"
          }}>{ processTeamText(item.getElementsByTagName("activity")[0].value) }</Text>
        </View>
        <View style={styles.row}>
          <View style={{
            flex: 1
          }}>
            <Image
              source={schoolLogos[Object.keys(schoolLogos).indexOf(opponent) > -1 ? opponent : "None"]}
              style={styles.image}
            />
          </View>
          <View style={{
            flex: 6
          }}>
            <Text style={[styles.resultsInfo,opponentStyle]}>{ opponent }</Text>
          </View>
          <View style={{
            flex: 1
          }}>
            <Text style={[styles.resultsInfo,styles.score,opponentStyle]}>{ opponentScore != -1 ? opponentScore : "" }</Text>
          </View>
          <View style={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: 20,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FontAwesome size={25} name="caret-left" color={scoreData[0] == "L" ? "black" : "white"} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{
            flex: 1
          }}>
            <Image
              source={require("../assets/images/schoollogos/Nobles.png")}
              style={{
                width: 30,
                height: 30
              }}
            />
          </View>
          <View style={{
            flex: 6
          }}>
            <Text style={[styles.resultsInfo,localStyle]}>Nobles</Text>
          </View>
          <View style={{
            flex: 1
          }}>
            <Text style={[styles.resultsInfo,styles.score,localStyle]}>{ localScore != -1 ? localScore : "" }</Text>
          </View>
          <View style={{
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: 20,
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FontAwesome size={25} name="caret-left" color={scoreData[0] == "W" ? "black" : "white"} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    paddingBottom: 5,
    paddingLeft: "2.5%",
    paddingRight: "2.5%",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    width: "100%"
  },
  center: {
    textAlign: "center"
  },
  resultsInfo: {
    fontFamily: "Nunito_700Bold"
  },
  score: {
    textAlign: "right",
    paddingRight: 15
  },
  image: {
    width: 30,
    height: 30
  },
  fullWidth: {
    width: "100%",
    flex: 1
  },
  hidden: {
    width: 0,
    height: 0,
    opacity: 0
  },
  hiddenButton: {
    transform: [
      { scale: 0 }
    ]
  }
});