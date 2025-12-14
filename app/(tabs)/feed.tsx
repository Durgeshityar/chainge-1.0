import { Text, View } from 'react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { globalStyles } from '../../theme/styles';

export default function FeedScreen() {
  return (
    <ScreenContainer>
      <View style={globalStyles.center}>
        <Text style={globalStyles.title}>Feed</Text>
        <Text style={globalStyles.subtitle}>See what your friends are up to</Text>
      </View>
    </ScreenContainer>
  );
}
