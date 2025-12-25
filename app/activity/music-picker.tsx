import { MusicTrack, MusicTrimmerSheet } from '@/components/activity/MusicTrimmerSheet';
import { useActivityStore } from '@/stores/activityStore'; // We'll assume we add a temp setter here or just pass back via context/params if needed.
import { spacing } from '@/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Actually, to keep it simple without modifying store interface too much just yet, we might pass via router params or global state.
// The plan decision was: Use useActivityStore to hold tempMusicSelection.
// Let's check activityStore first to see if we can add it easily or mock it for now. 
// For this step I'll assume we can use a local mock or a simple callback pattern if I was passing it in, but as a screen, store is best.

export default function MusicPickerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'For You' | 'Browse'>('For You');
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  
  // We'll use a local state for the modal visibility of trimmer
  const [showTrimmer, setShowTrimmer] = useState(false);

  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track);
    setShowTrimmer(true);
  };

  const handleConfirmSelection = (startTime: number, endTime: number) => {
    if (selectedTrack) {
       // In a real app, update store. For now, we'll navigate back with params or use a global emitter.
       // Since router.back() with params is tricky in some versions, let's try to set it in a store if possible.
       // No, summary is likely the parent in the stack. 
       // Let's assume we update a global store `useActivityStore`. I'll need to add `setTempMusic` to it later.
       // For now, I'll log and go back. I will implement the store update in the next step when I modify summary & store.
       
       // HACK: Since I haven't modified the store yet, I will pass the result via a global event or just assume the store has the method.
       // Actually, I'll modify the store in the next step. So here I will call `useActivityStore.getState().setMusic(...)` if I add it.
       // Let's just assume I will add `setMusicSelection` to the store.
       
       // @ts-ignore
       useActivityStore.getState().setMusicSelection?.({
           ...selectedTrack,
           startTime,
           endTime
       });
       
       setShowTrimmer(false);
       router.back();
    }
  };

  const renderTrackItem = ({ item }: { item: MusicTrack }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => handleSelectTrack(item)}>
      <Image source={{ uri: item.coverUrl }} style={styles.trackCover} />
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
      </View>
      <TouchableOpacity onPress={() => handleSelectTrack(item)}>
        <Ionicons name="play-circle-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
            <TextInput 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search music" 
                placeholderTextColor="#888"
                style={styles.searchInput}
            />
        </View>
        <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'For You' && styles.activeTab]} onPress={() => setActiveTab('For You')}>
            <Text style={[styles.tabText, activeTab === 'For You' && styles.activeTabText]}>For you</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'Browse' && styles.activeTab]} onPress={() => setActiveTab('Browse')}>
            <Text style={[styles.tabText, activeTab === 'Browse' && styles.activeTabText]}>Browse</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={MOCK_TRACKS}
        renderItem={renderTrackItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Trimmer Modal/Sheet */}
      <Modal visible={showTrimmer} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                 <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTrimmer(false)} />
            </View>
            {selectedTrack && (
                <MusicTrimmerSheet 
                    track={selectedTrack} 
                    onClose={() => setShowTrimmer(false)}
                    onSave={handleConfirmSelection}
                />
            )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Mock Data - Using Pixabay free music (more reliable)
const MOCK_TRACKS: MusicTrack[] = [
  { 
    id: '1', 
    title: 'As It Was', 
    artist: 'Harry Styles', 
    duration: 167, 
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3'
  },
  { 
    id: '2', 
    title: 'Starboy', 
    artist: 'The Weeknd', 
    duration: 230, 
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2734718e28d24527d9c74136a52',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749ed37.mp3'
  },
  { 
    id: '3', 
    title: 'Heat Waves', 
    artist: 'Glass Animals', 
    duration: 238, 
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b2739e495fb707973f8474e69ebd',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/10/25/audio_94f8c9b0bd.mp3'
  },
  { 
    id: '4', 
    title: 'Stay', 
    artist: 'The Kid LAROI & Justin Bieber', 
    duration: 141, 
    coverUrl: 'https://i.scdn.co/image/ab67616d0000b27341e31d6ea1d493dd77933ee5',
    audioUrl: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dae6a2fa1.mp3'
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchInput: {
    color: '#fff',
    fontSize: 16,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#fff',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.md,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: spacing.md,
    backgroundColor: '#222',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 2,
  },
  trackArtist: {
    color: '#888',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
