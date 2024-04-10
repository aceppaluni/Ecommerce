import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, {useEffect, useState} from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';


const LoginScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken')

        if(token) {
          navigation.replace('Main')
        }
      } catch (error) {
        console.log(error)
      }
    }
    checkLoginStatus();
  }, [])

  const handelLogin = () => {
    const user = {email: email, password: password}

    axios.post('http://10.0.0.11:5000/login', user)
    .then((response) => {
      console.log(response)
      const token = response.data.token
      AsyncStorage.setItem('authToken', token)
      navigation.replace('Main')
    })
    .catch((error) => {
      Alert.alert('Error', 'Error logging in');
      console.log(error)
    })
  }

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          style={{ width: 150, height: 100 }}
          source={{
            uri: "https://assets.stickpng.com/thumbs/6160562276000b00045a7d97.png",
          }}
        />
      </View>

      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 17,
            marginTop: 12,
            color: "#041E42",
          }}
        >
          Login to your Account
        </Text>
      </View>

      <View style={{ marginTop: 70 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "#D0D0D0",
            marginTop: 30,
            borderRadius: 5,
            paddingVertical: 5,
          }}
        >
          <MaterialIcons
            style={{ marginLeft: 8 }}
            name="email"
            size={24}
            color="gray"
          />
          <TextInput
          onChangeText={(text) => setEmail(text)}
            placeholder="Email"
            style={{ width: 300, marginVertical: 10, color: "gray", fontSize: email ? 16 : 16 }}
          />
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "#D0D0D0",
            borderRadius: 5,
            paddingVertical: 5,
          }}
        >
          <AntDesign
            name="lock1"
            size={24}
            color="gray"
            style={{ marginLeft: 8 }}
          />
          <TextInput
            placeholder="Password"
            onChangeText={(text) => setPassword(text)}
            style={{ width: 300, marginVertical: 10, color: "gray", fontSize: password ? 16 : 16 }}
          />
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 93,
        }}
      >
        <Text>Keep me logged in</Text>

        <Text style={{ color: "#007FFF", fontWeight: "500" }}>
          Forgot Password
        </Text>
      </View>

      <View style={{ marginTop: 80 }} />

      <Pressable
      onPress={handelLogin}
        style={{
          backgroundColor: "#FEBE10",
          width: 200,
          borderRadius: 10,
          marginLeft: "auto",
          marginRight: "auto",
          padding: 15
        }}
      >
        <Text style={{textAlign: 'center', color: 'white', fontSize: 16}}>Login</Text>
      </Pressable>

      <Pressable style={{marginTop: 15}} onPress={() => navigation.navigate('Register')}>
        <Text style={{textAlign: 'center', color: 'gray', fontSize: 16}}>Don't have an account? Sign Up</Text>
      </Pressable>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
