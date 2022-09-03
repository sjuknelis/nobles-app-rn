import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View } from "../components/Themed";
import { getCreds, requestAPI } from "../hooks/requestAPI";
import { getWindowHeight } from "../hooks/windowHeight";

function GameContainer({ children,innerChildren }) {
  const windowHeight = getWindowHeight();
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      height: windowHeight,
      backgroundColor: "white",
      zIndex: 10,
      paddingTop: insets.top,
      transform: [
        {translateY: -insets.top}
      ]
    }}>
      <View style={{
        flex: 1,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: Platform.OS == "ios" ? 15 : 0,
        borderBottomRightRadius: Platform.OS == "ios" ? 15 : 0,
        marginTop: 10,
        backgroundColor: "white"
      }}>
        { children }
      </View>
      { innerChildren }
    </View>
  );
}

export function InGameView({ directory,setIDs,setInGame,setGameView }) {
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = getWindowHeight();

  const [correctIDs,setCorrectIDs] = useState([]);

  const [rawTimer,setRawTimer] = useState(6000);
  const [timerAdj,setTimerAdj] = useState(0);
  const [barColor,setBarColor] = useState("black");
  useEffect(() => {
    if ( directory ) {
      generateNewQuestion(directory);
      const endTime = new Date().getTime() + 20000;
      setInterval(() => {
        setRawTimer((endTime - new Date().getTime()) / 10);
      },10);
    }
  },[directory]);
  useEffect(() => {
    if ( rawTimer - timerAdj <= 0 ) {
      setIDs(correctIDs);
      setGameView("flying",correctIDs.length);
    }
  },[rawTimer,timerAdj]);

  const [choices,setChoices] = useState([]);
  const [correctIndex,setCorrectIndex] = useState(0);
  const generateNewQuestion = directoryInUse => {
    const selectedIndices = [];
    for ( let i = 0; i < 4; i++ ){
      let index;
      do {
        index = Math.floor(Math.random() * directoryInUse.length);
      } while ( selectedIndices.indexOf(index) > -1 );
      selectedIndices.push(index);
    }
    setChoices(selectedIndices.map(index => directoryInUse[index]));
    setCorrectIndex(Math.floor(Math.random() * 4));
  };

  const [score,setScore] = useState(0);
  const [barResetTimeout,setBarResetTimeout] = useState(-1);
  const choicesItems = choices.map((item,index) => (
    <View key={item.name} style={styles.row}>
      <TouchableOpacity style={[styles.row,{
        borderWidth: 1,
        borderColor: "black",
        padding: 7,
        marginTop: 12,
        marginLeft: 15,
        width: windowWidth - 30,
        borderRadius: 10,
        justifyContent: "center"
      }]} onPress={() => {
        if ( index == correctIndex ) {
          setBarColor("green");
          setScore(score + 1);
          setCorrectIDs(correctIDs.concat([choices[index].pno]));
        } else {
          setBarColor("red");
          setTimerAdj(timerAdj + 200);
        }
        if ( barResetTimeout != -1 ) clearInterval(barResetTimeout);
        setBarResetTimeout(setTimeout(() => {
          setBarColor("black");
        },2000));
        generateNewQuestion(directory);
      }}>
        <Text style={styles.nunito}>{ item.name }</Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <GameContainer>
      <View style={[styles.row,{
        paddingBottom: 15
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
          }]}>{ ((rawTimer - timerAdj) / 100).toFixed(2) }</Text>
        </View>
        <View style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Text style={[styles.nunitoBold,{
            color: barColor
          }]}>{ score }</Text>
        </View>
      </View>
      <Image
        style={{
          width: "100%",
          aspectRatio: 640 / 800
        }}
        source={{
          uri: choices.length > 0 ? `https://nobilis.nobles.edu/images_sitewide/photos/${choices[correctIndex].pno}.jpeg` : ""
        }}
      />
      { choicesItems }
    </GameContainer>
  );
}

export function FlyingView({ ids,setGameView }) {
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
          fontSize: 45
        }]}>{ ids.length }</Text>
      </View>
    </GameContainer>
  );
}

export function EndingView({ setInGame,setMenu,setGameView }) {
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
          <Text style={[styles.nunitoBold,{
            fontSize: 45,
          }]}>Well done!</Text>
        </View>
        <View style={styles.row}>
          <View style={styles.infoBox}>
            <Text style={[styles.row,styles.nunitoBold,{
              fontSize: 45,
              paddingTop: 5,
              textAlign: "center"
            }]}>9</Text>
            <Text style={[styles.row,styles.nunito,{
              textAlign: "center"
            }]}>Last round score</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={[styles.row,styles.nunitoBold,{
              fontSize: 45,
              paddingTop: 10,
              textAlign: "center"
            }]}>9</Text>
            <Text style={[styles.row,styles.nunito,{
              textAlign: "center"
            }]}>Last round score</Text>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.infoBox} onPress={() => {
            setInGame(false);
          }}>
            <Text style={styles.nunito}>Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoBox} onPress={() => {
            setGameView("ingame");
          }}>
            <Text style={styles.nunito}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoBox} onPress={() => {
            setMenu(2);
            setInGame(false);
          }}>
            <Text style={styles.nunito} adjustsFontSizeToFit={true} numberOfLines={1}>Leaderboard</Text>
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
    backgroundColor: "lightgray",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15
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