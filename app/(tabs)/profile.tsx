import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import "react-native-url-polyfill/auto";

import Auth from "@/components/Auth";
import { icons } from "@/constants/icons";
import { supabase } from "@/lib/supabase";
import { useImageUploader } from "@/utils/uploadthing";

const profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { openImagePicker } = useImageUploader("imageUploader", {
    onClientUploadComplete: (res) => {
      const imageUrl = res[0].ufsUrl;
      const userId = session?.user?.id;

      if (userId) {
        // Store the image URL with user ID association
        setProfileImage(imageUrl);
        console.log(`Profile image uploaded for user ${userId}:`, imageUrl);

        // You can save this to your database here
        // Example: saveProfileImage(userId, imageUrl);

        Alert.alert("Upload Completed", "Profile photo updated successfully!");
      }
    },
    onUploadError: (error) => Alert.alert("Upload Error", error.message),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Load existing profile image for the user
      if (session?.user?.id) {
        loadUserProfileImage(session.user.id);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Load existing profile image for the user
      if (session?.user?.id) {
        loadUserProfileImage(session.user.id);
      }
    });
  }, []);

  const loadUserProfileImage = async (userId: string) => {
    try {
      // You can implement loading from your database here
      // Example: const savedImage = await getUserProfileImage(userId);
      // setProfileImage(savedImage);
      console.log(`Loading profile image for user: ${userId}`);
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  const handleImageUpload = () => {
    if (!session?.user?.id) {
      Alert.alert("Error", "Please log in to upload a profile photo");
      return;
    }

    openImagePicker({
      source: "library",
      onInsufficientPermissions: () => {
        Alert.alert(
          "No Permissions",
          "You need to grant permission to your Photos to use this",
          [
            { text: "Dismiss" },
            { text: "Open Settings", onPress: openSettings },
          ]
        );
      },
    });
  };

  function openSettings(value?: string | undefined): void {
    throw new Error("Function not implemented.");
  }

  return (
    <View style={styles.container}>
      {!session && <Auth />}
      {session && session.user && (
        <View style={styles.profileContainer}>
          <View style={styles.uploadContainer}>
            <Pressable
              android_ripple={{ color: "#e5e7eb", borderless: true }}
              onPress={handleImageUpload}
              style={styles.profileImageContainer}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Image
                    source={icons.person}
                    style={styles.placeholderIcon}
                    resizeMode="contain"
                  />
                </View>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  uploadContainer: {
    alignItems: "center",
    marginTop: 80, // Position under camera bump
  },
  profileImageContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#f3f4f6",
    borderWidth: 4,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 64,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    tintColor: "#9ca3af",
  },
});

export default profile;
