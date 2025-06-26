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
  displayName: string; // Human-friendly name
  username: string; // Unique handle
  wing: string;
  door: string;
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
        // Local JSON import
        const data = require("../../data/residents.json");
        setResidents(data);

        // === For future API ===
        // const response = await fetch('https://your-backend.com/api/residents');
        // const data = await response.json();
        // setResidents(data);
      } catch (err) {
        console.error("Failed to load residents:", err);
      }
    };

    loadResidents();
  }, []);

  // 3. Type the filter callback
  const filteredResidents = residents.filter(
    (r) =>
      r.wing === wing.value &&
      (r.displayName.toLowerCase().includes(search.toLowerCase()) ||
        r.username.toLowerCase().includes(search.toLowerCase()) ||
        r.wing.toLowerCase().includes(search.toLowerCase()) ||
        r.door.toLowerCase().includes(search.toLowerCase()))
  );

  // Header height (56 is standard app bar height)
  const headerHeight = insets.top + 56;

  // @ts-ignore
  console.log("NAVIGATION STATE", navigation.getState && navigation.getState());
  // If you need the current route, use useRoute() as above.
  // console.log("CURRENT ROUTE", route);

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
                  navigation.push("OthersProfile", {
                    id: item.id,
                    displayName: item.displayName,
                    username: item.username,
                    wing: item.wing,
                    door: item.door,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.residentRow}>
                  <Image
                    source={require("../../../assets/images/profile-placeholder.jpg")}
                    style={styles.avatar}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.displayName}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                    <Text style={styles.subInfo}>
                      Wing {item.wing} • Door {item.door}
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
