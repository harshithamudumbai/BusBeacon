import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { setTermsAccepted } from '../../services/storage';

export default function TermsScreen() {
  const [accepted, setAccepted] = useState(false);
  const { isAuthenticated, isLoading, selectedRole, hasMultipleRoles } = useAuth();

  const handleNext = async () => {
    if (accepted) {
      await setTermsAccepted();
        // If user has multiple roles and hasn't selected one yet
        console.log('hasMultipleRoles : '+hasMultipleRoles+' | selectedRole : '+selectedRole);
        if (hasMultipleRoles && !selectedRole) {
          console.log('----------interms----handleNext---multiple roles and not selected one yet');
          //<Redirect href="./(auth)/role-select" />
          //router.replace('./(auth)/role-select');
          router.replace('/(auth)/role-select');
          return;
        }
        else
        { 
          router.replace('/(tabs)');
        }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-12">
        <View className="flex-1">
          <Text className="text-2xl font-semibold text-foreground mb-8">
            Accept Terms & Conditions
          </Text>
          
          <View className="flex-row items-start gap-4">
            <TouchableOpacity
              onPress={() => setAccepted(!accepted)}
              className={`w-6 h-6 rounded-md items-center justify-center ${
                accepted ? 'bg-primary' : 'bg-secondary border border-border'
              }`}
            >
              {accepted && <Check size={16} color="#fff" />}
            </TouchableOpacity>
            
            <Text className="flex-1 text-sm text-muted-foreground leading-relaxed">
              I confirm that I agree to BusBeacon's{' '}
              <Text className="text-primary font-medium">User Agreement</Text>
              , and I acknowledge that I have read BusBeacon's{' '}
              <Text className="text-primary font-medium">Privacy Notice</Text>.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          onPress={handleNext}
          disabled={!accepted}
          className={`w-full py-4 rounded-2xl items-center ${
            !accepted ? 'bg-primary/50' : 'bg-primary'
          }`}
        >
          <Text className="text-primary-foreground font-semibold text-base">
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
