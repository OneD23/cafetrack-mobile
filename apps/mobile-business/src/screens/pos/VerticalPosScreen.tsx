import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { posRegistry } from '../../config/posRegistry';
import { BusinessVertical } from '../../types/business';

interface Props {
  vertical: BusinessVertical;
}

export default function VerticalPosScreen({ vertical }: Props) {
  const config = posRegistry[vertical];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1a0f0a' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ width: '100%', maxWidth: 900, alignSelf: 'center' }}>
        <Text style={{ color: '#f5f1e8', fontSize: 28, fontWeight: '800' }}>{config.title}</Text>
        <Text style={{ color: '#d2b8a3', marginTop: 4, marginBottom: 16 }}>{config.subtitle}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
          {config.metrics.map((metric) => (
            <View
              key={metric.label}
              style={{
                backgroundColor: '#2c1810',
                borderColor: '#4a3428',
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                marginRight: 10,
                marginBottom: 10,
                minWidth: 170,
              }}
            >
              <Text style={{ color: '#d2b8a3', fontSize: 12 }}>{metric.label}</Text>
              <Text style={{ color: '#f5f1e8', fontSize: 18, fontWeight: '700', marginTop: 4 }}>{metric.value}</Text>
            </View>
          ))}
        </View>

        <Text style={{ color: '#f5f1e8', fontWeight: '700', marginBottom: 10 }}>Acciones rápidas</Text>
        {config.quickActions.map((action) => (
          <TouchableOpacity
            key={action}
            style={{
              backgroundColor: '#4a3428',
              borderRadius: 10,
              paddingVertical: 12,
              paddingHorizontal: 14,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#f5f1e8', fontWeight: '600' }}>{action}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ marginTop: 18, backgroundColor: '#2c1810', borderRadius: 12, borderWidth: 1, borderColor: '#4a3428', padding: 14 }}>
          <Text style={{ color: '#f5f1e8', fontWeight: '700', marginBottom: 6 }}>Modo profesional</Text>
          <Text style={{ color: '#d2b8a3' }}>
            Este POS se cargó dinámicamente según la empresa autenticada. Puedes extender cada vertical con flujos especializados
            (fiscal, inventario, producción, agenda o despacho) sin duplicar la app.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
