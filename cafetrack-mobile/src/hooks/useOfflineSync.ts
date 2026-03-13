import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import NetInfo from '@react-native-community/netinfo';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useSyncOfflineDataMutation } from '../store/apiSlice';
import { clearQueue, getQueue } from '../store/offlineSlice';

const SYNC_TASK = 'background-sync';

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    const queue = await AsyncStorage.getItem('offlineQueue');
    if (queue) {
      const items = JSON.parse(queue);
      // Sincronizar con API
      return items.length > 0 ? BackgroundFetch.BackgroundFetchResult.NewData 
                              : BackgroundFetch.BackgroundFetchResult.NoData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const useOfflineSync = () => {
  const dispatch = useDispatch();
  const queue = useSelector(getQueue);
  const [syncData] = useSyncOfflineDataMutation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && queue.length > 0) {
        syncOfflineQueue();
      }
    });

    // Registrar background task
    BackgroundFetch.registerTaskAsync(SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutos
      stopOnTerminate: false,
      startOnBoot: true,
    });

    return () => unsubscribe();
  }, [queue]);

  const syncOfflineQueue = useCallback(async () => {
    try {
      const result = await syncData({ operations: queue }).unwrap();
      dispatch(clearQueue());
      return result;
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }, [queue, syncData, dispatch]);

  return { syncOfflineQueue, pendingCount: queue.length };
};