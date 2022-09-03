import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlideSelector } from "../components/SlideSelector";
import { BigButton, CheckboxSet, Container, Text, View } from "../components/Themed";
import { getColors } from "../hooks/colorSchemeContext";
import { ModalContext } from "../hooks/modalContext";
import { getCreds, requestAPI } from "../hooks/requestAPI";
import { getWindowHeight } from "../hooks/windowHeight";
import { EndingView, FlyingView, InGameView } from "./MenuGameInnerViews";

export default function NameGameScreen({ openMenu }) {
  const leaderboard = [
    {
      name: "Simon Juknelis",
      pno: 240472,
      score: 60
    },
    {
      name: "A B",
      pno: 240472,
      score: 59
    },
    {
      name: "C D",
      pno: 240472,
      score: 59
    },
    {
      name: "E F",
      pno: 240472,
      score: 58
    },
    {
      name: "G H",
      pno: 240472,
      score: 57
    },{
      name: "I J",
      pno: 240472,
      score: 56
    },
    {
      name: "K L",
      pno: 240472,
      score: 56
    },
    {
      name: "M N",
      pno: 240472,
      score: 55
    },
    {
      name: "O P",
      pno: 240472,
      score: 54
    },
    {
      name: "Q R",
      pno: 240472,
      score: 53
    },
    {
      name: "S T",
      pno: 240472,
      score: 52
    },
    {
      name: "U V",
      pno: 240472,
      score: 51
    },
    {
      name: "W X",
      pno: 240472,
      score: 50
    },
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
        name: `${item.getElementsByTagName("First")[0].value} ${item.getElementsByTagName("Last")[0].value}`,
        gradeIndex: parseInt(item.getElementsByTagName("StudentGrade")[0].value) - 7
      }});
      setDirectory(directoryRes);
    };
    fetchDirectory()
      .catch(console.error);
  },[]);

  const [ids,setIDs] = useState([]);
  const [learnMode,setLearnMode] = useState(false);

  const [inGame,setInGameInternal] = useState(false);
  const setInGame = value => {
    setInGameInternal(value);
    if ( ! value ) setIDs([]);
  }
  const [menu,setMenu] = useState(1);
  const [gameView,setGameViewInternal] = useState("ending");
  const setGameView = (value,score) => {
    setGameViewInternal(value);
    if ( value == "flying" && ! learnMode ) {
      const statsCopy = Object.assign({},stats);
      statsCopy.games++;
      if ( score > statsCopy.highscore ) statsCopy.highscore = score;
      setStats(statsCopy);

      const storeStats = async () => {
        await AsyncStorage.setItem("@gamestats",JSON.stringify(statsCopy));
      };
      storeStats()
        .catch(console.error);
    }
  }

  const gameViews = {
    ingame: (<InGameView directory={directory} learnMode={learnMode} setIDs={setIDs} setInGame={setInGame} setGameView={setGameView} />),
    flying: (<FlyingView ids={ids} setGameView={setGameView} />),
    ending: (<EndingView ids={ids} highscore={stats.highscore || 0} setInGame={setInGame} setMenu={setMenu} setGameView={setGameView} />)
  };

  const [modalData,setModalData] = useContext(ModalContext);
  const menus = [
    (
      <View style={{
        padding: 5
      }}>
        <Text style={[styles.nunitoBold,styles.small]}>How to Play</Text>
        <Text style={[styles.nunito,styles.small]}>Once the name game begins, you will see a picture of a student and 4 names. Guess the correct name of 1 point. The object of the game is to score the most points (complete shocker). If you are incorrect, 2 seconds will be subtracted from the timer. You only have 60 seconds, so think fast! The top 99 scores are shown in the leaderboard tab.</Text>
        <Text style={[styles.nunitoBold,styles.small,{
          marginTop: 10
        }]}>The Purpose</Text>
        <Text style={[styles.nunito,styles.small]}>I made the name game so everyone could get to know each other's names, to add a fun component to the app, and because it was fun to code. I hope you enjoy it!</Text>
      </View>
    ),
    (
      <View>
        <View style={{
          padding: 5
        }}>
          <Text style={[styles.nunitoBold,styles.small]}>Stats</Text>
          <Text style={[styles.nunito,styles.small]}>My high score: { stats.highscore || 0 }</Text>
          <Text style={[styles.nunito,styles.small]}>My games played: { stats.games || 0 }</Text>
          <Text style={[styles.nunito,styles.small]}>Schoolwide correct guesses: 0</Text>
          <Text style={[styles.nunito,styles.small]}>Schoolwide games played: 0</Text>
          <Text style={[styles.nunito,styles.small]}>Schoolwide average per game: 0</Text>
        </View>
        <View style={styles.row}>
          <BigButton style={{
            flex: 1,
            paddingTop: 60,
            paddingBottom: 60
          }} icon="gamepad" text="Ranked" size={30} onPress={() => {
            setLearnMode(null);
            setGameView("ingame");
            setInGame(true);
          }} />
          <BigButton style={{
            flex: 1,
            paddingTop: 60,
            paddingBottom: 60
          }} icon="group" text="Learn" size={30} onPress={() => {
            setModalData({
              open: true,
              content: (<LearnModal start={options => {
                setModalData({
                  open: false
                });
                setLearnMode(options);
                setGameView("ingame");
                setInGame(true);
              }} close={() => {
                setModalData({
                  open: false
                });
              }} />)
            })
          }} />
        </View>
      </View>
    ),
    (
      <FlatList
        data={leaderboard}
        keyExtractor={item => item.name}
        renderItem={({item,index}) => <LeaderboardItem item={item} index={index + 1} isEqual={index > 0 && item.score == leaderboard[index - 1].score} />}
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

function LeaderboardItem({ item,index,isEqual }) {
  const stylePlace = () => {
    let color = "black";
    if ( index <= 10 ) color = "green";
    if ( index == 3 ) color = "brown";
    if ( index == 2 ) color = "rgb(192,192,192)";
    if ( index == 1 ) color = "rgb(206,174,78)";
    return {
      fontFamily: "Nunito_700Bold",
      color,
      textDecorationLine: isEqual ? "underline" : null
    };
  }

  return (
    <View style={[styles.row,{
      marginBottom: 6
    }]}>
      <View style={{
        flex: 1,
        justifyContent: "center",
        marginLeft: 10,
        marginRight: -7
      }}>
        <Text style={[styles.nunito,stylePlace()]}>{ index }</Text>
      </View>
      <Image
        style={{
          flex: 1,
          aspectRatio: 1,
          borderRadius: 1000
        }}
        source={{
          uri: `https://nobilis.nobles.edu/images_sitewide/photos/${item.pno}.jpeg`
        }}
      />
      <View style={{
        flex: 5,
        justifyContent: "center",
        marginLeft: 15
      }}>
        <Text style={{
          fontFamily: "Nunito_700Bold",
          color: "black"
        }}>{ item.name }</Text>
      </View>
      <View style={{
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center",
        marginRight: 5
      }}>
        <Text style={styles.nunito}>{ item.score }</Text>
      </View>
    </View>
  );
}

function LearnModal({ start,close }) {
  const {fgColor,bgColor} = getColors();

  const [mode,setMode] = useState(0);
  const [grades,setGrades] = useState(new Array(6).fill(true));

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
          }} onPress={() => {
            close();
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
            }}>Learn Settings</Text>
          </View>
          <View style={{
            flex: 1
          }} />
        </View>
      </View>
      <View style={{
        flex: 1,
        justifyContent: "space-around",
        padding: 5
      }}>
        <Text style={{
          marginBottom: 10
        }}>Game Mode</Text>
        <SlideSelector options={["Timed","Continuous"]} setSelected={setMode} />
        <Text style={{
          marginTop: 10,
          marginBottom: 10
        }}>Grades Included</Text>
        <CheckboxSet labels={["7th","8th","9th","10th","11th","12th"]} setSelected={setGrades} />
        <BigButton text="Start" size={22} style={{
          marginTop: 20
        }} onPress={() => start({mode,grades})} />
      </View>
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
  },
  small: {
    fontSize: 18
  }
});