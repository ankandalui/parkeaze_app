// // import {
// //   StyleSheet,
// //   View,
// //   TouchableOpacity,
// //   ScrollView,
// //   Dimensions,
// // } from "react-native";
// // import React, { useState } from "react";
// // import ScreenWrapper from "@/components/ScreenWrapper";
// // import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// // import { scale, verticalScale } from "@/utils/styling";
// // import Typo from "@/components/Typo";
// // import Animated, { FadeInDown } from "react-native-reanimated";
// // import * as Icons from "phosphor-react-native";
// // import { ParkingSpotType } from "@/types";
// // import { useRouter } from "expo-router";

// // const NearBy = () => {
// //   const router = useRouter();

// //   const [activeFilter, setActiveFilter] = useState<
// //     "all" | "public" | "private"
// //   >("all");

// //   // Mock data - replace with actual data from your backend
// //   const parkingSpots: ParkingSpotType[] = [
// //     {
// //       id: "1",
// //       name: "Central Public Parking",
// //       latitude: 37.7849,
// //       longitude: -122.4294,
// //       type: "public",
// //       available: true,
// //       totalSpots: 150,
// //       availableSpots: 45,
// //       address: "123 Main Street, San Francisco",
// //       operatingHours: {
// //         open: "00:00",
// //         close: "23:59",
// //       },
// //     },
// //     {
// //       id: "2",
// //       name: "Premium Parking Garage",
// //       latitude: 37.7835,
// //       longitude: -122.4314,
// //       type: "private",
// //       price: 5.99,
// //       available: true,
// //       totalSpots: 80,
// //       availableSpots: 12,
// //       address: "456 Market Street, San Francisco",
// //       operatingHours: {
// //         open: "06:00",
// //         close: "22:00",
// //       },
// //       rating: 4.5,
// //       reviews: 128,
// //     },
// //   ];

// //   const handleBooking = (parking: ParkingSpotType) => {
// //     router.push({
// //       pathname: "/(modals)/bookingModal",
// //       params: {
// //         parkingData: JSON.stringify(parking), // Pass the selected parking spot data
// //       },
// //     });
// //   };

// //   const filteredParkingSpots = parkingSpots.filter(
// //     (spot) => activeFilter === "all" || spot.type === activeFilter
// //   );

// //   const renderParkingCard = (parking: ParkingSpotType) => (
// //     <Animated.View
// //       entering={FadeInDown}
// //       key={parking.id}
// //       style={styles.parkingCard}
// //     >
// //       <View style={styles.parkingCardContent}>
// //         <View style={styles.parkingHeader}>
// //           <View style={styles.parkingMainInfo}>
// //             <Typo size={18} color={colors.neutral800} fontWeight="600">
// //               {parking.name}
// //             </Typo>
// //             <View
// //               style={[
// //                 styles.parkingType,
// //                 {
// //                   backgroundColor:
// //                     parking.type === "public" ? colors.green : colors.primary,
// //                 },
// //               ]}
// //             >
// //               <Typo size={12} color={colors.white} fontWeight="600">
// //                 {parking.type.toUpperCase()}
// //               </Typo>
// //             </View>
// //           </View>
// //           <Typo size={14} color={colors.neutral500} style={styles.address}>
// //             {parking.address}
// //           </Typo>
// //         </View>

// //         <View style={styles.parkingDetails}>
// //           <View style={styles.detailRow}>
// //             <View style={styles.detailItem}>
// //               <Icons.Clock size={20} color={colors.primary} />
// //               <Typo size={14} color={colors.neutral600}>
// //                 {parking.operatingHours.open} - {parking.operatingHours.close}
// //               </Typo>
// //             </View>
// //             <View style={styles.detailItem}>
// //               <Icons.CarSimple size={20} color={colors.primary} />
// //               <Typo size={14} color={colors.neutral600}>
// //                 {parking.availableSpots}/{parking.totalSpots} spots
// //               </Typo>
// //             </View>
// //           </View>

// //           <View style={styles.detailRow}>
// //             {parking.type === "private" && parking.price && (
// //               <View style={styles.detailItem}>
// //                 <Icons.CurrencyDollar size={20} color={colors.primary} />
// //                 <Typo size={14} color={colors.neutral600}>
// //                   ${parking.price}/hr
// //                 </Typo>
// //               </View>
// //             )}
// //             {parking.rating && (
// //               <View style={styles.detailItem}>
// //                 <Icons.Star size={20} color={colors.primary} />
// //                 <Typo size={14} color={colors.neutral600}>
// //                   {parking.rating} ({parking.reviews} reviews)
// //                 </Typo>
// //               </View>
// //             )}
// //           </View>
// //         </View>

