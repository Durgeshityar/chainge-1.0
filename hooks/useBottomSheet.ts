import { BottomSheetRef } from '@/components/ui/BottomSheet';
import { useCallback, useRef } from 'react';

export const useBottomSheet = () => {
  const ref = useRef<BottomSheetRef>(null);

  const expand = useCallback(() => {
    ref.current?.scrollTo(-500); // Placeholder value, needs dynamic height logic
  }, []);

  const collapse = useCallback(() => {
    ref.current?.scrollTo(0);
  }, []);

  const snapTo = useCallback((destination: number) => {
    ref.current?.scrollTo(destination);
  }, []);

  return { ref, expand, collapse, snapTo };
};
