import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

export const Watermark = () => {
  const rows = Array.from({ length: 12 });
  const cols = Array.from({ length: 4 });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -3,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}

    >
      {rows.map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {cols.map((_, j) => (
            <Text
              key={j}
              style={{
                fontSize: 15,
                color: '#800000',
                opacity: 0.09,
                transform: 'rotate(-30deg)',
                fontFamily: 'Inter',
                fontWeight: 'bold',
              }}
            >
              BIODATAMAKER
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
