import { FontAwesome } from '@expo/vector-icons';
import { useContext } from 'react';
import { LayoutAnimation, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View, Container, BigButton } from '../components/Themed';
import { ColorSchemeContext, getColors, SCHEMES, updateInitColorScheme } from '../hooks/colorSchemeContext';
import { logOut, requestAPI } from '../hooks/requestAPI';

export default function SettingsScreen({ openMenu,setNavigator }) {
  const {fgColor,bgColor} = getColors();
  const [colorScheme,setColorSchemeInternal] = useContext(ColorSchemeContext);

  const setColorScheme = value => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateInitColorScheme(value);
    setColorSchemeInternal(value);
  };

  const rows = [];
  for ( let i = 0; i < SCHEMES.length; i += 3 ) {
    const cols = [];
    for ( let j = 0; j < 3; j++ ) {
      cols.push((
        <ColorSchemeButton key={j} bgColor={SCHEMES[i + j][0]} fgColor={SCHEMES[i + j][1]} onPress={_ => setColorScheme(i + j)} checked={colorScheme == i + j} />
      ));
    }
    rows.push((
      <View key={i} style={[styles.row,{
        justifyContent: "space-evenly"
      }]}>
        { cols }
      </View>
    ));
  }

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
            color: bgColor,
            fontFamily: "EBGaramond_700Bold"
          }}>Appearance</Text>
        </View>
        { rows }
        <View style={styles.row}>
          <Text style={{
            color: bgColor,
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

function ColorSchemeButton({ bgColor,fgColor,onPress,checked }) {
  return (
    <TouchableOpacity style={{
      width: 100,
      height: 100,
      backgroundColor: bgColor,
      borderColor: fgColor,
      borderWidth: 5,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center"
    }} onPress={onPress}>
      { checked ? <FontAwesome name="check" size={70} color={fgColor} /> : null }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    padding: 5
  }
});