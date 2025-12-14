import { Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { globalStyles } from '../../theme/styles';

export default function MessagesScreen() {
  return (
    <ScreenContainer>
      <View style={globalStyles.center}>
        <Text style={globalStyles.title}>Messages</Text>
        <Text style={globalStyles.subtitle}>Your conversations and notifications</Text>
      </View>
    </ScreenContainer>
  );
}
