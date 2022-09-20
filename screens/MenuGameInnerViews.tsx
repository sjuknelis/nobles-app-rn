import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "../components/Themed";
import { getColors } from "../hooks/colorSchemeContext";
import { getCreds, requestAPI } from "../hooks/requestAPI";
import { getWindowHeight } from "../hooks/windowHeight";

function GameContainer({ children,innerChildren }) {
  const {fgColor,bgColor} = getColors();
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      height: windowHeight,
      backgroundColor: bgColor,
      zIndex: 10,
      paddingTop: insets.top,
      transform: [
        {translateY: -insets.top}
      ]
    }}>
      <View style={{
        flex: 1,
        backgroundColor: bgColor,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: Platform.OS == "ios" ? 15 : 0,
        borderBottomRightRadius: Platform.OS == "ios" ? 15 : 0,
        marginTop: 10
      }}>
        { children }
      </View>
      { innerChildren }
    </View>
  );
}

export function InGameView({ directory,learnMode,selectedGrade,setIDs,setInGame,setGameView }) {
  const {fgColor,bgColor,semiColor} = getColors();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();

  const [correctIDs,setCorrectIDs] = useState([]);
  const [totalQuestions,setTotalQuestions] = useState(0);
  const usingTimer = ! learnMode || learnMode.mode == 0;

  const [rawTimer,setRawTimer] = useState(6000);
  const [timerAdj,setTimerAdj] = useState(0);
  const [barColor,setBarColor] = useState(semiColor);
  useEffect(() => {
    if ( directory ) {
      generateNewQuestion(directory);
      const endTime = new Date().getTime() + 60000;
      setInterval(() => {
        setRawTimer((endTime - new Date().getTime()) / 10);
      },1000);
    }
  },[directory]);
  useEffect(() => {
    if ( usingTimer && rawTimer - timerAdj <= 0 ) {
      setIDs(correctIDs);
      setGameView("flying",correctIDs.length);
    }
  },[rawTimer,timerAdj]);

  const [choices,setChoices] = useState([]);
  const [correctIndex,setCorrectIndex] = useState(0);
  const [chosen,setChosen] = useState(-1);
  const generateNewQuestion = directoryInUse => {
    const selectedIndices = [];
    for ( let i = 0; i < 4; i++ ) {
      let index;
      do {
        index = Math.floor(Math.random() * directoryInUse.length);
      } while (
        selectedIndices.indexOf(index) > -1 ||
        (learnMode && ! learnMode.grades[directory[index].gradeIndex]) ||
        (! learnMode && selectedGrade != 0 && selectedGrade != directory[index].gradeIndex)
      );
      selectedIndices.push(index);
    }
    setChoices(selectedIndices.map(index => directoryInUse[index]));
    setCorrectIndex(Math.floor(Math.random() * 4));
    setChosen(-1);
  };

  const [score,setScore] = useState(0);
  const [barResetTimeout,setBarResetTimeout] = useState(-1);
  const choicesItems = choices.map((item,index) => {
    let color = semiColor;
    if ( learnMode && chosen != -1 ) {
      if ( index == chosen ) color = "red";
      if ( index == correctIndex ) color = "green";
      if ( color == semiColor ) color = bgColor;
    }
    return (
      <View key={item.name} style={styles.row}>
        <TouchableOpacity style={[styles.row,{
          borderWidth: 1,
          borderColor: color,
          padding: 7,
          marginBottom: 12,
          marginLeft: 15,
          width: windowWidth - 30,
          borderRadius: 10,
          justifyContent: "center"
        }]} onPress={() => {
          if ( learnMode && chosen != -1 ) return;
          if ( index == correctIndex ) {
            setBarColor("green");
            setScore(score + 1);
            setCorrectIDs(correctIDs.concat([choices[index].pno]));
          } else {
            setBarColor("red");
            setTimerAdj(timerAdj + 200);
          }
          setTotalQuestions(totalQuestions + 1);
          setChosen(index);
          if ( barResetTimeout != -1 ) clearInterval(barResetTimeout);
          setBarResetTimeout(setTimeout(() => {
            setBarColor(semiColor);
            if ( learnMode ) generateNewQuestion(directory);
          },2000));
          if ( ! learnMode ) generateNewQuestion(directory);
        }}>
          <Text style={[styles.nunito,{
            color
          }]}>{ item.name }</Text>
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <GameContainer>
      <View style={[styles.row,{
        paddingBottom: 15,
        alignItems: "space-between",
      }]}>
        <TouchableOpacity style={{
          flex: 1,
          alignItems: "center"
        }} onPress={() => setInGame(false)}>
          <FontAwesome name="close" size={30} color={barColor} />
        </TouchableOpacity>
        <View style={{
          flex: 4,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={[styles.nunitoBold,{
            color: barColor
          }]}>{ usingTimer ? (Math.max(rawTimer - timerAdj,0) / 100).toFixed(0) : `${correctIDs.length}/${totalQuestions}` }</Text>
        </View>
        <View style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={[styles.nunitoBold,{
            color: barColor
          }]}>{ usingTimer ? score : "" }</Text>
        </View>
      </View>
      <View style={{
        flex: 1,
        marginBottom: 12,
        alignItems: "center"
      }}>
        <Image
          style={{
            flex: 1,
            aspectRatio: 640 / 800,
            marginLeft: "100%",
            marginRight: "100%"
          }}
          source={{
            uri: choices.length > 0 ? `https://nobilis.nobles.edu/images_sitewide/photos/${choices[correctIndex].pno}.jpeg` : ""
          }}
        />
      </View>
      { choicesItems }
    </GameContainer>
  );
}

export function FlyingView({ ids,setGameView }) {
  const {fgColor,bgColor,semiColor} = getColors();
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();

  const images = ids.map(item => (
    <Image
      style={{
        width: windowWidth / 4,
        aspectRatio: 640 / 800,
        borderRadius: 15,
        margin: 5
      }}
      source={{
        uri: `https://nobilis.nobles.edu/images_sitewide/photos/${item}.jpeg`
      }}
    />
  ));
  const imageHeight = windowWidth / 4 * (800 / 640) + 10;
  const boxHeight = imageHeight * Math.ceil(ids.length / 2);

  const makeSlideAnim = (start,end) => {
    const anim = useRef(new Animated.Value(start)).current;
    useEffect(() => {
      Animated.timing(
        anim,
        {
          toValue: end,
          duration: 8000 * ((boxHeight + windowHeight) / windowHeight),
          useNativeDriver: true
        }
      ).start();
    },[anim]);
    return anim;
  };
  const forwardSlideAnim = makeSlideAnim(-boxHeight,windowHeight);
  const backwardSlideAnim = makeSlideAnim(windowHeight,-boxHeight);

  return (
    <GameContainer innerChildren={(
      <>
        <Animated.View style={{
          position: "absolute",
          top: 0,
          left: windowWidth / 16,
          transform: [
            {translateY: forwardSlideAnim}
          ]
        }}>
          { images.slice(0,Math.ceil(ids.length / 2)) }
        </Animated.View>
        <Animated.View style={{
          position: "absolute",
          top: 0,
          left: windowWidth * (11 / 16),
          paddingTop: ids.length % 2 == 0 ? 0 : imageHeight / 2,
          transform: [
            {translateY: backwardSlideAnim}
          ]
        }}>
          { images.slice(Math.ceil(ids.length / 2)) }
        </Animated.View>
        <TouchableOpacity style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: windowWidth,
          height: windowHeight,
          zIndex: 20
        }} onPress={() => setGameView("ending")} />
      </>
    )}>
      <View style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Text style={[styles.nunito,{
          fontSize: 45,
          color: semiColor
        }]}>{ ids.length }</Text>
      </View>
    </GameContainer>
  );
}

export function EndingView({ ids,highscore,setInGame,setMenu,setGameView }) {
  const {fgColor,bgColor,semiColor,semiShade} = getColors();
  const nunitoDefault = {
    color: semiColor
  };
  const infoBoxDefault = {
    backgroundColor: semiShade == "gray" ? "lightgray" : "gray"
  }
  const windowWidth = Dimensions.get("window").width;

  return (
    <GameContainer>
      <View style={{
        flex: 1,
        padding: 10,
        alignItems: "center",
        justifyContent: "center"
      }}>
        <View style={[styles.row,{
          justifyContent: "center"
        }]}>
          <Text style={[styles.nunitoBold,nunitoDefault,{
            fontSize: 45
          }]}>Well done!</Text>
        </View>
        <View style={styles.row}>
          <View style={[styles.infoBox,infoBoxDefault]}>
            <Text style={[styles.row,styles.nunitoBold,nunitoDefault,{
              fontSize: 45,
              paddingTop: 5,
              textAlign: "center"
            }]}>{ ids.length }</Text>
            <Text style={[styles.row,styles.nunito,nunitoDefault,{
              textAlign: "center"
            }]}>Last round score</Text>
          </View>
          <View style={[styles.infoBox,infoBoxDefault]}>
            <Text style={[styles.row,styles.nunitoBold,nunitoDefault,{
              fontSize: 45,
              paddingTop: 10,
              textAlign: "center"
            }]}>{ highscore }</Text>
            <Text style={[styles.row,styles.nunito,nunitoDefault,{
              textAlign: "center"
            }]}>All time high</Text>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.infoBox,infoBoxDefault]} onPress={() => {
            setInGame(false);
          }}>
            <Text style={[styles.nunito,nunitoDefault]}>Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.infoBox,infoBoxDefault]} onPress={() => {
            setGameView("ingame");
          }}>
            <Text style={[styles.nunito,nunitoDefault]} adjustsFontSizeToFit={true} numberOfLines={1}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.infoBox,infoBoxDefault]} onPress={() => {
            setMenu(2);
            setInGame(false);
          }}>
            <Text style={[styles.nunito,nunitoDefault]} adjustsFontSizeToFit={true} numberOfLines={1}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GameContainer>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%"
  },
  infoBox: {
    flex: 1,
    margin: 5,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15
  },
  nunito: {
    fontFamily: "Nunito_400Regular"
  },
  nunitoBold: {
    fontFamily: "Nunito_700Bold",
    fontSize: 25
  }
});