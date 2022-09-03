import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlideSelector } from "../components/SlideSelector";
import { BigButton, Container, Text, View } from "../components/Themed";
import { getColors } from "../hooks/colorSchemeContext";
import { getCreds, requestAPI } from "../hooks/requestAPI";
import { getWindowHeight } from "../hooks/windowHeight";
import { EndingView, FlyingView, InGameView } from "./MenuGameInnerViews";

export default function NameGameScreen({ openMenu }) {
  const leaderboard = [
    {
      name: "A B",
      score: 60
    },
    {
      name: "A B",
      score: 59
    },
    {
      name: "A B",
      score: 59
    },
    {
      name: "A B",
      score: 58
    },
    {
      name: "A B",
      score: 57
    },{
      name: "A B",
      score: 56
    }
  ];

  const [stats,setStats] = useState({});
  useEffect(() => {
    const fetchStats = async () => {
      let jsonValue;
      try {
        jsonValue = await AsyncStorage.getItem("@gamestats");
      } catch ( err ) {
        console.error(err);
        return;
      }
      if ( jsonValue ) {
        setStats(JSON.parse(jsonValue));
      } else {
        const noDataObj = {
          highscore: 0,
          games: 0
        };
        setStats(noDataObj);
        await AsyncStorage.setItem("@gamestats",JSON.stringify(noDataObj));
      }
    };
    fetchStats()
      .catch(console.error);
  },[]);

  const [directory,setDirectory] = useState(null);
  useEffect(() => {
    const fetchDirectory = async () => {
      const {pin} = await getCreds();
      const data = await requestAPI(`xmlDirectory.php?iosPIN=${pin}&PersonType=Student`,true);
      const directoryRes = data.children.map(item => {return {
        pno: item.attributes.id,
        name: `${item.getElementsByTagName("First")[0].value} ${item.getElementsByTagName("Last")[0].value}`
      }});
      setDirectory(directoryRes);
    };
    fetchDirectory()
      .catch(console.error);
  },[]);

  const [ids,setIDs] = useState([]);
  const [inGame,setInGameInternal] = useState(false);
  const setInGame = value => {
    setInGameInternal(value);
    if ( ! value ) setIDs([]);
  }
  const [menu,setMenu] = useState(1);
  const [gameView,setGameViewInternal] = useState("ending");
  const setGameView = (value,score) => {
    setGameViewInternal(value);
    if ( value == "flying" ) {
      const statsCopy = Object.assign({},stats);
      statsCopy.games++;
      if ( score > statsCopy.highscore ) statsCopy.highscore = score;
      setStats(statsCopy);
    }
  }

  const gameViews = {
    ingame: (<InGameView directory={directory} setIDs={setIDs} setInGame={setInGame} setGameView={setGameView} />),
    flying: (<FlyingView ids={ids} setGameView={setGameView} />),
    ending: (<EndingView ids={ids} setInGame={setInGame} setMenu={setMenu} setGameView={setGameView} />)
  };

  const menus = [
    (
      <Text style={styles.nunito}>These are the rules</Text>
    ),
    (
      <View>
        <Text style={styles.nunitoBold}>Stats</Text>
        <Text style={styles.nunito}>My high score: { stats.highscore || 0 }</Text>
        <Text style={styles.nunito}>My games played: { stats.games || 0 }</Text>
        <Text style={styles.nunito}>Schoolwide correct guesses: 0</Text>
        <Text style={styles.nunito}>Schoolwide games played: 0</Text>
        <Text style={styles.nunito}>Schoolwide average per game: 0</Text>
        <View style={styles.row}>
          <BigButton style={{
            flex: 1,
            paddingTop: 60,
            paddingBottom: 60
          }} icon="gamepad" text="Ranked" size={30} onPress={() => {
            setGameView("ingame");
            setInGame(true);
          }} />
          <BigButton style={{
            flex: 1,
            paddingTop: 60,
            paddingBottom: 60
          }} icon="group" text="Learn" size={30} />
        </View>
      </View>
    ),
    (
      <FlatList
        data={leaderboard}
        keyExtractor={item => item.name}
        renderItem={LeaderboardItem}
      />
    )
  ];

  if ( inGame ) {
    return gameViews[gameView];
  } else {
    return (
      <Container title="NAME GAME" menuButton={{
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
            <SlideSelector options={["Rules","Play","Leaderboard"]} setSelected={setMenu} inverted={true} preselect={1} />
          </View>
        </View>
      )}>
        { menus[menu] }
      </Container>
    );
  }
}

function LeaderboardItem({ item }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.nunito,{
        flex: 5
      }]}>{ item.name }</Text>
      <Text style={[styles.nunito,{
        flex: 1,
        textAlign: "center"
      }]}>{ item.score } </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  },
  nunito: {
    fontFamily: "Nunito_400Regular",
    color: "black"
  },
  nunitoBold: {
    fontFamily: "Nunito_700Bold",
    fontSize: 25,
    color: "black"
  }
});