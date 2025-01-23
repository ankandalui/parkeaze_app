import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";

const index = () => {
  // const router = useRouter();
  // useEffect(() => {
  //   setTimeout(() => {
  //     router.push("/welcome");
  //   }, 200);
  // });
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require("../assets/images/splash.png")}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: "30%",
    aspectRatio: 1,
  },
});
