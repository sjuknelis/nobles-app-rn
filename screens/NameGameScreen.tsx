import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Image, LayoutAnimation, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SlideSelector } from "../components/SlideSelector";
import { BigButton, CheckboxSet, Container, LoadingItem, Text, View } from "../components/Themed";
import { getColors } from "../hooks/colorSchemeContext";
import { ModalContext } from "../hooks/modalContext";
import { getCreds, requestAPI } from "../hooks/requestAPI";
import { getWindowHeight } from "../hooks/windowHeight";
import { EndingView, FlyingView, InGameView } from "./MenuGameInnerViews";

import "../hooks/firebaseContext";
import { FirebaseContext, setLeaderboardScore } from "../hooks/firebaseContext";
import { LockMenuContext } from "../hooks/lockMenuContext";

export default function NameGameScreen({ openMenu }) {
  const windowHeight = getWindowHeight();

  const [stats,setStats] = useState({});
  const [statsLoaded,setStatsLoaded] = useState(false);
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
          highscoreGrade: 0,
          games: 0
        };
        setStats(noDataObj);
        await AsyncStorage.setItem("@gamestats",JSON.stringify(noDataObj));
      }
      setStatsLoaded(true);
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

  const [aboutData,setAboutData] = useState({});
  const [grade,setGrade] = useState(0);
  useEffect(() => {
    const fetchAboutData = async () => {
      const data = await requestAPI("aboutme.php");
      let gradeVal = 35 - parseInt(data.UNID.slice(-2));
      if ( ! (gradeVal >= 9 && gradeVal <= 12) ) gradeVal = 0;

      const {pin} = await getCreds();
      const directoryURI = `xmlDirectory.php?iosPIN=${pin}&FirstName=${data.FirstName}&LastName=${data.UNID.slice(1,-2)}&Grade=${gradeVal}`;
      let directoryData;
      if ( gradeVal != 0 ) directoryData = await requestAPI(directoryURI + "&PersonType=Student",true);
      else directoryData = await requestAPI(directoryURI + "&PersonType=Faculty",true);
      const lname = directoryData.children[0].getElementsByTagName("Last")[0].value;
      data.lname = lname;

      setAboutData(data);
      setGrade(gradeVal);
    };

    fetchAboutData()
      .catch(console.error);
  },[]);

  const [ids,setIDs] = useState([]);
  const [learnMode,setLearnMode] = useState(false);
  const [selectedGrade,setSelectedGrade] = useState(0);

  const [lockMenu,setLockMenu] = useContext(LockMenuContext);
  const [inGame,setInGameInternal] = useState(false);
  const setInGame = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInGameInternal(value);
    if ( ! value ) setIDs([]);
    setLockMenu(value);
    setInLeaderboardInternal(false);
  }
  const [firebaseData,setFirebaseData] = useContext(FirebaseContext);
  const [menu,setMenu] = useState(1);
  const [gameView,setGameViewInternal] = useState("ending");
  const setGameView = (value,score) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGameViewInternal(value);
    if ( value == "flying" && ! learnMode ) {
      const statsCopy = Object.assign({},stats);
      console.log(selectedGrade,updateScore,score,statsCopy);
      statsCopy.games++;
      let updateScore = false;
      if ( selectedGrade == 0 ) {
        if ( score > statsCopy.highscore ) {
          statsCopy.highscore = score;
          updateScore = true;
        }
      } else {
        if ( score > statsCopy.highscoreGrade ) {
          statsCopy.highscoreGrade = score;
          updateScore = true;
        }
      }
      console.log(selectedGrade,updateScore,score,statsCopy);
      setLeaderboardScore(firebaseData,selectedGrade,aboutData,score,updateScore);
      setStats(statsCopy);

      const storeStats = async () => {
        console.error(JSON.stringify(statsCopy));
        await AsyncStorage.setItem("@gamestats",JSON.stringify(statsCopy));
      };
      storeStats()
        .catch(console.error);
    }
  }

  const gameViews = {
    ingame: (<InGameView directory={directory} learnMode={learnMode} selectedGrade={selectedGrade} setIDs={setIDs} setInGame={setInGame} setGameView={setGameView} />),
    flying: (<FlyingView ids={ids} setGameView={setGameView} />),
    ending: (<EndingView ids={ids} highscore={stats.highscore || 0} setInGame={setInGame} setMenu={setMenu} setGameView={setGameView} />)
  };

  const [leaderboardPath,setLeaderboardPath] = useState("");
  const currentLeaderboard = Object.values(firebaseData.data[leaderboardPath] || {})
    .sort((a,b) => b.s - a.s)
    .slice(0,99);
  const [inLeaderboard,setInLeaderboardInternal] = useState(false);
  const setInLeaderboard = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInLeaderboardInternal(value);
  };
  const leaderboardTitles = {
    "leaderboards/main": "Schoolwide",
    "leaderboards/7": "Grade 7",
    "leaderboards/8": "Grade 8",
    "leaderboards/9": "Grade 9",
    "leaderboards/10": "Grade 10",
    "leaderboards/11": "Grade 11",
    "leaderboards/12": "Grade 12",
    "leaderboards/old 2021-2022": "2021-2022 School Year"
  };

  const hasSchoolScore = firebaseData.data["leaderboards/main"] !== undefined && firebaseData.data["leaderboards/main"][firebaseData.uid] !== undefined;
  const hasGradeScore = firebaseData.data[`leaderboards/${grade}`] !== undefined && firebaseData.data[`leaderboards/${grade}`][firebaseData.uid] !== undefined;

  const [modalData,setModalData] = useContext(ModalContext);
  const {fgColor,bgColor,semiColor} = getColors();
  const nunitoColor = {
    color: semiColor
  };
  const menus = [
    (
      <View style={{
        padding: 5
      }}>
        <Text style={[styles.nunitoBold,styles.small,nunitoColor]}>How to Play</Text>
        <Text style={[styles.nunito,styles.small,nunitoColor]}>Once the name game begins, you will see a picture of a student and 4 names. Guess the correct name of 1 point. The object of the game is to score the most points (complete shocker). If you are incorrect, 2 seconds will be subtracted from the timer. You only have 60 seconds, so think fast! The top 99 scores are shown in the leaderboard tab.</Text>
        <Text style={[styles.nunitoBold,styles.small,nunitoColor,{
          marginTop: 10
        }]}>The Purpose</Text>
        <Text style={[styles.nunito,styles.small,nunitoColor]}>I made the name game so everyone could get to know each other's names, to add a fun component to the app, and because it was fun to code. I hope you enjoy it!</Text>
      </View>
    ),
    (
      <View>
        <View style={{
          padding: 5
        }}>
          <Text style={[styles.nunitoBold,styles.small,nunitoColor]}>Stats</Text>
          <Text style={[styles.nunito,styles.small,nunitoColor]}>My high score: { stats.highscore != 0 ? stats.highscore : (hasSchoolScore ? firebaseData.data["leaderboards/main"][firebaseData.uid].s : 0) }</Text>
          <Text style={[styles.nunito,styles.small,nunitoColor]}>My high score (grade): { stats.highscoreGrade != 0 ? stats.highscoreGrade : (hasGradeScore ? firebaseData.data[`leaderboards/${grade}`][firebaseData.uid].s : 0) }</Text>
          <Text style={[styles.nunito,styles.small,nunitoColor]}>My games played: { stats.games || 0 }</Text>
          <Text style={[styles.nunito,styles.small,nunitoColor]}>Schoolwide correct guesses: { firebaseData.data.global.total_score }</Text>
          <Text style={[styles.nunito,styles.small,nunitoColor]}>Schoolwide games played: { firebaseData.data.global.games_played }</Text>
          <Text style={[styles.nunito,styles.small,nunitoColor]}>Schoolwide average per game: { Math.floor(firebaseData.data.global.total_score / firebaseData.data.global.games_played) }</Text>
        </View>
        <View style={[styles.row,{
          marginBottom: -10
        }]}>
          <BigButton icon="gamepad" text="Main Game" size={25} onPress={() => {
            setLearnMode(null);
            setSelectedGrade(0);
            setGameView("ingame");
            setInGame(true);
          }} />
        </View>
        <View style={[styles.row,{
          marginBottom: -10
        }]}>
          <BigButton icon="group" text="My Grade" size={25} onPress={() => {
            setLearnMode(null);
            setSelectedGrade(grade - 7);
            setGameView("ingame");
            setInGame(true);
          }} />
        </View>
        <View style={styles.row}>
          <BigButton icon="address-book" text="Learn" size={25} onPress={() => {
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
    inLeaderboard ? (
      <View style={{
        backgroundColor: fgColor,
        margin: -5,
        padding: 5
      }}>
        <TouchableOpacity key="a" style={[styles.row,{
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 5,
          paddingRight: 5,
          marginTop: -10,
          alignItems: "center"
        }]} onPress={() => {
          setInLeaderboard(false);
        }}>
          <FontAwesome name="chevron-left" color={bgColor} size={20} />
          <Text style={{
            color: bgColor,
            fontFamily: "EBGaramond_700Bold",
            paddingLeft: 10
          }}>{ leaderboardTitles[leaderboardPath] }</Text>
        </TouchableOpacity>
        <FlatList
          data={currentLeaderboard}
          keyExtractor={item => item.i}
          renderItem={({item,index}) => <LeaderboardItem item={item} index={index + 1} isEqual={index > 0 && item.s == currentLeaderboard[index - 1].s} showImage={leaderboardPath != "leaderboards/old 2021-2022"} />}
          ListFooterComponent={(
            <View style={{
              height: 50
            }} />
          )}
        />
      </View>
    ) : (
      <View key="b" style={{
        margin: -5,
        padding: 5
      }}>
        <LeaderboardButton text="Schoolwide" onPress={() => {
          setLeaderboardPath("leaderboards/main");
          setInLeaderboard(true);
        }} />
        { grade != 0 ? (
          <LeaderboardButton text={`Grade ${grade}`} onPress={() => {
            setLeaderboardPath(`leaderboards/${grade}`);
            setInLeaderboard(true);
          }} />
        ) : null }
        <LeaderboardButton text="2021-2022 School Year" onPress={() => {
          setLeaderboardPath("leaderboards/old 2021-2022");
          setInLeaderboard(true);
        }} />
      </View>
    )
  ];

  return (
    <View style={{
      backgroundColor: inGame ? "white" : "transparent",
      height: windowHeight
    }}>
      {
        inGame ? gameViews[gameView] : (
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
                <SlideSelector options={["Rules","Play","Leaderboard"]} setSelected={setMenu} inverted={true} preselect={menu} />
              </View>
            </View>
          )}>
            { statsLoaded && directory && firebaseData.data["leaderboards/main"] ? menus[menu] : (
              <LoadingItem anim="namegame" />
            ) }
          </Container>
        )
      }
    </View>
  );
}

