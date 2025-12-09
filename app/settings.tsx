import React, { useState } from "react";
import { View, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bell, Moon, MapPin, Info } from "lucide-react-native";
import { router } from "expo-router";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">

      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#FAFAFA" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-foreground">Settings</Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          paddingBottom: 160,
        }}
      >
        {/* SETTINGS CARD */}
        <View className="bg-card rounded-2xl overflow-hidden mb-6">

          {/* Notifications */}
          <SettingRow
            icon={Bell}
            label="Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />

          <Divider />

          {/* Dark Mode */}
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />

          <Divider />

          {/* Location */}
          <SettingRow
            icon={MapPin}
            label="Location Access"
            value={location}
            onValueChange={setLocation}
          />

        </View>

        {/* ABOUT APP CARD */}
        <View className="bg-card rounded-2xl p-6 items-center mb-6">
          <Info size={28} color="#A1A1AA" />
          <Text className="text-lg font-semibold text-foreground mt-3">
            BusBeacon v1.0.0
          </Text>
          <Text className="text-sm text-muted-foreground mt-1 text-center">
            Making school transport smarter and safer.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* COMPONENTS */
function SettingRow({ icon: Icon, label, value, onValueChange }) {
  return (
    <View className="flex-row items-center px-4 py-4">
      <Icon size={20} color="#A1A1AA" />
      <Text className="flex-1 text-foreground text-base ml-3">{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border mx-4" />;
}