// //         {parking.type === "private" && (
// //           <TouchableOpacity
// //             onPress={() => handleBooking(parking)}
// //             style={styles.bookButton}
// //           >
// //             <Typo size={16} color={colors.white} fontWeight="600">
// //               Book Now
// //             </Typo>
// //           </TouchableOpacity>
// //         )}
// //       </View>
// //     </Animated.View>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.filterContainer}>
// //         {(["all", "public", "private"] as const).map((filter) => (
// //           <TouchableOpacity
// //             key={filter}
// //             style={[
// //               styles.filterButton,
// //               activeFilter === filter && styles.activeFilterButton,
// //             ]}
// //             onPress={() => setActiveFilter(filter)}
// //           >
// //             <Typo
// //               size={14}
// //               color={activeFilter === filter ? colors.white : colors.neutral600}
// //               fontWeight="600"
// //             >
// //               {filter.charAt(0).toUpperCase() + filter.slice(1)}
// //             </Typo>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       <ScrollView
// //         style={styles.parkingList}
// //         contentContainerStyle={styles.parkingListContent}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {filteredParkingSpots.map(renderParkingCard)}
// //       </ScrollView>
// //     </View>
// //   );
// // };

// // export default NearBy;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: colors.white,
// //   },
// //   filterContainer: {
// //     flexDirection: "row",
// //     padding: spacingX._15,
// //     gap: spacingX._10,
// //   },
// //   filterButton: {
// //     paddingVertical: spacingY._10,
// //     paddingHorizontal: spacingX._20,
// //     borderRadius: radius._10,
// //     backgroundColor: colors.neutral100,
// //   },
// //   activeFilterButton: {
// //     backgroundColor: colors.primary,
// //   },
// //   parkingList: {
// //     flex: 1,
// //   },
// //   parkingListContent: {
// //     padding: spacingX._15,
// //     gap: spacingY._15,
// //   },
// //   parkingCard: {
// //     backgroundColor: colors.white,
// //     borderRadius: radius._12,
// //     shadowColor: colors.black,
// //     shadowOffset: {
// //       width: 0,
// //       height: 2,
// //     },
// //     shadowOpacity: 0.1,
// //     shadowRadius: 4,
// //     elevation: 3,
// //   },
// //   parkingCardContent: {
// //     padding: spacingX._15,
// //   },
// //   parkingHeader: {
// //     marginBottom: spacingY._10,
// //   },
// //   parkingMainInfo: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   address: {
// //     marginTop: spacingY._5,
// //   },
// //   parkingDetails: {
// //     gap: spacingY._10,
// //   },
// //   detailRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   detailItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: spacingX._5,
// //   },
// //   parkingType: {
// //     paddingHorizontal: spacingX._10,
// //     paddingVertical: spacingY._5,
// //     borderRadius: radius._6,
// //   },
// //   bookButton: {
// //     backgroundColor: colors.primary,
// //     padding: spacingY._12,
// //     borderRadius: radius._10,
// //     alignItems: "center",
// //     marginTop: spacingY._15,
// //   },
// // });

// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { collection, query, onSnapshot, where } from "firebase/firestore";
// import { firestore } from "@/config/firebase";
// import { colors, radius, spacingX, spacingY } from "@/constants/theme";
// import Typo from "@/components/Typo";
// import Animated, { FadeInDown } from "react-native-reanimated";
// import * as Icons from "phosphor-react-native";
// import { ParkingSpotType } from "@/types";
// import { useRouter, useLocalSearchParams } from "expo-router";

// const NearBy = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const [spots, setSpots] = useState<ParkingSpotType[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState<
//     "all" | "public" | "private"
//   >("all");

//   useEffect(() => {
//     const fetchParkingSpots = async () => {
//       try {
//         const spotsRef = collection(firestore, "parking_spots");
//         let parkingQuery = query(spotsRef);

//         // Add filter if not "all"
//         if (activeFilter !== "all") {
//           parkingQuery = query(spotsRef, where("type", "==", activeFilter));
//         }