function LeaderboardItem({ item,index,isEqual,showImage }) {
  const {fgColor,bgColor,semiColor} = getColors();

  const stylePlace = () => {
    let color = bgColor;
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
      { showImage ? (
        <Image
          style={{
            flex: 1,
            aspectRatio: 1,
            borderRadius: 1000
          }}
          source={{
            uri: `https://nobilis.nobles.edu/images_sitewide/photos/${item.i}.jpeg`
          }}
        />
      ) : null }
      <View style={{
        flex: 5,
        justifyContent: "center",
        marginLeft: 15
      }}>
        <Text style={{
          color: bgColor,
          fontFamily: "Nunito_700Bold"
        }}>{ item.n }</Text>
      </View>
      <View style={{
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center",
        marginRight: 5
      }}>
        <Text style={[styles.nunito,{
          color: bgColor
        }]}>{ item.s }</Text>
      </View>
    </View>
  );
}

function LeaderboardButton({ text,onPress }) {
  const windowWidth = Dimensions.get("window").width;
  const {fgColor,bgColor} = getColors();

  return (
    <TouchableOpacity style={[styles.row,{
      backgroundColor: fgColor,
      borderRadius: 10,
      margin: 5,
      width: windowWidth - 20
    }]} onPress={onPress}>
      <Text style={{
        flex: 3,
        color: bgColor,
        padding: 8,
        fontFamily: "EBGaramond_700Bold"
      }}>{ text }</Text>
      <View style={{
        flex: 1,
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: 10
      }}>
        <FontAwesome name="chevron-right" color={bgColor} size={20} />
      </View>
    </TouchableOpacity>
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
        padding: 5,
        backgroundColor: bgColor,
        borderBottomLeftRadius: 7,
        borderBottomRightRadius: 7
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