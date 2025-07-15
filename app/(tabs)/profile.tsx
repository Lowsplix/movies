import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, View } from "react-native";
import "react-native-url-polyfill/auto";

import Auth from "@/components/Auth";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { supabase } from "@/lib/supabase";
import { getUserImage, uploadUserImage } from "@/services/appwrite";
import { useImageUploader } from "@/utils/uploadthing";

const profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const { openImagePicker } = useImageUploader("imageUploader", {
    onClientUploadComplete: (res) => {
      const imageUrl = res[0].ufsUrl;
      const userId = session?.user?.id;

      if (userId) {
        setProfileImage(imageUrl);
        uploadUserImage({ id: userId, profile_url: imageUrl });
        console.log(`Profile image uploaded for user ${userId}:`, imageUrl);

        Alert.alert("Upload Completed", "Profile photo updated successfully!");
      }
    },
    onUploadError: (error) => Alert.alert("Upload Error", error.message),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session?.user?.id) loadUserProfileImage(session.user.id);
  }, [session]);

  const loadUserProfileImage = async (userId: string) => {
    try {
      const imageUrl = await getUserImage(userId);
      setProfileImage(imageUrl || null);
      console.log(`Loading profile image for user: ${userId}`);
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  const handleImageUpload = () => {
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
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <Image
        source={images.bg}
        style={{
          flex: 1,
          position: "absolute",
          width: "100%",
          zIndex: 0,
        }}
        resizeMode="cover"
      />

      {!session && <Auth />}
      {session && session.user && (
        <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 24 }}>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 80,
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <Image
              source={icons.logo}
              style={{
                width: 48,
                height: 40,
              }}
            />
          </View>

          <View style={{ alignItems: "center" }}>
            <Pressable
              android_ripple={{ color: "#e5e7eb", borderless: true }}
              onPress={handleImageUpload}
              style={{
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
              }}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 64,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Image
                    source={icons.person}
                    style={{
                      width: 48,
                      height: 48,
                      tintColor: "#9ca3af",
                    }}
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

export default profile;
