import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, RefreshControl, ScrollView } from "react-native";
import CustomMap, { CustomMapRef } from "@/components/CustomMap";

const Home: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const mapRef = useRef<CustomMapRef>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await mapRef.current?.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <CustomMap ref={mapRef} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Home;
