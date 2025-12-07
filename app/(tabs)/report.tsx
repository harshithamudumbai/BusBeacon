import { AlertCircle, Bus, MapPin, Users, Wrench } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getIssueCategories, IssueCategory, reportIssue } from '../../services/api';

export default function ReportScreen() {
  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await getIssueCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const iconProps = { size: 24, color: '#FAFAFA' };
    switch (iconName) {
      case 'bus':
        return <Bus {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      case 'map-pin':
        return <MapPin {...iconProps} />;
      case 'wrench':
        return <Wrench {...iconProps} />;
      default:
        return <AlertCircle {...iconProps} />;
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) {
      alert('Please select a category and enter a description');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await reportIssue({
        categoryId: selectedCategory,
        description: description.trim(),
      });

      if (response.success) {
        alert('Issue reported successfully!');
        setSelectedCategory(null);
        setDescription('');
      }
    } catch (error) {
      alert('Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      <View className="px-4 py-4">
        <Text className="text-2xl font-semibold text-foreground">Report Issue</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Select a category and describe the issue
        </Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Categories */}
        <Text className="text-base font-semibold text-foreground mb-3">
          Select Category
        </Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              className={`flex-row items-center px-4 py-3 rounded-xl ${
                selectedCategory === category.id
                  ? 'bg-primary'
                  : 'bg-secondary'
              }`}
            >
              {getCategoryIcon(category.icon)}
              <Text
                className={`ml-2 font-medium ${
                  selectedCategory === category.id
                    ? 'text-primary-foreground'
                    : 'text-foreground'
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text className="text-base font-semibold text-foreground mb-3">
          Description
        </Text>
        <TextInput
          placeholder="Describe the issue in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="bg-secondary rounded-xl p-4 text-foreground min-h-[120px]"
          placeholderTextColor="#71717A"
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!selectedCategory || !description.trim() || isSubmitting}
          className={`mt-6 mb-4 py-4 rounded-2xl items-center ${
            !selectedCategory || !description.trim() || isSubmitting
              ? 'bg-primary/50'
              : 'bg-primary'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">
              Submit Report
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}