import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import styles from "../styles/ordersStyles";
import PlacedOrderCard from "../components/PlacedOrderCard";
import ReceivedOrderCard from "../components/RecievedOrderCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChecklistIcon from "../../assets/icons/list.svg";

// Status badge colors (keep if needed)
const statusColors: Record<string, string> = {
  Pending: "#FFD700",
  Accepted: "#4CAF50",
  Rejected: "#F44336",
  Delivered: "#2196F3",
};

const imageMap: Record<string, any> = {
  "veggies (2).jpg": require("../../assets/images/veggies (2).jpg"),
  "dates.jpg": require("../../assets/images/dates.jpg"),
  "pulses.jpg": require("../../assets/images/pulses.jpg"),
  // Add all your images here
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState<"placed" | "received">("placed");
  const [placed, setPlaced] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const insets = useSafeAreaInsets();

  // Load orders from JSON (or future API)
  useEffect(() => {
    const loadOrders = async () => {
      try {
        // Local JSON import
        const placedData = require("../data/placedOrders.json");
        const receivedData = require("../data/recievedOrders.json");
        // If you use a backend, replace with fetch:
        // const placedData = await fetch('https://your-backend.com/api/placedOrders').then(res => res.json());
        // const receivedData = await fetch('https://your-backend.com/api/recievedOrders').then(res => res.json());
        setPlaced(placedData);
        setReceived(receivedData);
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    };
    loadOrders();
  }, []);

  // Cancel handler for placed orders
  const handleCancelOrder = (orderId: string) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          setPlaced((prev) => prev.filter((order) => order.id !== orderId));
        },
      },
    ]);
  };

  // PlacedOrdersRoute component
  const PlacedOrdersRoute = () => {
    const sortedPlacedOrders = [...placed].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
    );
    const handleSellerPress = () => {};
    return (
      <FlatList
        data={sortedPlacedOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlacedOrderCard
            order={{ ...item, productImage: imageMap[item.productImage] }}
            onSellerPress={handleSellerPress}
            onCancel={
              item.status === "Pending"
                ? () => handleCancelOrder(item.id)
                : undefined
            }
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(80, insets.bottom + 48) },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No placed orders.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  // ReceivedOrdersRoute component
  const ReceivedOrdersRoute = () => {
    const [orders, setOrders] = useState<any[]>(received);

    // Keep orders in sync with parent state
    useEffect(() => {
      setOrders(received);
    }, [received]);

    const handleCustomerPress = () => {};
    const updateOrderStatus = (orderId: string, newStatus: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    };
    const handleAccept = (orderId: string) =>
      updateOrderStatus(orderId, "ACCEPTED");
    const handleReject = (orderId: string) =>
      updateOrderStatus(orderId, "REJECTED");
    const handleComplete = (orderId: string) =>
      updateOrderStatus(orderId, "COMPLETED");
    const handleCancel = (orderId: string) =>
      updateOrderStatus(orderId, "CANCELLED");
    const sortedOrders = [...orders].sort((a, b) => {
      const statusOrder = (status: string) => {
        if (status === "PENDING") return 0;
        if (status === "ACCEPTED") return 1;
        return 2;
      };
      const statusDiff = statusOrder(a.status) - statusOrder(b.status);
      if (statusDiff !== 0) return statusDiff;
      return (
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      );
    });
    return (
      <FlatList
        data={sortedOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReceivedOrderCard
            order={{ ...item, productImage: imageMap[item.productImage] }}
            onCustomerPress={handleCustomerPress}
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
            onComplete={() => handleComplete(item.id)}
            onCancel={() => handleCancel(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(100, insets.bottom + 60) },
        ]}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No received orders.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#E5ECF6" }}>
      {/* Header with shadow */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <View style={styles.plusBorder}>
          <ChecklistIcon width={26} height={26} color="#222" />
        </View>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "placed" && styles.activeTab]}
          onPress={() => setActiveTab("placed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "placed" && styles.activeTabText,
            ]}
          >
            Placed orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "received" && styles.activeTab]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.activeTabText,
            ]}
          >
            Received orders
          </Text>
        </TouchableOpacity>
      </View>
      {/* Scrollable Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "placed" ? (
          <PlacedOrdersRoute />
        ) : (
          <ReceivedOrdersRoute />
        )}
      </View>
    </View>
  );
};

export default Orders;
