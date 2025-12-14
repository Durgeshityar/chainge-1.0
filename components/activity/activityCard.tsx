import { CARD_MESH_VARIANTS } from '@/lib/constants';
import { MeshGradientView } from 'expo-mesh-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlobeAltIcon, MapPinIcon } from 'react-native-heroicons/outline';

interface ActivityCardProps {
  title: string;
  time: string;
  location: string;
  variant?: keyof typeof CARD_MESH_VARIANTS;
}

export const ActivityCard = ({ title, time, location, variant = 'purple' }: ActivityCardProps) => {
  const { colors, points } = CARD_MESH_VARIANTS[variant];
  return (
    <View style={styles.wrapper}>
      {/* Background Gradient */}
      <MeshGradientView
        style={styles.gradient}
        colors={[...colors]}
        points={[...points]}
        columns={3}
        rows={3}
      />

      {/* Main Content Container */}
      <View style={styles.inner}>
        {/* --- TOP ROW: Icon + Title | Dot + Time --- */}
        <View style={styles.rowBetween}>
          <View style={styles.leftRow}>
            {/* Placeholder Icon - You can swap 'Trophy' for specific sport icons */}
            <GlobeAltIcon size={18} color="#F2F2F2" style={{ marginRight: 8, opacity: 0.9 }} />
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.rightRow}>
            <View style={styles.dot} />
            <Text style={styles.timeText}>{time}</Text>
          </View>
        </View>

        {/* --- BOTTOM ROW: Location | Button --- */}
        <View style={[styles.rowBetween, { alignItems: 'flex-end' }]}>
          <View style={styles.leftRow}>
            <MapPinIcon size={16} color="#B0B0B0" style={{ marginRight: 6 }} />
            <Text style={styles.locationText}>{location}</Text>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', // Subtle glass border
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  inner: {
    flex: 1,
    padding: 24, // Matches the spacing in the image
    justifyContent: 'space-between', // Pushes Header to top, Footer to bottom
  },

  // Layout Helpers
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Text Styles
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timeText: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '500',
  },
  locationText: {
    color: '#B0B0B0',
    fontSize: 13,
    fontWeight: '400',
  },

  // Elements
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A7E92F', // Bright green/yellow from image
    marginRight: 8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