//         // Set up real-time listener
//         const unsubscribe = onSnapshot(
//           parkingQuery,
//           (snapshot) => {
//             const parkingSpots: ParkingSpotType[] = [];
//             snapshot.forEach((doc) => {
//               const spot = {
//                 id: doc.id,
//                 ...doc.data(),
//               } as ParkingSpotType;

//               // If location params exist, filter by distance
//               if (params.latitude && params.longitude) {
//                 const distance = calculateDistance(
//                   parseFloat(params.latitude as string),
//                   parseFloat(params.longitude as string),
//                   spot.latitude,
//                   spot.longitude
//                 );
//                 // Only include spots within 5km radius
//                 if (distance <= 5) {
//                   parkingSpots.push(spot);
//                 }
//               } else {
//                 parkingSpots.push(spot);
//               }
//             });
//             setSpots(parkingSpots);
//             setLoading(false);
//           },
//           (error) => {
//             console.error("Error fetching parking spots:", error);
//             Alert.alert("Error", "Failed to load parking spots");
//             setLoading(false);
//           }
//         );

//         return () => unsubscribe();
//       } catch (error) {
//         console.error("Error setting up parking spots listener:", error);
//         Alert.alert("Error", "Failed to load parking spots");
//         setLoading(false);
//       }
//     };

//     fetchParkingSpots();
//   }, [activeFilter, params.latitude, params.longitude]);

//   const calculateDistance = (
//     lat1: number,
//     lon1: number,
//     lat2: number,
//     lon2: number
//   ) => {
//     const R = 6371; // Radius of the earth in km
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//         Math.cos(deg2rad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const d = R * c; // Distance in km
//     return d;
//   };

//   const deg2rad = (deg: number) => {
//     return deg * (Math.PI / 180);
//   };

//   // const handleBooking = (parking: ParkingSpotType) => {
//   //   router.push({
//   //     pathname: "/(modals)/slotBookingModal",
//   //     params: {
//   //       parkingData: JSON.stringify(parking),
//   //     },
//   //   });
//   // };
//   // const handleBooking = () => {

//   // }

//   const renderParkingCard = (parking: ParkingSpotType) => (
//     <Animated.View
//       entering={FadeInDown}
//       key={parking.id}
//       style={styles.parkingCard}
//     >
//       <View style={styles.parkingCardContent}>
//         <View style={styles.parkingHeader}>
//           <View style={styles.parkingMainInfo}>
//             <Typo size={18} color={colors.neutral800} fontWeight="600">
//               {parking.parkingName}
//             </Typo>
//             <View
//               style={[
//                 styles.parkingType,
//                 {
//                   backgroundColor:
//                     parking.type === "public" ? colors.green : colors.primary,
//                 },
//               ]}
//             >
//               <Typo size={12} color={colors.white} fontWeight="600">
//                 {parking.type.toUpperCase()}
//               </Typo>
//             </View>
//           </View>
//           <Typo size={14} color={colors.neutral500} style={styles.address}>
//             {parking.address}
//           </Typo>
//         </View>

//         <View style={styles.parkingDetails}>
//           <View style={styles.detailRow}>
//             <View style={styles.detailItem}>
//               <Icons.Clock size={20} color={colors.primary} />
//               <Typo size={14} color={colors.neutral600}>
//                 {parking.operatingHours.open} - {parking.operatingHours.close}
//               </Typo>
//             </View>
//             <View style={styles.detailItem}>
//               <Icons.CarSimple size={20} color={colors.primary} />
//               {/* <Typo size={14} color={colors.neutral600}>
//                 {parking.availableSpots}/{parking.totalSpots} spots
//               </Typo> */}
//             </View>
//           </View>

//           <View style={styles.detailRow}>
//             {parking.type === "private" && parking.price && (
//               <View style={styles.detailItem}>
//                 <Icons.CurrencyDollar size={20} color={colors.primary} />
//                 <Typo size={14} color={colors.neutral600}>
//                   ${parking.price}/hr
//                 </Typo>
//               </View>
//             )}
//             {parking.rating && (
//               <View style={styles.detailItem}>
//                 <Icons.Star size={20} color={colors.primary} />
//                 <Typo size={14} color={colors.neutral600}>
//                   {parking.rating} ({parking.reviews} reviews)
//                 </Typo>
//               </View>
//             )}
//           </View>
//         </View>

