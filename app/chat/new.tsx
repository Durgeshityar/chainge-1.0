import { MeshGradientView } from 'expo-mesh-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronLeftIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar } from '@/components/ui/Avatar';
import { useAdapters } from '@/hooks/useAdapter';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { createUserService } from '@/services/users';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { User } from '@/types';

export default function NewChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { database, storage } = useAdapters();
  const { chatService } = useChat();

  const userService = useMemo(
    () => createUserService(database, storage),
    [database, storage]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;
    if (searchQuery.length === 0) {
      userService.getSuggestedUsers(user.id).then((users) => {
        setResults(users);
      });
    } else {
      const timer = setTimeout(() => {
        setLoading(true);
        userService.searchUsers(searchQuery)
          .then((users) => {
            setResults(users.filter(u => u.id !== user.id));
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, user, userService]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === selectedUser.id);
      if (isSelected) {
        return prev.filter(u => u.id !== selectedUser.id);
      }
      return [...prev, selectedUser];
    });
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleUserSelect = async (selectedUser: User) => {
    if (!user) return;

    try {
      const chat = await chatService.getOrCreateDirectChat(user.id, selectedUser.id);
      router.replace(`/chat/${chat.id}`);
    } catch (err) {
      console.error('Failed to create chat', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || selectedUsers.length === 0) return;

    if (selectedUsers.length === 1) {
      // Single user - create direct chat
      handleUserSelect(selectedUsers[0]);
    } else {
      // Multiple users - create group chat
      try {
        const participantIds = [user.id, ...selectedUsers.map(u => u.id)];
        const chat = await chatService.createGroupChat(participantIds);
        router.replace(`/chat/${chat.id}`);
      } catch (err) {
        console.error('Failed to create group chat', err);
      }
    }
  };

  const isUserSelected = (userId: string) => selectedUsers.some(u => u.id === userId);

  return (
    <View style={styles.root}>
      <MeshGradientView
        style={StyleSheet.absoluteFill}
        columns={3}
        rows={3}
        colors={[
          colors.background.black, colors.background.charcoal, colors.background.black,
          colors.background.charcoal, colors.background.deepGreen, colors.background.charcoal,
          colors.background.black, colors.background.black, colors.background.black,
        ]}
      />
      <ScreenContainer
        safeAreaEdges={['bottom']}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Custom Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ChevronLeftIcon size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New chat</Text>
            <TouchableOpacity
              style={[
                styles.createGroupButton,
                selectedUsers.length === 0 && styles.createGroupButtonDisabled
              ]}
              onPress={handleCreateGroup}
              disabled={selectedUsers.length === 0}
            >
              <Text style={[
                styles.createGroupText,
                selectedUsers.length === 0 && styles.createGroupTextDisabled
              ]}>
                {selectedUsers.length <= 1 ? 'Start Chat' : 'Create Group'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* To: Field with chips */}
        <View style={styles.toFieldContainer}>
          <Text style={styles.toLabel}>To:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {selectedUsers.map((selectedUser) => (
              <View key={selectedUser.id} style={styles.selectedChip}>
                <Text style={styles.selectedChipText}>
                  {selectedUser.name || selectedUser.username}
                </Text>
                <TouchableOpacity
                  onPress={() => removeSelectedUser(selectedUser.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <XMarkIcon size={14} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </ScrollView>
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>
          {selectedUsers.length > 0
            ? `Group chat with ${selectedUsers.length} ${selectedUsers.length === 1 ? 'person' : 'people'}`
            : searchQuery
              ? 'Results'
              : 'Suggested'
          }
        </Text>

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = isUserSelected(item.id);
            return (
              <TouchableOpacity
                style={styles.userItem}
                onPress={() => toggleUserSelection(item)}
              >
                <Avatar source={item.avatarUrl || undefined} name={item.name || item.username} size="md" />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name || item.username}</Text>
                  {item.name ? <Text style={styles.userHandle}>@{item.username}</Text> : null}
                </View>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <View style={styles.checkboxInner} />}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {loading ? 'Searching...' : 'No users found'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.black,
  },
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  contentContainer: {
    paddingHorizontal: 0,
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    flex: 1,
  },
  createGroupButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createGroupButtonDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  createGroupText: {
    ...typography.presets.labelMedium,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  createGroupTextDisabled: {
    color: colors.primary,
  },
  toFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.input, // Match CommentSheet input style
    borderRadius: 8,
    minHeight: 44,
  },
  toLabel: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    marginRight: 8,
  },
  chipsScroll: {
    flex: 1,
  },
  chipsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  selectedChipText: {
    ...typography.presets.labelSmall,
    color: colors.text.inverse,
    fontWeight: '500',
  },
  searchInput: {
    flex: 1,
    minWidth: 120,
    color: colors.text.primary,
    ...typography.presets.bodyMedium,
    paddingVertical: 0,
  },
  sectionTitle: {
    ...typography.presets.labelSmall,
    color: colors.text.secondary,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
  },
  userHandle: {
    ...typography.presets.caption,
    color: colors.text.tertiary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.inverse,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
});
