import { supabase } from "@/lib/supabase";
import { makeRedirectUri } from "expo-auth-session";

import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri({ path: "profile" });

const Auth: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const signInWithEmail = async (): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  };

  const signUpWithEmail = async (): Promise<void> => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,

      // TODO: for some reason dynamic redirect is not working. disabled email confirmation for now.
      // options: {
      //   emailRedirectTo: redirectTo,
      // },
    });

    if (error) Alert.alert(error.message);
    if (!session && !error)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const { error } = await supabase.auth.signOut();

    if (error) Alert.alert(error.message);
    setLoading(false);
  };

  return (
    <View
      style={{
        marginTop: 40,
        padding: 12,
      }}
    >
      {loading && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
            paddingVertical: 16,
          }}
        >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text
            style={{
              marginTop: 8,
              fontSize: 16,
              color: "#6B7280",
              fontWeight: "500",
            }}
          >
            Please wait...
          </Text>
        </View>
      )}

      <View
        style={{
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            color: "#374151",
          }}
        >
          Email
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            backgroundColor: "#FFFFFF",
          }}
          onChangeText={(text: string) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>

      <View
        style={{
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 8,
            color: "#374151",
          }}
        >
          Password
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            backgroundColor: "#FFFFFF",
          }}
          onChangeText={(text: string) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          autoComplete="password"
        />
      </View>

      <TouchableOpacity
        style={[
          {
            backgroundColor: "#3B82F6",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: "center",
          },
          loading && { opacity: 0.6 },
        ]}
        disabled={loading}
        onPress={signInWithEmail}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Sign in
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: "#3B82F6",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: "center",
          },
          loading && { opacity: 0.6 },
        ]}
        disabled={loading}
        onPress={signUpWithEmail}
      >
        <Text
          style={{
            color: "#3B82F6",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Sign up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          {
            backgroundColor: "#EF4444",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            marginBottom: 12,
            alignItems: "center",
          },
          loading && { opacity: 0.6 },
        ]}
        disabled={loading}
        onPress={signOut}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Auth;
