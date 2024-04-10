import { View, Text, Pressable, ScrollView, Image } from "react-native";
import React, { useEffect, useLayoutEffect, useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { UserType } from "../UserContext";

// when back - continue fixing profile screen
const ProfileScreen = () => {
  const navigation = useNavigation();

  const { userId, setUserId } = useContext(UserType);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerStyle: { backgroundColor: "#00CED1" },
      headerLeft: () => (
        <Image
          style={{ width: 140, height: 120, resizeMode: "contain" }}
          source={{
            uri: "https://assets.stickpng.com/thumbs/580b57fcd9996e24bc43c518.png",
          }}
        />
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            marginRight: 12,
          }}
        >
          <Ionicons name="notifications-outline" size={24} color="black" />
          <AntDesign name="search1" size={24} color="black" />
        </View>
      ),
    });
  }, []);

  const handelLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    navigation.navigate("Login");
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const respsone = await axios.get(`http://10.0.0.11:5000/orders/${userId}`);
        const orders = respsone.data.orders;
        setOrders(orders);
        setLoading(false);
      } catch (error) {
        console.log(error)
      }
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://10.0.0.11:5000/profile/${userId}`);
        const {user} = response.data;
        setUser(user)
      } catch (error) {
        console.log(error)
      }
    }
    fetchUser();
  }, []);

  return (
    <ScrollView style={{ padding: 10, flex: 1, backgroundColor: "white" }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
        Welcome, {user?.name}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginTop: 12,
        }}
      >
        <Pressable
          style={{
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            padding: 10,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Your Orders</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            padding: 10,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Your Account</Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            padding: 10,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Buy Again</Text>
        </Pressable>

        <Pressable
          onPress={handelLogout}
          style={{
            backgroundColor: "#E0E0E0",
            borderRadius: 25,
            padding: 10,
            flex: 1,
          }}
        >
          <Text style={{ textAlign: "center" }}>Logout</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {loading ? (
          <Text>Loading...</Text>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <Pressable
              style={{
                marginTop: 20,
                padding: 15,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#d0d0d0",
                marginHorizontal: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
              key={order._id}
            >
              {/* Render the order information here */}
              {order.products.slice(0, 1)?.map((product) => ( // slice allows for only one item of order to show
                <View style={{ marginVertical: 10 }} key={product._id}>
                  <Image
                    source={{ uri: product.image }}
                    style={{ width: 100, height: 100, resizeMode: "contain" }}
                  />
                </View>
              ))}
            </Pressable>
          ))
        ) : (
          <Text>No orders found</Text>
        )}
      </ScrollView>
    </ScrollView>
  );
};

export default ProfileScreen;
