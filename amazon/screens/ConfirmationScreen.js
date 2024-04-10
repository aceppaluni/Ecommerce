import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";
import { useDispatch, useSelector } from "react-redux";
import { cleanCart } from "../redux/CartReducer";
import axios from "axios";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import RazorpayCheckout from 'react-native-razorpay';

const ConfirmationScreen = () => {
  const steps = [
    { title: "Address", content: "Address Form" },
    { title: "Delivery", content: "Delivery Options" },
    { title: "Payment", content: "Payment Details" },
    { title: "Place Order", content: "Order Summary" },
  ];
  const navigation = useNavigation();
  const [currentStep, setCurrent] = useState("");
  const [addresses, setAddresses] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const cart = useSelector((state) => state.cart.cart);
  const total = cart
    ?.map((item) => item.price * item.quantity)
    .reduce((curr, prev) => curr + prev, 0);
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `http://10.0.0.11:5000/addresses/${userId}`
      );
      const { addresses } = response.data;
      setAddresses(addresses);
    } catch (error) {
      console.log(error);
    }
  };

  const dispatch = useDispatch();
  const [selectedAddress, setSelectedAdress] = useState("");
  const [option, setOption] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const handelPlaceOrder = async () => {
    try {
      const orderData = {
        userId: userId,
        cartItems: cart,
        totalPrice: total,
        shippingAddress: selectedAddress,
        paymentMethod: selectedOption,
      };

      const response = await axios.post(
        "http://10.0.0.11:5000/orders",
        orderData
      );

      if (response.status === 200) {
        navigation.navigate("Order");
        dispatch(cleanCart());
        console.log("success", response.data);
      } else {
        console.log("error making order", response.data);
      }
    } catch (error) {
      console.log('current error', error);
    }
  };

  const pay = async () => {
    try {
      const options = {
        description: "Adding to wallet",
        currency: "INR",
        name: "Amazon",
        key: "rzp_test_E3GWYimxN7YMk8",
        amount: total * 100,
        prefill: {
          email: "void@razorpay.com",
          contact: "9191919191",
          name: "RazorPay Software",
        },
        theme: { color: "#F37254" },
      };

      const data = await RazorpayCheckout.open(options);
      console.log(data);

      const orderData = {
        userId: userId,
        cartItems: cart,
        totalPrice: total,
        shippingAddress: selectedAddress,
        paymentMethod: "card",
      };

      const response = await axios.post(
        "http://10.0.0.11:5000/orders",
        orderData
      );

      if (response.status === 200) {
        navigation.navigate("Order");
        dispatch(cleanCart());
        console.log(response.data);
      } else {
        console.log("unable to place order");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView style={{ marginTop: 55 }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 40 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            justifyContent: "space-between",
          }}
        >
          {steps?.map((step, index) => (
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              {index > 0 && (
                <View
                  style={[
                    { flex: 1, height: 2, backgroundColor: "green" },
                    index <= currentStep && { backgroundColor: "green" },
                  ]}
                />
              )}
              <View
                style={[
                  {
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "#ccc",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  index < currentStep && { backgroundColor: "green" },
                ]}
              >
                {index < currentStep ? (
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                  >
                    ✓
                  </Text>
                ) : (
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold", color: "white" }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text style={{ textAlign: "center", marginTop: 8 }}>
                {step.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {currentStep == 0 && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            Select Delivery Address
          </Text>
          <Pressable>
            {addresses?.map((item, index) => (
              <Pressable
                style={{
                  borderWidth: 1,
                  borderColor: "#D0D0D0",
                  padding: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  paddingBottom: 17,
                  marginVertical: 7,
                  borderRadius: 6,
                }}
              >
                {selectedAddress && selectedAddress._id === item?._id ? (
                  <FontAwesome5 name="dot-circle" size={20} color="#008397" />
                ) : (
                  <Entypo
                    onPress={() => setSelectedAdress(item)}
                    name="circle"
                    size={20}
                    color="gray"
                  />
                )}
                <View style={{ marginLeft: 6 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                      {item?.name}
                    </Text>
                    <Entypo name="location-pin" size={24} color="red" />
                  </View>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    {item.houseNo}, {item?.landmark}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    {item?.street}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    Phone Number: {item?.mobileNo}
                  </Text>
                  <Text style={{ fontSize: 15, color: "#181818" }}>
                    Zip Code: {item?.postalCode}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 7,
                    }}
                  >
                    <Pressable>
                      <Text
                        style={{
                          backgroundColor: "#F5F5F5",
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 5,
                          borderWidth: 0.9,
                          borderColor: "#D0D0D0",
                        }}
                      >
                        Edit
                      </Text>
                    </Pressable>

                    <Pressable
                      style={{
                        backgroundColor: "#F5F5F5",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 5,
                        borderWidth: 0.9,
                        borderColor: "#D0D0D0",
                      }}
                    >
                      <Text>Remove</Text>
                    </Pressable>

                    <Pressable
                      style={{
                        backgroundColor: "#F5F5F5",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 5,
                        borderWidth: 0.9,
                        borderColor: "#D0D0D0",
                      }}
                    >
                      <Text>Set ad Default</Text>
                    </Pressable>
                  </View>

                  <View>
                    {selectedAddress && selectedAddress._id === item?._id && (
                      <Pressable
                        onPress={() => setCurrent(1)}
                        style={{
                          backgroundColor: "#008397",
                          padding: 10,
                          borderRadius: 20,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <Text>Deliver to this Address</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </Pressable>
        </View>
      )}

      {currentStep == 1 && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Choose your delivery options
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 8,
              gap: 7,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}
          >
            {option ? (
              <FontAwesome5 name="dot-circle" size={20} color="#008397" />
            ) : (
              <Entypo
                onPress={() => setOption(!option)}
                name="circle"
                size={20}
                color="gray"
              />
            )}

            <Text style={{ flex: 1 }}>
              <Text style={{ color: "green", fontWeight: "500" }} >Tomorrow By 10PM</Text> - Free delivery with your Prime
              Membership
            </Text>
          </View>
          <Pressable
            onPress={() => setCurrent(2)}
            style={{
              backgroundColor: "#FFC72C",
              padding: 10,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text>Continue</Text>
          </Pressable>
        </View>
      )}

      {currentStep == 2 && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Select your Payment Method
          </Text>
          <View
            style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              marginTop: 12,
            }}
          >
            {selectedOption === "cash" ? (
              <FontAwesome5 name="dot-circle" size={20} color="#008397" />
            ) : (
              <Entypo
                onPress={() => setSelectedOption("cash")}
                name="circle"
                size={20}
                color="gray"
              />
            )}
            <Text>Cash on Delivery</Text>
          </View>

          <View
            style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              marginTop: 12,
            }}
          >
            {selectedOption === "card" ? (
              <FontAwesome5 name="dot-circle" size={20} color="#008397" />
            ) : (
              <Entypo name="circle" size={20} color='gray' onPress={() => {
                setSelectedOption('card');
                Alert.alert('Credit/Debit Card', 'Pay Online', [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed')
                  },
                  {
                    text: 'Ok',
                    onPress: () => pay()
                  }
                ])
              }} />
            )}
            <Text>Credit or Debit</Text>
          </View>
          <Pressable onPress={() => setCurrent(3)} style={{
              backgroundColor: "#FFC72C",
              padding: 10,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 15,
            }}>
            <Text>Continue</Text>
          </Pressable>
        </View>
      )}
      {currentStep == 3 && selectedOption === 'cash' && (
        <View style={{ marginHorizontal: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Order Now</Text>
          <View  style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}>
            <View>
              <Text style={{ fontSize: 17, fontWeight: "bold" }}>Save 5% and never run out</Text>
              <Text style={{ fontSize: 15, color: "gray", marginTop: 5 }}>Turn on auto deliveries</Text>
            </View>
            <MaterialIcons  name="keyboard-arrow-right"
              size={24}
              color="black"/>
          </View>
          <View style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}>
            <Text>Shipping to {selectedAddress?.name}</Text>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}>
              <Text style={{ fontSize: 16, fontWeight: "500", color: "gray" }}>Totoal before Tax</Text>
              <Text style={{ color: "gray", fontSize: 16 }}>${total}</Text>
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}>
              <Text style={{ fontSize: 16, fontWeight: "500", color: "gray" }}>Delivery Fee</Text>
              <Text style={{ color: "gray", fontSize: 16 }}>$0</Text>
            </View>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>Order total</Text>
              <Text style={{ color: "#C60C30", fontSize: 17, fontWeight: "bold" }}>${total}</Text>
            </View>
          </View>
          <View style={{
              backgroundColor: "white",
              padding: 8,
              borderColor: "#D0D0D0",
              borderWidth: 1,
              marginTop: 10,
            }}>
            <Text style={{ fontSize: 16, color: "gray" }}>Pay with:</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 7 }}>Payment on delivery is (Cash)</Text>
          </View>
          <Pressable style={{
              backgroundColor: "#FFC72C",
              padding: 10,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 20,
            }} onPress={handelPlaceOrder}>
            <Text>Place your order</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

export default ConfirmationScreen;

const styles = StyleSheet.create({});

// //when back, continue from where you left off, aka here // no knwon errors as of now
