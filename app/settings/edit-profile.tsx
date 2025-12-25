import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ChevronDownIcon, PhotoIcon, PlusIcon } from 'react-native-heroicons/outline';

import { Header } from '@/components/layout/Header';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { WheelPicker } from '@/components/ui/WheelPicker';

import { useAdapters } from '@/hooks/useAdapter';
import { useAuth } from '@/hooks/useAuth';
import { ONBOARDING_ACTIVITY_TRACKERS, ONBOARDING_INTEREST_CATEGORIES } from '@/lib/constants';
import { createUserService } from '@/services/users';
import { useAuthStore } from '@/stores/authStore';
import { useProfileEditStore } from '@/stores/profileEditStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    name, username, location, bio, gender, dateOfBirth,
    height, weight, activityTracker, interests,
    avatarUri, coverUri,
    setField, toggleInterest, initialize
  } = useProfileEditStore();

  // Initialize state from User
  useEffect(() => {
    if (user) {
      initialize({
        name: user.name || '',
        username: user.username || '',
        location: user.location || '',
        gender: user.gender || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth || '01 / 01 / 2000',
        activityTracker: user.activityTracker || '',
        interests: user.interests || [],
        avatarUri: user.avatarUrl || undefined,
        coverUri: user.coverImage || undefined,
      });

      // Height
      if (user.height) {
        if (user.height.includes('cm')) {
          setField('height', { unit: 'cm', value: parseFloat(user.height) || 170 });
        } else if (user.height.includes("'")) {
          const parts = user.height.match(/(\d+)'(\d+)"/);
          if (parts && parts.length === 3) {
            setField('height', { unit: 'ft', value: parseFloat(parts[1]) + parseFloat(parts[2]) / 12 });
          }
        }
      }

      // Weight
      if (user.weight) {
        if (user.weight.includes('kg')) {
          setField('weight', { unit: 'kg', value: parseFloat(user.weight) || 70 });
        } else if (user.weight.includes('lbs')) {
          setField('weight', { unit: 'lbs', value: parseFloat(user.weight) || 150 });
        }
      }
    }
  }, [user]);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [activeImageType, setActiveImageType] = useState<'avatar' | 'cover' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // -- Bottom Sheets Refs --
  const genderSheetRef = useRef<BottomSheetRef>(null);
  const heightSheetRef = useRef<BottomSheetRef>(null);
  const weightSheetRef = useRef<BottomSheetRef>(null);
  const activitySheetRef = useRef<BottomSheetRef>(null);
  const interestsSheetRef = useRef<BottomSheetRef>(null);
  const dobSheetRef = useRef<BottomSheetRef>(null);

  // -- Local temporary state for DOB Pickers --
  const [dobDay, setDobDay] = useState(1);
  const [dobMonth, setDobMonth] = useState('January');
  const [dobYear, setDobYear] = useState(2000);

  // -- Local state for Unit Conversions in Pickers --
  // Note: Store keeps height value in cm/ft based on unit.
  // We'll sync with store on open.
  
  // -- Memoized Items for WheelPickers --
  const cmItems = useMemo(() => Array.from({ length: 151 }, (_, i) => 100 + i), []);
  const ftItems = useMemo(() => {
    const items = [];
    for (let f = 3; f <= 8; f++) {
      for (let i = 0; i < 12; i++) {
        items.push(`${f}'${i}"`);
      }
    }
    return items;
  }, []);
  const kgItems = useMemo(() => Array.from({ length: 151 }, (_, i) => 30 + i), []);
  const lbsItems = useMemo(() => Array.from({ length: 331 }, (_, i) => 66 + i), []);

  const dobDays = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const dobMonths = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    [],
  );
  const dobYears = useMemo(
    () => Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i),
    [],
  );

  const snapPoints = useMemo(() => ['50%'], []);

  const { setProfile: setAuthProfile } = useAuthStore();
  const adapters = useAdapters();
  const userService = useMemo(
    () => createUserService(adapters.database, adapters.storage),
    [adapters],
  );

  const handlePickImage = async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'avatar') {
        setField('avatarUri', result.assets[0].uri);
      } else {
        setField('coverUri', result.assets[0].uri);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let finalAvatarUrl: string | undefined = user.avatarUrl || undefined;
      let finalCoverUrl: string | undefined = user.coverImage || undefined;

      if (avatarUri !== user.avatarUrl) finalAvatarUrl = avatarUri;
      if (coverUri !== user.coverImage) finalCoverUrl = coverUri;

      const heightStr =
        height.unit === 'cm'
          ? `${Math.round(height.value)} cm`
          : `${Math.floor(height.value)}'${Math.round((height.value % 1) * 12)}"`;

      const weightStr = `${Math.round(weight.value)} ${weight.unit}`;

      const updatedUser = await userService.updateProfile(user.id, {
        name: name.trim(),
        username: username.trim().toLowerCase(), // normalize username
        location,
        gender,
        height: heightStr,
        weight: weightStr,
        activityTracker,
        bio,
        interests,
        avatarUrl: finalAvatarUrl ? finalAvatarUrl : undefined,
        coverImage: finalCoverUrl ? finalCoverUrl : undefined,
        dateOfBirth: dateOfBirth,
      });

      setAuthProfile(updatedUser);
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // -- Render Helpers --

  const CustomInputRow = ({
    label,
    value,
    onChangeText,
    placeholder,
    isSelector = false,
    onPressSelector,
    ...props
  }: {
    label: string;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder: string;
    isSelector?: boolean;
    onPressSelector?: () => void;
    [key: string]: any;
  }) => (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {isSelector ? (
          <TouchableOpacity 
            style={styles.selectorButton} 
            onPress={onPressSelector}
            activeOpacity={0.7}
          >
            <Text 
              numberOfLines={1} 
              style={[styles.selectorText, !value && { color: colors.text.disabled }]}
            >
              {value || placeholder}
            </Text>
            <ChevronDownIcon size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        ) : (
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            containerStyle={styles.inputComponentContainer}
            inputContainerStyle={styles.inputComponentInner}
            style={styles.inputComponentText}
            placeholderTextColor={colors.text.disabled}
            {...props}
          />
        )}
      </View>
    </View>
  );

  const openImageActionSheet = (type: 'avatar' | 'cover') => {
    setActiveImageType(type);
    setPhotoModalVisible(true);
  };

  return (
    <ScreenContainer keyboardAvoiding={true} keyboardOffset={100}>
      <Header
        title="Update Profile"
        rightElement={
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.background.black} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Cover Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cover Image</Text>
          <View style={styles.coverImageContainer}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={styles.coverPlaceholder}>
                <PhotoIcon size={32} color={colors.text.secondary} />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editIconOverlay}
              onPress={() => openImageActionSheet('cover')}
            >
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <PlusIcon size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dashedDivider} />

        {/* Profile Photo Section */}
        <View style={styles.profilePhotoRow}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{name?.[0]}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.avatarPlusBadge}
              onPress={() => openImageActionSheet('avatar')}
            >
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <PlusIcon size={12} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dashedDivider} />

        {/* Form Fields */}
        <View style={styles.form}>
          <CustomInputRow
            label="Name"
            value={name}
            onChangeText={(v) => setField('name', v)}
            placeholder="Display Name"
          />

          <CustomInputRow
            label="Username"
            value={username}
            onChangeText={(v) => setField('username', v)}
            placeholder="username"
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Location"
            value={location}
            placeholder="Select Location"
            isSelector
            onPressSelector={() => router.push('/settings/location-picker')}
          />

          <View style={styles.dashedDivider} />

          {/* Date of Birth */}
          <CustomInputRow
            label="Date of Birth"
            value={dateOfBirth}
            placeholder="DD / MM / YYYY"
            isSelector
            onPressSelector={() => {
              // Parse current DOB for pickers
              const parts = dateOfBirth.split('/').map(p => p.trim());
              if (parts.length === 3) {
                setDobDay(parseInt(parts[0], 10));
                const monthIndex = parseInt(parts[1], 10) - 1;
                setDobMonth(dobMonths[monthIndex] || 'January');
                setDobYear(parseInt(parts[2], 10));
              }
              dobSheetRef.current?.scrollTo(-400);
            }}
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Gender"
            value={gender}
            placeholder="Select"
            isSelector
            onPressSelector={() => genderSheetRef.current?.scrollTo(-300)}
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Height"
            value={
              height.unit === 'cm'
                ? `${Math.round(height.value)} cm`
                : `${Math.floor(height.value)}'${Math.round((height.value % 1) * 12)}"`
            }
            placeholder="Select"
            isSelector
            onPressSelector={() => heightSheetRef.current?.scrollTo(-400)}
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Weight"
            value={`${Math.round(weight.value)} ${weight.unit}`}
            placeholder="Select"
            isSelector
            onPressSelector={() => weightSheetRef.current?.scrollTo(-400)}
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Activity Tracker"
            value={activityTracker}
            placeholder="Select"
            isSelector
            onPressSelector={() => activitySheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2)}
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Interests"
            value={interests.length > 0 ? `${interests.length} selected` : ''}
            placeholder="Select Interests"
            isSelector
            onPressSelector={() => interestsSheetRef.current?.scrollTo(-SCREEN_HEIGHT + 100)}
          />

          <View style={styles.dashedDivider} />

          <Input
            label="Bio"
            value={bio}
            onChangeText={(v) => setField('bio', v)}
            placeholder="Write a short bio..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            containerStyle={{ marginTop: spacing.sm }}
            inputContainerStyle={{
              backgroundColor: '#111',
              borderColor: '#333',
              borderRadius: 16,
              height: 100,
              alignItems: 'flex-start',
              paddingTop: spacing.sm,
            }}
            style={{ 
                color: colors.text.primary,
                ...typography.presets.bodyMedium,
                height: '100%',
                paddingTop: 0,
            }}
          />
        </View>

        <View style={{ height: 300 }} />
      </ScrollView>

      {/* -- Sheets -- */}

      {/* Gender Sheet */}
      <BottomSheet ref={genderSheetRef} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Select Gender</Text>
          <View style={styles.pickerContainer}>
            <WheelPicker
              items={['Male', 'Female', 'Other', 'Prefer not to say']}
              selectedValue={gender}
              onValueChange={(v) => setField('gender', String(v))}
              height={200}
            />
          </View>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => genderSheetRef.current?.scrollTo(0)}
          >
            <Text style={styles.sheetButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Height Sheet */}
      <BottomSheet ref={heightSheetRef} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>How tall are you?</Text>
          <View style={styles.toggleContainer}>
            {(['cm', 'ft'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => {
                  if (u !== height.unit) {
                    const newVal = u === 'ft' ? height.value / 30.48 : height.value * 30.48;
                    setField('height', { unit: u, value: newVal });
                  }
                }}
                style={[styles.toggleButton, height.unit === u && styles.activeToggle]}
              >
                <Text style={[styles.toggleText, height.unit === u && styles.activeToggleText]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pickerContainer}>
            {height.unit === 'cm' ? (
              <WheelPicker
                key="cm"
                items={cmItems}
                selectedValue={Math.round(height.value)}
                onValueChange={(v) => setField('height', { ...height, value: Number(v) })}
              />
            ) : (
              <WheelPicker
                key="ft"
                items={ftItems}
                selectedValue={`${Math.floor(height.value)}'${Math.round((height.value % 1) * 12)}"`}
                onValueChange={(val) => {
                  const str = val as string;
                  const [f, i] = str.split("'").map((s) => parseFloat(s.replace(/"/g, '')));
                  setField('height', { ...height, value: f + i / 12 });
                }}
              />
            )}
          </View>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => heightSheetRef.current?.scrollTo(0)}
          >
            <Text style={styles.sheetButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Weight Sheet */}
      <BottomSheet ref={weightSheetRef} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Weight?</Text>
          <View style={styles.toggleContainer}>
            {(['kg', 'lbs'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => {
                  if (u !== weight.unit) {
                    const newVal = u === 'lbs' ? weight.value * 2.20462 : weight.value / 2.20462;
                    setField('weight', { unit: u, value: newVal });
                  }
                }}
                style={[styles.toggleButton, weight.unit === u && styles.activeToggle]}
              >
                <Text style={[styles.toggleText, weight.unit === u && styles.activeToggleText]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pickerContainer}>
            <WheelPicker
              key={weight.unit}
              items={weight.unit === 'kg' ? kgItems : lbsItems}
              selectedValue={Math.round(weight.value)}
              onValueChange={(v) => setField('weight', { ...weight, value: Number(v) })}
            />
          </View>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => weightSheetRef.current?.scrollTo(0)}
          >
            <Text style={styles.sheetButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Activity Sheet */}
      <BottomSheet ref={activitySheetRef} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Activity Tracker</Text>
          <ScrollView style={{ maxHeight: 300, width: '100%' }}>
            {ONBOARDING_ACTIVITY_TRACKERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.sheetOption}
                onPress={() => {
                  setField('activityTracker', item);
                  activitySheetRef.current?.scrollTo(0);
                }}
              >
                <Text
                  style={[
                    styles.sheetOptionText,
                    activityTracker === item && { color: colors.primary },
                  ]}
                >
                  {item}
                </Text>
                {activityTracker === item && <Text style={{ color: colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      {/* Interests Sheet */}
      <BottomSheet ref={interestsSheetRef} snapPoints={snapPoints}>
        <View style={[styles.sheetContent, { paddingBottom: 50 }]}>
          <Text style={styles.sheetTitle}>Select Interests</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
            {ONBOARDING_INTEREST_CATEGORIES.map((category) => (
              <View key={category.title} style={{ marginBottom: spacing.md }}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.chipsContainer}>
                  {category.items.map((item) => {
                    const isSelected = interests.includes(item);
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.chip, isSelected && styles.selectedChip]}
                        onPress={() => toggleInterest(item)}
                      >
                        <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => interestsSheetRef.current?.scrollTo(0)}
          >
            <Text style={styles.sheetButtonText}>Done ({interests.length})</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Date of Birth Sheet */}
      <BottomSheet ref={dobSheetRef} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Date of Birth</Text>
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.sm,
              height: 200,
            }}
          >
            {/* Day */}
            <View style={{ flex: 1 }}>
              <WheelPicker
                items={dobDays}
                selectedValue={dobDay}
                onValueChange={(v) => setDobDay(Number(v))}
              />
            </View>
            {/* Month */}
            <View style={{ flex: 2 }}>
              <WheelPicker
                items={dobMonths}
                selectedValue={dobMonth}
                onValueChange={(v) => setDobMonth(String(v))}
              />
            </View>
            {/* Year */}
            <View style={{ flex: 1.5 }}>
              <WheelPicker
                items={dobYears}
                selectedValue={dobYear}
                onValueChange={(v) => setDobYear(Number(v))}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              const monthNum = dobMonths.indexOf(dobMonth) + 1;
              const formattedDetails = `${String(dobDay).padStart(2, '0')} / ${String(
                monthNum,
              ).padStart(2, '0')} / ${dobYear}`;
              setField('dateOfBirth', formattedDetails);
              dobSheetRef.current?.scrollTo(0);
            }}
          >
            <Text style={styles.sheetButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Photo Actions Modal */}
      <Modal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        title={activeImageType === 'avatar' ? 'Profile Photo' : 'Cover Image'}
        message="What would you like to do?"
        actions={[
          {
            label: 'Update Photo',
            onPress: () => activeImageType && handlePickImage(activeImageType),
          },
          ...((activeImageType === 'avatar' ? !!avatarUri : !!coverUri) ? [{
            label: 'Remove Photo',
            variant: 'destructive' as const,
            onPress: () => {
              if (activeImageType === 'avatar') setField('avatarUri', undefined);
              else setField('coverUri', undefined);
            },
          }] : []),
          {
            label: 'Cancel',
            variant: 'cancel' as const,
            onPress: () => {},
          },
        ]}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  coverImageContainer: {
    height: 300,
    width: '100%',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: '#333',
    padding: spacing.xs,
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  profilePhotoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.text.secondary,
    fontSize: 20,
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#333',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  dashedDivider: {
    height: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  form: {
    gap: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  inputLabel: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
  },
  inputWrapper: {
    flex: 1.5,
  },
  inputComponentContainer: {
    marginBottom: 0,
  },
  inputComponentInner: {
    height: 48,
    backgroundColor: '#111',
    borderColor: '#333',
    borderRadius: 16,
  },
  inputComponentText: {
    textAlign: 'right',
    ...typography.presets.bodyMedium,
  },
  selectorButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectorText: {
    ...typography.presets.bodyMedium,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
    marginRight: spacing.xs,
  },
  saveButton: {
    backgroundColor: '#ADFA1D',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    ...typography.presets.bodySmall,
    fontWeight: '800',
    color: 'black',
    textTransform: 'none',
  },
  disabledButton: {
    opacity: 0.7,
  },

  // Sheet Styles
  sheetContent: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  sheetTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  pickerContainer: {
    height: 200,
    width: '100%',
    marginBottom: spacing.lg,
  },
  sheetButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 25,
    marginTop: spacing.md,
  },
  sheetButtonText: {
    ...typography.presets.bodyLarge,
    fontWeight: 'bold',
    color: colors.background.default,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.input,
    borderRadius: 20,
    padding: 4,
    marginBottom: spacing.md,
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  activeToggle: {
    backgroundColor: colors.background.card,
  },
  toggleText: {
    ...typography.presets.caption,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeToggleText: {
    color: colors.text.primary,
  },
  sheetOption: {
    width: '100%',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetOptionText: {
    ...typography.presets.bodyLarge,
    color: colors.text.primary,
  },
  // Chips
  categoryTitle: {
    ...typography.presets.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.background.input,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.presets.bodySmall,
    color: colors.text.secondary,
  },
  selectedChipText: {
    color: colors.background.default,
    fontWeight: '600',
  },
});
