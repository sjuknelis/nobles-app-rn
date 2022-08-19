import { FontAwesome } from '@expo/vector-icons';
import { useContext } from 'react';
import { LayoutAnimation, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View, Container, BigButton } from '../components/Themed';
import { ColorSchemeContext, getColors, updateInitColorScheme } from '../hooks/colorSchemeContext';
import { logOut, requestAPI } from '../hooks/requestAPI';

export default function SettingsScreen({ openMenu,setNavigator }) {
  const {fgColor,bgColor} = getColors();
  const [colorScheme,setColorSchemeInternal] = useContext(ColorSchemeContext);

  const setColorScheme = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateInitColorScheme(value);
    setColorSchemeInternal(value);
  };

  return (
    <Container title="SETTINGS" menuButton={{
      icon: "chevron-left",
      action: openMenu
    }} noContrastBG={true}>
      <View style={{
        backgroundColor: fgColor
      }}>
        <View style={styles.row}>
          <Text style={{
            color: "white",
            fontFamily: "EBGaramond_700Bold"
          }}>Appearance</Text>
        </View>
        <View style={[styles.row,{
          justifyContent: "space-evenly"
        }]}>
            <TouchableOpacity style={{
              width: 100,
              height: 100,
              backgroundColor: "rgb(25,61,119)",
              borderColor: "white",
              borderWidth: 5,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center"
            }} onPress={() => setColorScheme(0)}>
              { colorScheme == 0 ? <FontAwesome name="check" size={70} color="white" /> : null }
            </TouchableOpacity>
            <TouchableOpacity style={{
              width: 100,
              height: 100,
              backgroundColor: "black",
              borderColor: "rgb(144,179,237)",
              borderWidth: 5,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center"
            }} onPress={() => setColorScheme(1)}>
              { colorScheme == 1 ? <FontAwesome name="check" size={70} color="white" /> : null }
            </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={{
            color: "white",
            fontFamily: "EBGaramond_700Bold"
          }}>Account</Text>
        </View>
        <View style={styles.row}>
          <BigButton text="Log out (if you really have to)" inverted={true} onPress={async () => {
            await logOut();
            setNavigator("login");
          }} />
        </View>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    padding: 5
  }
});