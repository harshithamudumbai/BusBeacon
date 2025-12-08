import { Building, Bus, ChevronDown, ChevronRight, ChevronUp, MapPin, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSchools, School } from '../../services/api-rest';

export default function SchoolsScreen() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const response = await getSchools();
      if (response.success && response.data) {
        setSchools(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#22C55E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-xl font-semibold text-foreground">Schools & Branches</Text>
        <Text className="text-sm text-muted-foreground">Manage organization structure</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {schools.map((school) => {
          const isExpanded = expandedSchool === school.id;
          
          return (
            <View key={school.id} className="mb-4">
              <TouchableOpacity
                onPress={() => setExpandedSchool(isExpanded ? null : school.id)}
                className="bg-card rounded-xl p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-purple-500/20 rounded-full items-center justify-center mr-3">
                      <Building size={24} color="#A855F7" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{school.name}</Text>
                      <Text className="text-sm text-muted-foreground">{school.code} • {school.branches.length} branches</Text>
                    </View>
                  </View>
                  {isExpanded ? <ChevronUp size={20} color="#71717A" /> : <ChevronDown size={20} color="#71717A" />}
                </View>
              </TouchableOpacity>

              {/* Branches */}
              {isExpanded && (
                <View className="mt-2 ml-4">
                  {school.branches.map((branch, index) => (
                    <TouchableOpacity
                      key={branch.id}
                      className={`bg-secondary rounded-xl p-4 ${index < school.branches.length - 1 ? 'mb-2' : ''}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="text-base font-medium text-foreground">{branch.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <MapPin size={12} color="#71717A" />
                            <Text className="text-xs text-muted-foreground ml-1">{branch.address}</Text>
                          </View>
                        </View>
                        <ChevronRight size={18} color="#71717A" />
                      </View>

                      {/* Branch Stats */}
                      <View className="flex-row mt-3 pt-3 border-t border-border">
                        <View className="flex-1 flex-row items-center">
                          <Bus size={14} color="#71717A" />
                          <Text className="text-xs text-muted-foreground ml-1">4 Buses</Text>
                        </View>
                        <View className="flex-1 flex-row items-center">
                          <Users size={14} color="#71717A" />
                          <Text className="text-xs text-muted-foreground ml-1">120 Students</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Add New School */}
        <TouchableOpacity className="bg-primary/10 border border-primary/30 border-dashed rounded-xl p-4 items-center mb-6">
          <Text className="text-primary font-semibold">+ Add New School</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}