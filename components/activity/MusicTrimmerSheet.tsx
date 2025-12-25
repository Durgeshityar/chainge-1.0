import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Actually, if this is a sheet content, we might not need to import BottomSheet here if it is rendered *inside* one in the parent.
// But the plan says "Music Trimmer Sheet". Let's make it a standalone component that can be put inside a Modal or BottomSheet.
// The user prompt says "new bottom sheet to select part of music".

const SCREEN_WIDTH = Dimensions.get('window').width;
const WAVEFORM_WIDTH = SCREEN_WIDTH * 2; // Make it wider to scroll
const VISIBLE_WINDOW_WIDTH = SCREEN_WIDTH - 40;
const DURATION_SECONDS = 60; // Total track length for mock
const CLIP_DURATION = 15;
const PIXELS_PER_SECOND = WAVEFORM_WIDTH / DURATION_SECONDS;

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: number; // in seconds
  audioUrl?: string; // Mock
}

interface MusicTrimmerSheetProps {
  track: MusicTrack;
  onClose: () => void;
  onSave: (startTime: number, endTime: number) => void;
}

import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export const MusicTrimmerSheet = ({ track, onClose, onSave }: MusicTrimmerSheetProps) => {
  const [scrollX, setScrollX] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const playTimer = useRef<any>(null);

  // Create audio player with expo-audio hook
  const player = useAudioPlayer(track.audioUrl ? { uri: track.audioUrl } : null);
  const status = useAudioPlayerStatus(player);

  const isPlaying = status?.playing ?? false;

  // Derive selection time from scroll position
  const selectionStart = Math.min(
    Math.max(0, scrollX / PIXELS_PER_SECOND),
    DURATION_SECONDS - CLIP_DURATION
  );

  // Mock waveform bars - generate once
  const bars = useRef(Array.from({ length: 80 }, () => Math.random() * 0.8 + 0.2)).current;

  // Update progress based on player status
  useEffect(() => {
    if (isPlaying && status?.currentTime !== undefined) {
      const currentPos = status.currentTime;
      const clipPos = currentPos - selectionStart;
      const progress = Math.max(0, Math.min(1, clipPos / CLIP_DURATION));
      setPlaybackProgress(progress);

      // Loop when clip ends
      if (clipPos >= CLIP_DURATION) {
        player.seekTo(selectionStart);
      }
    }
  }, [status?.currentTime, isPlaying, selectionStart]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.seekTo(selectionStart);
      player.play();
    }
  };

  const handleSave = () => {
    player.pause();
    onSave(selectionStart, selectionStart + CLIP_DURATION);
  };

  const handleScroll = (event: any) => {
    setScrollX(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Trim Music</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trackInfo}>
        <Image source={{ uri: track.coverUrl }} style={styles.cover} />
        <View style={styles.textInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.artistName}>{track.artist}</Text>
        </View>
      </View>

      <View style={styles.playerContainer}>
         <TouchableOpacity onPress={handlePlayPause}>
            <View style={styles.playBtnContainer}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#000" />
                {isPlaying && (
                    <View 
                        style={[
                            styles.playProgressCircle, 
                            { transform: [{ rotate: `${playbackProgress * 360}deg` }] }
                        ]} 
                    />
                )}
            </View>
         </TouchableOpacity>
      </View>

      <View style={styles.trimmerOuter}>
         <Text style={styles.timeLabel}>
            {Math.floor(selectionStart / 60)}:{(Math.floor(selectionStart) % 60).toString().padStart(2, '0')} - 
            {Math.floor((selectionStart + CLIP_DURATION) / 60)}:{(Math.floor(selectionStart + CLIP_DURATION) % 60).toString().padStart(2, '0')}
         </Text> 
         
         <View style={styles.waveformWindow}>
             <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingHorizontal: VISIBLE_WINDOW_WIDTH / 2 - (CLIP_DURATION * PIXELS_PER_SECOND / 2) }}
             >
                <View style={styles.waveformTrack}>
                    {bars.map((height, i) => (
                        <View 
                            key={i} 
                            style={[
                                styles.bar, 
                                { height: height * 40 }
                            ]} 
                        />
                    ))}
                </View>
             </ScrollView>
             
             {/* Fixed selection overlay */}
             <View style={styles.selectionOverlay} pointerEvents="none">
                <View style={styles.selectionBox} />
             </View>
         </View>
         <Text style={styles.dragHint}>Drag waveform to adjust clip</Text>
      </View>

      <View style={styles.footer}>
         <Button title="Add Clip" onPress={handleSave} style={styles.addButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 550, // Increased height
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  doneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  textInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistName: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  playerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playBtnContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playProgressCircle: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: colors.primary,
      borderTopColor: 'transparent',
      borderLeftColor: 'transparent',
  },
  trimmerOuter: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  waveformWindow: {
    height: 80,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  waveformTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: '100%',
    width: WAVEFORM_WIDTH,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionBox: {
    width: CLIP_DURATION * PIXELS_PER_SECOND,
    height: 60,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    backgroundColor: 'rgba(173, 255, 47, 0.1)',
  },
  timeLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: '#444',
  },
  dragHint: {
    color: colors.text.tertiary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
      marginTop: 'auto',
      paddingBottom: 25, // Fix cropping
  },
  addButton: {
      backgroundColor: colors.primary,
  }
});
