import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { styles } from "../styles/myProfileStyles";

type Props = {
  value: string;
  editing: boolean;
  inputValue: string;
  setInputValue: (v: string) => void;
  setEditing: (b: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  placeholder: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  maxLength?: number;
};

const MyProfileEditableField: React.FC<Props> = ({
  value,
  editing,
  inputValue,
  setInputValue,
  setEditing,
  onSave,
  onCancel,
  saving,
  placeholder,
  icon,
  multiline,
  maxLength,
}) =>
  editing ? (
    <View style={{ width: "100%" }}>
      <TextInput
        style={[
          styles.editableFieldInput,
          multiline
            ? styles.editableFieldInputMultiline
            : styles.editableFieldInputSingle,
        ]}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={placeholder}
        multiline={multiline}
        maxLength={maxLength}
        editable={!saving}
      />
      {maxLength && (
        <Text style={styles.editableFieldCounter}>
          {(inputValue || "").length}/{maxLength}
        </Text>
      )}
      <View style={styles.editableFieldBtnRow}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.editableFieldCancelBtn}
          disabled={saving}
        >
          <Text style={styles.editableFieldCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          style={[
            styles.editableFieldSaveBtn,
            saving && styles.editableFieldSaveBtnDisabled,
          ]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.editableFieldSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <TouchableOpacity
      style={styles.editableFieldRow}
      onPress={() => {
        setInputValue(value);
        setEditing(true);
      }}
      activeOpacity={0.7}
    >
      {icon}
      <View>
        {value ? (
          <Text style={styles.bioText}>{value}</Text>
        ) : (
          <>
            <Text style={styles.bioTitle}>Add {placeholder}</Text>
            <Text style={styles.bioSubtitle}>Tell others about yourself</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

export default MyProfileEditableField;
