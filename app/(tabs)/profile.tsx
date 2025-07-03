import { openSettings } from "expo-linking";
import { Alert, Pressable, Text, View } from "react-native";

import { useImageUploader } from "@/utils/uploadthing";

const profile = () => {
  const { openImagePicker } = useImageUploader("imageUploader", {
    onClientUploadComplete: () => Alert.alert("Upload Completed"),
    onUploadError: (error) => Alert.alert("Upload Error", error.message),
  });

  return (
    <View className="flex-1 bg-primary">
      <Pressable
        className="mt-20"
        onPress={() => {
          openImagePicker({
            source: "library", // or "camera"
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
        }}
      >
        <Text className="text-white text-center">Select Image</Text>
      </Pressable>
    </View>
  );
};

export default profile;
