import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { BellIcon, MagnifyingGlassIcon, PlusIcon } from 'react-native-heroicons/outline';

import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ChatListItem } from '@/components/messaging/ChatListItem';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useNotifications } from '@/hooks/useNotifications';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

type FilterType = 'All' | 'Unread' | 'Matched';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { chats, fetchUserChats, isLoading } = useChat();
  const { unreadCount: notifUnreadCount } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const activeSwipeableRef = useRef<Swipeable | null>(null);

  const handleSwipeableOpen = useCallback((ref: Swipeable) => {
    if (activeSwipeableRef.current && activeSwipeableRef.current !== ref) {
      activeSwipeableRef.current.close();
    }
    activeSwipeableRef.current = ref;
  }, []);

  const loadChats = useCallback(() => {
    if (user) fetchUserChats(user.id);
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const filteredChats = useMemo(() => {
    let result = chats;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.participants?.some(
            (p) =>
              p.user?.name?.toLowerCase().includes(q) || p.user?.username.toLowerCase().includes(q),
          ),
      );
    }

    if (activeFilter === 'Matched') {
      return result.filter((c) => c.type === 'DIRECT');
    }

    return result;
  }, [chats, searchQuery, activeFilter]);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* SEARCH */}
      <Input
        placeholder="Search messages..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        rightIcon={<MagnifyingGlassIcon size={20} color={colors.text.tertiary} />}
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
        containerStyle={{
          marginHorizontal: 4,
          marginBottom: 0,
        }}
        inputContainerStyle={{ backgroundColor: colors.background.charcoal }}
        autoCapitalize="none"
      />

      {/* FILTER CHIPS */}
      <View style={styles.filterContainer}>
        {(['All', 'Unread', 'Matched'] as FilterType[]).map((filter) => (
          <Chip
            key={filter}
            label={`${filter}${filter === 'Unread' ? ' (4)' : filter === 'Matched' ? ' (2)' : ''}`}
            selected={activeFilter === filter}
            size="small"
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <Header
            showBack={false}
            leftElement={<Text style={styles.headerTitle}>Messages</Text>}
            rightElement={
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={() => router.push('/chat/new')}
                  style={styles.newChatButton}
                >
                  <PlusIcon size={16} color={colors.jetBlack} strokeWidth={3} />
                  <Text style={styles.newChatText}>New Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/notifications')}
                  style={styles.iconButton}
                >
                  <BellIcon size={24} color={colors.text.secondary} />
                  {notifUnreadCount > 0 && <View style={styles.badge} />}
                </TouchableOpacity>
              </View>
            }
          />

          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatListItem
                chat={item}
                onPress={() => router.push(`/chat/${item.id}`)}
                unreadCount={0}
                onSwipeableOpen={handleSwipeableOpen}
              />
            )}
            ListHeaderComponent={renderHeader()}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={loadChats}
                tintColor={colors.primary}
              />
            }
          />
        </View>
      </TouchableWithoutFeedback>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    ...typography.presets.h2,
    color: colors.text.primary,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },

  newChatText: {
    ...typography.presets.labelSmall,
    color: colors.jetBlack,
    fontWeight: '700',
  },

  iconButton: {
    position: 'relative',
    padding: 4,
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    borderWidth: 1,
    borderColor: colors.background.default,
  },

  listHeader: {
    paddingVertical: 12,
    gap: 12,
  },

  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 4,
  },

  listContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
});
