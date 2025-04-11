import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
  Modal,
  Platform,
  Text,
  Animated,
} from "react-native";
import { WebView } from "react-native-webview";
import CustomMap, { CustomMapRef } from "@/components/CustomMap";
import * as Notifications from "expo-notifications";
import { MessageCircle, X } from "lucide-react-native";

const BOTPRESS_URL =
  "https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/02/19/22/20250219221658-H8BJXDMR.json";

const Home: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(true);
  const mapRef = useRef<CustomMapRef>(null);
  const webViewRef = useRef<WebView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await mapRef.current?.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Set up notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.MAX,
      }),
    });

    // Auto-hide message after 10 seconds
    const messageTimer = setTimeout(() => {
      fadeOutMessage();
    }, 10000);

    return () => clearTimeout(messageTimer);
  }, []);

  const fadeOutMessage = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setMessageVisible(false);
    });
  };

  const toggleChat = () => {
    setChatVisible(!chatVisible);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CustomMap ref={mapRef} />
      </ScrollView>

      {/* Floating Message */}
      {messageVisible && (
        <Animated.View style={[styles.floatingMessage, { opacity: fadeAnim }]}>
          <Text style={styles.messageText}>Hii sir need help?</Text>
          <TouchableOpacity
            style={styles.messageCloseButton}
            onPress={fadeOutMessage}
          >
            <X size={14} color="#555555" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Chat Icon Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={toggleChat}
        activeOpacity={0.7}
      >
        <MessageCircle size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Botpress Chat Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setChatVisible(false)}
              >
                <View style={styles.closeButtonInner}>
                  <View
                    style={[styles.closeButtonLine, styles.closeButtonLineLeft]}
                  />
                  <View
                    style={[
                      styles.closeButtonLine,
                      styles.closeButtonLineRight,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>
            <WebView
              ref={webViewRef}
              source={{ uri: BOTPRESS_URL }}
              style={styles.webView}
              originWhitelist={["*"]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scalesPageToFit={true}
              mixedContentMode="always"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              userAgent={
                Platform.OS === "android"
                  ? "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
                  : "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  floatingMessage: {
    position: "absolute",
    right: 20,
    bottom: 95,
    backgroundColor: "#FFFFFF",
    padding: 8,
    paddingRight: 24,
    borderRadius: 15,
    maxWidth: 150,
    minWidth: 120,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },
  messageCloseButton: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chatButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "85%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    height: 50,
    backgroundColor: "#F8F8F8",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonInner: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonLine: {
    position: "absolute",
    width: 20,
    height: 2,
    backgroundColor: "#555",
    borderRadius: 1,
  },
  closeButtonLineLeft: {
    transform: [{ rotate: "45deg" }],
  },
  closeButtonLineRight: {
    transform: [{ rotate: "-45deg" }],
  },
  webView: {
    flex: 1,
    backgroundColor: "#FFF",
  },
});

export default Home;
