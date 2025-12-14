import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
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
import { WheelPicker } from '@/components/ui/WheelPicker';

import { useAdapters } from '@/hooks/useAdapter';
import { useAuth } from '@/hooks/useAuth';
import { ONBOARDING_ACTIVITY_TRACKERS, ONBOARDING_INTEREST_CATEGORIES } from '@/lib/constants';
import { createUserService } from '@/services/users';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { setProfile: setAuthProfile } = useAuthStore();
  const adapters = useAdapters();
  const userService = useMemo(
    () => createUserService(adapters.database, adapters.storage),
    [adapters],
  );

  const [isLoading, setIsLoading] = useState(false);

  // -- Form State --
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [location, setLocation] = useState('');

  // Date of Birth
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDay, setDobDay] = useState(1);
  const [dobMonth, setDobMonth] = useState('January');
  const [dobYear, setDobYear] = useState(2000);

  // Image Actions
  const [activeImageType, setActiveImageType] = useState<'avatar' | 'cover' | null>(null);

  // Gender
  const [gender, setGender] = useState('');

  // Height (Stored as plain number and unit for editor state)
  const [heightValue, setHeightValue] = useState(170);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

  // Weight
  const [weightValue, setWeightValue] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Activity Tracker
  const [activityTracker, setActivityTracker] = useState('');

  // Bio
  const [bio, setBio] = useState('');

  // Interests
  const [interests, setInterests] = useState<string[]>([]);

  // Images
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  // -- Bottom Sheets Refs --
  const genderSheetRef = useRef<BottomSheetRef>(null);
  const heightSheetRef = useRef<BottomSheetRef>(null);
  const weightSheetRef = useRef<BottomSheetRef>(null);
  const activitySheetRef = useRef<BottomSheetRef>(null);
  const interestsSheetRef = useRef<BottomSheetRef>(null);
  const dobSheetRef = useRef<BottomSheetRef>(null);
  const imageActionSheetRef = useRef<BottomSheetRef>(null);

  // -- Memoized Items to prevent Picker Reset --
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

  // Initialize state from User
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');

      setLocation(user.location || '');
      setGender(user.gender || '');
      setBio(user.bio || '');

      const dob = user.age ? '' : user.dateOfBirth || '01 / 01 / 2000'; // Fallback or parsed
      setDateOfBirth(dob);

      // Parse DOB for Picker
      if (dob) {
        const parts = dob.split('/').map((p) => p.trim());
        if (parts.length === 3) {
          setDobDay(parseInt(parts[0], 10));
          const monthIndex = parseInt(parts[1], 10) - 1;
          const months = [
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
          ];
          setDobMonth(months[monthIndex] || 'January');
          setDobYear(parseInt(parts[2], 10));
        }
      }

      setActivityTracker(user.activityTracker || '');
      setInterests(user.interests || []);

      setAvatarUri(user.avatarUrl);
      setCoverUri(user.coverImage || null);

      // Parse Height string "180 cm" or "5'11""
      if (user.height) {
        if (user.height.includes('cm')) {
          setHeightUnit('cm');
          setHeightValue(parseFloat(user.height) || 170);
        } else if (user.height.includes("'")) {
          setHeightUnit('ft');
          const parts = user.height.match(/(\d+)'(\d+)"/);
          if (parts && parts.length === 3) {
            const feet = parseFloat(parts[1]);
            const inches = parseFloat(parts[2]);
            setHeightValue(feet + inches / 12);
          } else {
            setHeightValue(5.5);
          }
        }
      }

      // Parse Weight string "70 kg"
      if (user.weight) {
        if (user.weight.includes('kg')) {
          setWeightUnit('kg');
          setWeightValue(parseFloat(user.weight) || 70);
        } else if (user.weight.includes('lbs')) {
          setWeightUnit('lbs');
          setWeightValue(parseFloat(user.weight) || 150);
        }
      }
    }
  }, [user]);

  // -- Handlers --

  const handlePickImage = async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'avatar') {
        setAvatarUri(result.assets[0].uri);
      } else {
        setCoverUri(result.assets[0].uri);
      }
    }
  };

  const handleDobChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    let truncated = cleaned.slice(0, 8); // Max 8 digits (DDMMYYYY)

    // Validation Logic
    if (truncated.length >= 2) {
      const day = parseInt(truncated.slice(0, 2), 10);
      if (day > 31) truncated = '31' + truncated.slice(2);
      if (day === 0) truncated = '01' + truncated.slice(2);
    }

    if (truncated.length >= 4) {
      const month = parseInt(truncated.slice(2, 4), 10);
      if (month > 12) truncated = truncated.slice(0, 2) + '12' + truncated.slice(4);
      if (month === 0) truncated = truncated.slice(0, 2) + '01' + truncated.slice(4);
    }

    let formatted = truncated;
    if (truncated.length > 4) {
      formatted = `${truncated.slice(0, 2)} / ${truncated.slice(2, 4)} / ${truncated.slice(4)}`;
    } else if (truncated.length > 2) {
      formatted = `${truncated.slice(0, 2)} / ${truncated.slice(2)}`;
    }

    setDateOfBirth(formatted);
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      return [...prev, interest];
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      let finalAvatarUrl = user.avatarUrl;
      let finalCoverUrl = user.coverImage;

      if (avatarUri !== user.avatarUrl) finalAvatarUrl = avatarUri;
      if (coverUri !== user.coverImage) finalCoverUrl = coverUri;

      const heightStr =
        heightUnit === 'cm'
          ? `${Math.round(heightValue)} cm`
          : `${Math.floor(heightValue)}'${Math.round((heightValue % 1) * 12)}"`;

      const weightStr = `${Math.round(weightValue)} ${weightUnit}`;

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
        // age: calculate from DOB if possible
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
  }: {
    label: string;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder: string;
    isSelector?: boolean;
    onPressSelector?: () => void;
  }) => (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        {isSelector ? (
          <TouchableOpacity style={styles.selectorButton} onPress={onPressSelector}>
            <Text style={styles.selectorText}>{value || placeholder}</Text>
            <ChevronDownIcon size={16} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            containerStyle={styles.customInputContainer}
            inputContainerStyle={styles.transparentInputContainer}
            style={styles.customInput}
            placeholderTextColor={colors.text.disabled}
          />
        )}
      </View>
    </View>
  );

  const openImageActionSheet = (type: 'avatar' | 'cover') => {
    setActiveImageType(type);
    imageActionSheetRef.current?.scrollTo(-SCREEN_HEIGHT / 2); // open at roughly 50%
  };

  const handleImageAction = async (action: 'update' | 'remove') => {
    if (!activeImageType) return;

    imageActionSheetRef.current?.scrollTo(0);

    if (action === 'remove') {
      if (activeImageType === 'avatar') {
        setAvatarUri(null);
      } else {
        setCoverUri(null);
      }
    } else {
      // Update
      await handlePickImage(activeImageType);
    }

    setActiveImageType(null);
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
          <TouchableOpacity
            style={styles.coverImageContainer}
            onPress={() => openImageActionSheet('cover')}
          >
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={styles.coverPlaceholder}>
                <PhotoIcon size={32} color={colors.text.secondary} />
              </View>
            )}
            <BlurView intensity={20} tint="dark" style={styles.editIconOverlay}>
              <PlusIcon size={16} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>

        <View style={styles.dashedDivider} />

        {/* Profile Photo Section */}
        <View style={styles.profilePhotoRow}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <TouchableOpacity onPress={() => openImageActionSheet('avatar')}>
            <View style={styles.avatarContainer}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{name?.[0]}</Text>
                </View>
              )}
              <BlurView intensity={20} tint="dark" style={styles.avatarPlusBadge}>
                <PlusIcon size={12} color="white" />
              </BlurView>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.dashedDivider} />

        {/* Form Fields */}
        <View style={styles.form}>
          <CustomInputRow
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Display Name"
          />

          <CustomInputRow
            label="Username"
            value={username}
            onChangeText={setUsername}
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

          {/* Date of Birth - Custom masking input */}
          <CustomInputRow
            label="Date of Birth"
            value={dateOfBirth}
            placeholder="DD / MM / YYYY"
            isSelector
            onPressSelector={() => dobSheetRef.current?.scrollTo(-400)}
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
              heightUnit === 'cm'
                ? `${Math.round(heightValue)} cm`
                : `${Math.floor(heightValue)}'${Math.round((heightValue % 1) * 12)}"`
            }
            placeholder="Select"
            isSelector
            onPressSelector={() => heightSheetRef.current?.scrollTo(-400)}
          />

          <View style={styles.dashedDivider} />

          <CustomInputRow
            label="Weight"
            value={`${Math.round(weightValue)} ${weightUnit}`}
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
            onChangeText={setBio}
            placeholder="Write a short bio..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            containerStyle={{ marginTop: spacing.sm }}
            inputContainerStyle={{
              ...styles.transparentInputContainer,
              height: 100,
              alignItems: 'flex-start',
            }}
            style={{ ...styles.customInput, height: '100%' }}
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
              onValueChange={setGender}
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
                  // Conversion logic
                  if (u !== heightUnit) {
                    const newVal = u === 'ft' ? heightValue / 30.48 : heightValue * 30.48;
                    setHeightValue(newVal);
                    setHeightUnit(u);
                  }
                }}
                style={[styles.toggleButton, heightUnit === u && styles.activeToggle]}
              >
                <Text style={[styles.toggleText, heightUnit === u && styles.activeToggleText]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pickerContainer}>
            {heightUnit === 'cm' ? (
              <WheelPicker
                key="cm"
                items={cmItems}
                selectedValue={Math.round(heightValue)}
                onValueChange={(v) => setHeightValue(Number(v))}
              />
            ) : (
              <WheelPicker
                key="ft"
                items={ftItems}
                selectedValue={`${Math.floor(heightValue)}'${Math.round((heightValue % 1) * 12)}"`}
                onValueChange={(val) => {
                  const str = val as string;
                  const [f, i] = str.split("'").map((s) => parseFloat(s));
                  setHeightValue(f + i / 12);
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
                  // Conversion logic
                  if (u !== weightUnit) {
                    const newVal = u === 'lbs' ? weightValue * 2.20462 : weightValue / 2.20462;
                    setWeightValue(newVal);
                    setWeightUnit(u);
                  }
                }}
                style={[styles.toggleButton, weightUnit === u && styles.activeToggle]}
              >
                <Text style={[styles.toggleText, weightUnit === u && styles.activeToggleText]}>
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.pickerContainer}>
            <WheelPicker
              key={weightUnit}
              items={weightUnit === 'kg' ? kgItems : lbsItems}
              selectedValue={Math.round(weightValue)}
              onValueChange={(v) => setWeightValue(Number(v))}
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
                  setActivityTracker(item);
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
              const months = dobMonths;
              const monthNum = months.indexOf(dobMonth) + 1;
              const formattedDetails = `${String(dobDay).padStart(2, '0')} / ${String(
                monthNum,
              ).padStart(2, '0')} / ${dobYear}`;
              setDateOfBirth(formattedDetails);
              dobSheetRef.current?.scrollTo(0);
            }}
          >
            <Text style={styles.sheetButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Image Action Sheet */}
      <BottomSheet ref={imageActionSheetRef} snapPoints={snapPoints}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
            {activeImageType === 'avatar' ? 'Profile Photo' : 'Cover Image'}
          </Text>
          <TouchableOpacity
            style={[styles.sheetOption, { justifyContent: 'center' }]}
            onPress={() => handleImageAction('update')}
          >
            <Text style={styles.sheetOptionText}>Update Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetOption, { justifyContent: 'center' }]}
            onPress={() => handleImageAction('remove')}
          >
            <Text style={[styles.sheetOptionText, { color: '#EF4444' }]}>Remove Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetButton, { backgroundColor: '#333', marginTop: spacing.sm }]}
            onPress={() => {
              setActiveImageType(null);
              imageActionSheetRef.current?.scrollTo(0);
            }}
          >
            <Text style={[styles.sheetButtonText, { color: 'white' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
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
    minHeight: 48,
  },
  inputLabel: {
    ...typography.presets.bodyMedium,
    color: colors.text.secondary,
    flex: 1,
  },
  inputWrapper: {
    flex: 2,
    alignItems: 'flex-end',
  },
  customInputContainer: {
    marginBottom: 0,
    width: '100%',
  },
  transparentInputContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    alignItems: 'flex-end',
  },
  customInput: {
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'right',
    paddingRight: spacing.md,
    color: colors.text.primary,
    width: '100%',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 120,
    justifyContent: 'flex-end',
    gap: 8,
  },
  selectorText: {
    color: colors.text.primary,
    ...typography.presets.bodyMedium,
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