//         {parking.type === "private" && (
//           <TouchableOpacity
//             // onPress={() => handleBooking(parking)}
//             onPress={() => router.push("/(modals)/slotBookingModal")}
//             style={styles.bookButton}
//           >
//             <Typo size={16} color={colors.white} fontWeight="600">
//               Book Now
//             </Typo>
//           </TouchableOpacity>
//         )}
//       </View>
//     </Animated.View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.filterContainer}>
//         {(["all", "public", "private"] as const).map((filter) => (
//           <TouchableOpacity
//             key={filter}
//             style={[
//               styles.filterButton,
//               activeFilter === filter && styles.activeFilterButton,
//             ]}
//             onPress={() => setActiveFilter(filter)}
//           >
//             <Typo
//               size={14}
//               color={activeFilter === filter ? colors.white : colors.neutral600}
//               fontWeight="600"
//             >
//               {filter.charAt(0).toUpperCase() + filter.slice(1)}
//             </Typo>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {loading ? (
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       ) : spots.length === 0 ? (
//         <View style={styles.centerContainer}>
//           <Typo size={16} color={colors.neutral800}>
//             No parking spots found nearby
//           </Typo>
//         </View>
//       ) : (
//         <ScrollView
//           style={styles.parkingList}
//           contentContainerStyle={styles.parkingListContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {spots.map(renderParkingCard)}
//         </ScrollView>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.white,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   filterContainer: {
//     flexDirection: "row",
//     padding: spacingX._15,
//     gap: spacingX._10,
//   },
//   filterButton: {
//     paddingVertical: spacingY._10,
//     paddingHorizontal: spacingX._20,
//     borderRadius: radius._10,
//     backgroundColor: colors.neutral100,
//   },
//   activeFilterButton: {
//     backgroundColor: colors.primary,
//   },
//   parkingList: {
//     flex: 1,
//   },
//   parkingListContent: {
//     padding: spacingX._15,
//     gap: spacingY._15,
//   },
//   parkingCard: {
//     backgroundColor: colors.white,
//     borderRadius: radius._12,
//     shadowColor: colors.black,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   parkingCardContent: {
//     padding: spacingX._15,
//   },
//   parkingHeader: {
//     marginBottom: spacingY._10,
//   },
//   parkingMainInfo: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   address: {
//     marginTop: spacingY._5,
//   },
//   parkingDetails: {
//     gap: spacingY._10,
//   },
//   detailRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   detailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: spacingX._5,
//   },
//   parkingType: {
//     paddingHorizontal: spacingX._10,
//     paddingVertical: spacingY._5,
//     borderRadius: radius._6,
//   },
//   bookButton: {
//     backgroundColor: colors.primary,
//     padding: spacingY._12,
//     borderRadius: radius._10,
//     alignItems: "center",
//     marginTop: spacingY._15,
//   },
// });

// export default NearBy;

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { collection, query, onSnapshot } from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/Typo";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Icons from "phosphor-react-native";
import { ParkingSpotType } from "@/types";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";

const FILTER_TYPES = ["all", "public", "private"] as const;
type FilterType = (typeof FILTER_TYPES)[number];

const NearBy = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [spots, setSpots] = useState<ParkingSpotType[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission denied",
            "Please enable location services to find nearby parking spots"
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    if (!params.latitude || !params.longitude) {
      getUserLocation();
    } else {
      setUserLocation({
        latitude: parseFloat(params.latitude as string),
        longitude: parseFloat(params.longitude as string),
      });
    }
  }, [params.latitude, params.longitude]);

  useEffect(() => {
    const spotsRef = collection(firestore, "parking_spots");
    const unsubscribe = onSnapshot(
      query(spotsRef),
      (snapshot) => {
        const parkingSpots: ParkingSpotType[] = [];
        snapshot.forEach((doc) => {
          parkingSpots.push({ id: doc.id, ...doc.data() } as ParkingSpotType);
        });
        setSpots(parkingSpots);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching parking spots:", error);
        Alert.alert("Error", "Failed to load parking spots");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (spots.length > 0 && userLocation) {
      const filtered = spots.filter((spot) => {
        // First filter by type
        if (activeFilter !== "all" && spot.type !== activeFilter) {
          return false;
        }

        // Then filter by distance (5km radius)
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          spot.latitude,
          spot.longitude
        );
        return distance <= 5; // 5km radius
      });

      // Sort by distance
      const sortedSpots = filtered.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.latitude,
          a.longitude
        );
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude,
          b.longitude
        );
        return distanceA - distanceB;
      });

      setFilteredSpots(sortedSpots);
    }
  }, [spots, activeFilter, userLocation]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const renderParkingCard = (spot: ParkingSpotType) => {
    const distance = userLocation
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          spot.latitude,
          spot.longitude
        )
      : null;

    return (
      <Animated.View
        entering={FadeInDown}
        key={spot.id}
        style={styles.parkingCard}
      >
        <View style={styles.parkingCardContent}>
          <View style={styles.parkingHeader}>
            <View style={styles.parkingMainInfo}>
              <Typo size={18} color={colors.neutral800} fontWeight="600">
                {spot.parkingName}
              </Typo>
              <View
                style={[
                  styles.parkingType,
                  {
                    backgroundColor:
                      spot.type === "public" ? colors.green : colors.primary,
                  },
                ]}
              >
                <Typo size={12} color={colors.white} fontWeight="600">
                  {spot.type.toUpperCase()}
                </Typo>
              </View>
            </View>
            <Typo size={14} color={colors.neutral500} style={styles.address}>
              {spot.address}
            </Typo>
          </View>

          <View style={styles.parkingDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Icons.Clock size={20} color={colors.primary} />
                <Typo size={14} color={colors.neutral600}>
                  {spot.operatingHours.open} - {spot.operatingHours.close}
                </Typo>
              </View>
              <View style={styles.detailItem}>
                <Icons.CarSimple size={20} color={colors.primary} />
                <Typo size={14} color={colors.neutral600}>
                  {spot.totalSpots} spots
                </Typo>
              </View>
            </View>

            <View style={styles.detailRow}>
              {distance !== null && (
                <View style={styles.detailItem}>
                  <Icons.MapPin size={20} color={colors.primary} />
                  <Typo size={14} color={colors.neutral600}>
                    {distance < 1
                      ? `${(distance * 1000).toFixed(0)}m`
                      : `${distance.toFixed(1)}km`}
                  </Typo>
                </View>
              )}
              {spot.type === "private" && spot.price !== null && (
                <View style={styles.detailItem}>
                  <Icons.CurrencyDollar size={20} color={colors.primary} />
                  <Typo size={14} color={colors.neutral600}>
                    ${spot.price}/hr
                  </Typo>
                </View>
              )}
            </View>

            {spot.features && spot.features.length > 0 && (
              <View style={styles.features}>
                {spot.features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Typo size={12} color={colors.neutral600}>
                      {feature}
                    </Typo>
                  </View>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(modals)/slotBookingModal",
                params: {
                  parkingData: JSON.stringify(spot),
                },
              })
            }
            style={styles.bookButton}
          >
            <Typo size={16} color={colors.white} fontWeight="600">
              Book Now
            </Typo>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {FILTER_TYPES.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Typo
              size={14}
              color={activeFilter === filter ? colors.white : colors.neutral600}
              fontWeight="600"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Typo>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredSpots.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icons.Car size={48} color={colors.neutral400} />
          <Typo size={16} color={colors.neutral800} style={styles.noSpotsText}>
            No parking spots found nearby
          </Typo>
          <Typo size={14} color={colors.neutral500}>
            Try changing the filter or searching in a different area
          </Typo>
        </View>
      ) : (
        <ScrollView
          style={styles.parkingList}
          contentContainerStyle={styles.parkingListContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredSpots.map(renderParkingCard)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noSpotsText: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: "row",
    padding: spacingX._15,
    gap: spacingX._10,
  },
  filterButton: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius._10,
    backgroundColor: colors.neutral100,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  parkingList: {
    flex: 1,
  },
  parkingListContent: {
    padding: spacingX._15,
    gap: spacingY._15,
  },
  parkingCard: {
    backgroundColor: colors.white,
    borderRadius: radius._12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parkingCardContent: {
    padding: spacingX._15,
  },
  parkingHeader: {
    marginBottom: spacingY._10,
  },
  parkingMainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  address: {
    marginTop: spacingY._5,
  },
  parkingDetails: {
    gap: spacingY._12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  parkingType: {
    paddingHorizontal: spacingX._10,
    paddingVertical: spacingY._5,
    borderRadius: radius._6,
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  featureTag: {
    backgroundColor: colors.neutral100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bookButton: {
    backgroundColor: colors.primary,
    padding: spacingY._12,
    borderRadius: radius._10,
    alignItems: "center",
    marginTop: spacingY._15,
  },
});

export default NearBy;
