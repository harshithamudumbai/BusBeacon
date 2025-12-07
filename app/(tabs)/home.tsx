/*import { Bell, Edit2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Colors, MockApi } from '../../src/constants/Config';
import { useAuth } from '../../src/context/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth(); // Ensure you have AuthContext setup
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    MockApi.getDashboardData().then(setData);
  }, []);

  if (!data) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {// Header 
        }
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
           <View style={{ width: 32, height: 32, backgroundColor: Colors.primary, borderRadius: 8 }} />
           <TouchableOpacity style={{ padding: 8, backgroundColor: '#000', borderRadius: 20 }}>
             <Bell color="white" size={20} />
           </TouchableOpacity>
        </View>

        {// Profile Card 
        }
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, backgroundColor: Colors.primaryDark, borderRadius: 12, marginRight: 16 }}></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{data.attendant.name}</Text>
            <Text style={{ color: Colors.textSecondary, textTransform: 'uppercase', fontSize: 12 }}>{data.attendant.role}</Text>
          </View>
          <TouchableOpacity style={{ padding: 8, backgroundColor: '#FFF', borderRadius: 20 }}>
            <Edit2 size={16} color="black" />
          </TouchableOpacity>
        </View>

        {// Bus Info & Actions (Same as preview) ... 
        }
        {// You can copy the rest of the UI logic from the preview file provided above 
        }
        
      </ScrollView>
    </SafeAreaView>
  );
}*/
