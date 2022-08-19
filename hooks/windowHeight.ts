import { Dimensions, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function getWindowHeight() {
  const insets = useSafeAreaInsets();
  return Dimensions.get("window").height + (Platform.OS == "android" ? insets.top : 0);
}