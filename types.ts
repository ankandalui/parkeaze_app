// Type 1 react native code

import { Href } from "expo-router";
import { Firestore, Timestamp } from "firebase/firestore";
import { Icon } from "phosphor-react-native";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  ImageStyle,
  PressableProps,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { Region } from "react-native-maps";

export type ScreenWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
};
export type ModalWrapperProps = {
  style?: ViewStyle;
  children: React.ReactNode;
  bg?: string;
};
export type accountOptionType = {
  title: string;
  icon: React.ReactNode;
  bgColor: string;
  routeName?: any;
};

export type TypoProps = {
  size?: number;
  color?: string;
  fontWeight?: TextStyle["fontWeight"];
  children: any | null;
  style?: TextStyle;
  textProps?: TextProps;
};

export type IconComponent = React.ComponentType<{
  height?: number;
  width?: number;
  strokeWidth?: number;
  color?: string;
  fill?: string;
}>;

export type IconProps = {
  name: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  fill?: string;
};

export type HeaderProps = {
  title?: string;
  style?: ViewStyle;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type BackButtonProps = {
  style?: ViewStyle;
  iconSize?: number;
};

export type TransactionType = {
  id?: string;
  type: string;
  amount: number;
  category?: string;
  date: Date | Timestamp | string;
  description?: string;
  image?: any;
  uid?: string;
  walletId: string;
};

export type CategoryType = {
  label: string;
  value: string;
  icon: Icon;
  bgColor: string;
};
export type ExpenseCategoriesType = {
  [key: string]: CategoryType;
};

export type TransactionListType = {
  data: TransactionType[];
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
};

export type TransactionItemProps = {
  item: TransactionType;
  index: number;
  handleClick: Function;
};

export interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  inputRef?: React.RefObject<TextInput>;
  //   label?: string;
  //   error?: string;
}

export interface CustomButtonProps extends TouchableOpacityProps {
  style?: ViewStyle;
  onPress?: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export type ImageUploadProps = {
  file?: any;
  onSelect: (file: any) => void;
  onClear: () => void;
  containerStyle?: ViewStyle;
  imageStyle?: ViewStyle;
  placeholder?: string;
};

export type UserType = {
  uid?: string;
  email?: string | null;
  name: string | null;
  image?: any;
} | null;

export type UserDataType = {
  name: string;
  image?: any;
};

export type AuthContextType = {
  user: UserType;
  setUser: Function;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; msg?: string }>;
  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; msg?: string }>;
  updateUserData: (userId: string) => Promise<void>;
};

export type ResponseType = {
  success: boolean;
  data?: any;
  msg?: string;
};

export interface FloorType {
  floorNumber: string;
  floorName: string;
  slots: SlotType[];
}

export interface SlotType {
  id: string;
  slotNumber: string;
}

export type WalletType = {
  id?: string;
  name: string;
  amount?: number;
  totalIncome?: number;
  totalExpenses?: number;
  image: any;
  uid?: string;
  created?: Date;
};
export interface RealTimeData {
  slots: { [key: string]: boolean };
  availableSpots: number;
}
export interface ParkingSlot {
  id: string;
  slotNumber: string;
}
export interface ParkingFloor {
  floorNumber: number;
  floorName: string;
  slots: ParkingSlot[];
}

export type ParkingSpotType = {
  id: string;
  locationName: string;
  parkingName: string;
  latitude: number;
  longitude: number;
  type: "public" | "private";
  price: number | null;
  totalSpots: number;
  availableSpots?: number;
  description?: string;
  features?: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  address: string;
  rating?: number;
  reviews?: number;
  floors: FloorType[];
  realTimeData?: RealTimeData;
};

export type ParkingSearchFilters = {
  type?: "public" | "private" | "all";
  maxPrice?: number;
  features?: string[];
  radius?: number;
  minAvailableSpots?: number;
};

export type CarType = "suv" | "sedan" | "coupe";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type BookingType = {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  carType: CarType;
  carName: string;
  carNumber: string;
  parkingSpotId: string;
  parkingSpotDetails: ParkingSpotType;
  slotId: string; // Added for slot tracking
  slotNumber: string; // Added for slot identification
  startTime: Date | any;
  endTime: Date | Timestamp;
  duration: number;
  timerStarted: boolean; // Duration in hours
  paymentTime?: Date | Timestamp;
  paymentMethod?: string;
  amount: number;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  createdAt?: any;
  updatedAt?: any;
  warningNotificationSent?: boolean;
};
export type BookingTypeDemo = {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  phoneNumber: string;
  carType: CarType;
  carName: string;
  carNumber: string;
  parkingSpotId: string;
  parkingSpotDetails: ParkingSpotType;
  parKingSpotName: string;
  slotId: string; // Added for slot tracking
  slotNumber: string; // Added for slot identification
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  duration: number;
  timerStarted: boolean; // Duration in hours
  paymentTime?: Date | Timestamp;
  paymentMethod?: string;
  amount: number;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  transactionId?: string;
  createdAt?: any;
  updatedAt?: any;
  status?: string;
  isActive?: boolean;
};

export type PaymentDetailsType = {
  bookingId: string;
  amount: number;
  parkingName: string;
  transactionId?: string;
  paymentTime?: Date | Timestamp;
  status: PaymentStatus;
  paymentMethod?: string;
};

export type BookingResponseType = {
  success: boolean;
  bookingId?: string;
  paymentDetails?: PaymentDetailsType;
  msg?: string;
};
export interface Place extends ParkingSpotType {
  isParkingSpot?: boolean;
  parkingData?: ParkingSpotType;
}
export type EmailAlertType = "warning" | "expired";

interface LatLng {
  latitude: number; // Note: React Native uses latitude/longitude instead of lat/lng
  longitude: number;
}

export interface ParkingFormData {
  locationName: string;
  parkingName: string;
  type: "public" | "private";
  totalSpots: string;
  price: string;
  address: string;
  openTime: string;
  closeTime: string;
  features: string;
  description: string;
  floors: FloorType[];
}
export interface VoiceInteractionProps {
  onSearchPlace: (location: string) => void;
  children: React.ReactNode;
}

export interface CustomMapRef {
  searchLocation: (location: string) => void;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface AnimationState {
  isVisible: boolean;
  message: string;
}

export interface LocationSearchResult {
  success: boolean;
  location?: Region;
  error?: string;
}

export interface Coordinates {
  [key: string]: [number, number];
}

export interface PathInfo {
  path: string[];
  distance: number;
}

export interface ApiResponse {
  nodes: string[];
  coordinates: Coordinates;
  image?: string;
  path?: string[];
  distance?: number;
  error?: string;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface NavigationStyles {
  safeArea: {
    flex: number;
    backgroundColor: string;
    paddingTop: number | undefined;
  };
  container: {
    flex: number;
    backgroundColor: string;
  };
  content: {
    padding: number;
  };
  error: {
    color: string;
    marginBottom: number;
    textAlign: string;
    fontSize: number;
  };
  [key: string]: any;
}
