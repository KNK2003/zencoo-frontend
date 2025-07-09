import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ResidentsStackParamList } from "../../navigation/ResidentsStack";
import styles from "../../styles/residentsStyles";
import api from "../../api/axiosInstance";
import { profilePic } from "../../constants/profileConstants";

const NAV_HEIGHT = 64;

type ResidentsRouteParams = {
  wing: { label: string; value: string };
};

type NavigationProp = NativeStackNavigationProp<
  ResidentsStackParamList,
  "ResidentsList"
>;

// 1. Define a Resident type
type Resident = {
  id: string;
  displayName: string;
  username: string;
  door: string;
  profilePic?: string;
};

const Residents = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { wing } = route.params as ResidentsRouteParams;

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  // 2. Use Resident[] for state
  const [residents, setResidents] = useState<Resident[]>([]);
  const insets = useSafeAreaInsets();

  // Load residents from local JSON (or future API)
  useEffect(() => {
    const loadResidents = async () => {
      try {
        const response = await api.get("/residents");
        setResidents(response.data);
      } catch (err) {
        console.error("Failed to load residents:", err);
      }
    };

    loadResidents();
  }, []);

  // 3. Type the filter callback and add alphabetical sorting
  const filteredResidents = residents
    .filter(
      (r) =>
        r.door &&
        r.door[0] === wing.value &&
        ((r.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.username || "").toLowerCase().includes(search.toLowerCase()) ||
          r.door.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      // Case-insensitive alphabetical sorting by displayName
      const nameA = (a.displayName || "").toLowerCase();
      const nameB = (b.displayName || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // Header height (56 is standard app bar height)
  const headerHeight = insets.top + 56;

  // @ts-ignore
  console.log("NAVIGATION STATE", navigation.getState && navigation.getState());
  // If you need the current route, use useRoute() as above.
  // console.log("CURRENT ROUTE", route);
  console.log("Loaded residents:", residents);
  console.log("Filtering for wing.value:", wing.value);

  return (
    <View style={styles.container}>
      {/* Full-width, full-top header with shadow */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: headerHeight },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            console.log(
              "CAN GO BACK?",
              navigation.canGoBack && navigation.canGoBack()
            );
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={28} color="#444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{wing.label}</Text>
      </View>
      {/* Main content, padded below header */}
      <View
        style={{
          flex: 1,
          paddingTop: headerHeight,
          paddingHorizontal: 16,
        }}
      >
        <>
          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchBar,
              { marginTop: 12 },
              searchFocused && styles.searchBarFocused,
            ]}
            placeholder="Search Resident"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#888"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {/* Residents List */}
          <FlatList
            data={filteredResidents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingBottom: insets.bottom + NAV_HEIGHT + 12,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("OthersProfile", { id: item.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.residentRow}>
                  <Image
                    source={
                      item.profilePic ? { uri: item.profilePic } : profilePic
                    }
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.displayName}</Text>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.subInfo}>
                      Wing {item.door ? item.door[0] : "?"} • Door {item.door}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.noResults}>No residents found.</Text>
            }
            showsVerticalScrollIndicator={false}
          />
        </>
      </View>
    </View>
  );
};

export default Residents;
