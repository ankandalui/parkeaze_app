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

export type ParkingSpotType = {
  id: string;
  locationName: string;
  parkingName: string;
  latitude: number;
  longitude: number;
  type: "public" | "private";
  price: number | null;
  totalSpots: number;
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
};

export type ParkingSearchFilters = {
  type?: "public" | "private" | "all";
  maxPrice?: number;
  features?: string[];
  radius?: number;
};

export type CarType = "suv" | "sedan" | "coupe";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type BookingType = {
  id?: string;
  // User Details (from auth)
  userId: string;
  userName: string;
  userEmail: string;

  // Additional User Input
  phoneNumber: string;

  // Car Details
  carType: CarType;
  carName: string;
  carNumber: string;

  // Parking & Payment Details
  parkingSpotId: string;
  parkingSpotDetails: ParkingSpotType;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Optional fields for future use
  specialRequests?: string;
  cancellationReason?: string;
};

export type PaymentDetailsType = {
  bookingId: string;
  amount: number;
  parkingName: string;
  transactionId?: string; // Generated after successful payment
  paymentTime?: Timestamp;
  status: PaymentStatus;
};

export type BookingResponseType = ResponseType & {
  bookingId?: string;
  paymentDetails?: PaymentDetailsType;
};
export interface Place extends ParkingSpotType {
  isParkingSpot?: boolean;
  parkingData?: ParkingSpotType;
}

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
