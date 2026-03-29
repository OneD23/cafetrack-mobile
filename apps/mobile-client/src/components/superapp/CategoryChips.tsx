import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { BusinessCategory } from '../../types/superApp';

interface Props {
  categories: BusinessCategory[];
  selectedCategoryId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryChips({ categories, selectedCategoryId, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
      <TouchableOpacity
        onPress={() => onSelect(null)}
        style={{
          backgroundColor: selectedCategoryId ? '#f0f0f0' : '#1f6feb',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 16,
          marginRight: 8,
        }}
      >
        <Text style={{ color: selectedCategoryId ? '#333' : '#fff' }}>Todas</Text>
      </TouchableOpacity>

      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            onPress={() => onSelect(category.id)}
            style={{
              backgroundColor: isSelected ? '#1f6feb' : '#f0f0f0',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
              marginRight: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: isSelected ? '#fff' : '#333', marginRight: 4 }}>{category.icon}</Text>
              <Text style={{ color: isSelected ? '#fff' : '#333' }}>{category.name}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
