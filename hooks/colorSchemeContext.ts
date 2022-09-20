import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext } from "react";

export const ColorSchemeContext = React.createContext();

export const SCHEMES = [
  ["rgb(25,61,119)","white","black","gray"],
  ["rgb(144,179,237)","black","white","lightgray"],
  ["rgb(83,137,123)","white","black","gray"],
  ["rgb(241,163,145)","black","white","lightgray"],
  ["rgb(61,73,121)","white","black","gray"],
  ["rgb(211,178,254)","black","white","lightgray"],
  ["rgb(175,206,171)","black","white","lightgray"],
  ["rgb(73,44,167)","white","black","gray"],
  ["rgb(251,246,153)","black","white","lightgray"]
];

export function getColors(inverted) {
  const [scheme,setScheme] = useContext(ColorSchemeContext);
  return {
    fgColor: SCHEMES[scheme][! inverted ? 0 : 1],
    bgColor: SCHEMES[scheme][! inverted ? 1 : 0],
    semiColor: SCHEMES[scheme][2],
    semiShade: SCHEMES[scheme][3]
  };
}

export async function getInitColorScheme() {
  try {
    const jsonValue = await AsyncStorage.getItem("@colorscheme");
    return jsonValue ? JSON.parse(jsonValue).scheme : 0;
  } catch ( err ) {
    console.error(err);
  }
}

export async function updateInitColorScheme(value) {
  await AsyncStorage.setItem("@colorscheme",JSON.stringify({
    scheme: value
  }));
}