import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/djnc2yevw/image/upload";
const UPLOAD_PRESET = "unsigned_uploads";
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 1080;
const MAX_UPLOAD_SIZE = 300 * 1024; // 300KB

export function useProfileImageUpload(onUpload: (url: string) => void) {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const { uri, fileSize, type } = asset;

    const getExtension = (uri: string) => {
      const match = uri.match(/\.(\w+)$/);
      return match ? match[1].toLowerCase() : "";
    };

    const isAcceptedType = (type?: string, uri?: string) => {
      if (type && ACCEPTED_TYPES.includes(type)) return true;
      const ext = uri ? getExtension(uri) : "";
      return ["jpg", "jpeg", "png", "heic"].includes(ext);
    };

    if (!isAcceptedType(type, uri)) {
      Alert.alert("Invalid file type", "Please select a JPEG, PNG, or HEIC image.");
      return;
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      Alert.alert("File too large", "Please select an image under 5MB.");
      return;
    }

    let manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_WIDTH } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.WEBP,
      }
    );

    let compressedUri = manipResult.uri;
    let compressedSize = (await fetch(compressedUri).then(r => r.blob())).size;
    let compressQuality = 0.7;

    while (compressedSize > MAX_UPLOAD_SIZE && compressQuality > 0.2) {
      compressQuality -= 0.1;
      manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_WIDTH } }],
        {
          compress: compressQuality,
          format: ImageManipulator.SaveFormat.WEBP,
        }
      );
      compressedUri = manipResult.uri;
      compressedSize = (await fetch(compressedUri).then(r => r.blob())).size;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: compressedUri,
        name: "upload.webp",
        type: "image/webp",
      } as any);
      formData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        onUpload(data.secure_url);
        Alert.alert("Upload Success", "Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err: any) {
      Alert.alert("Upload Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  return { uploading, pickAndUpload };
}