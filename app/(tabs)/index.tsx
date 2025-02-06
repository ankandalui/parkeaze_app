import React, { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import CustomMap from "@/components/CustomMap";

import { CustomMapRef } from "@/types";

const Home: React.FC = () => {
  // const mapRef = useRef<CustomMapRef>(null);

  // const handleVoiceSearch = useCallback((location: string) => {
  //   if (mapRef.current) {
  //     mapRef.current.searchLocation(location);
  //   }
  // }, []);

  return <CustomMap />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Home;
