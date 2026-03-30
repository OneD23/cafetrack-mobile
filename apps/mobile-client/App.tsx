import React from 'react';
import { Provider } from 'react-redux';
import { View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/store';
import { restoreClientSession } from './src/store/superAuthSlice';
import { restoreSession } from './src/store/authSlice';
import { theme } from './src/theme/theme';

function Bootstrap() {
  React.useEffect(() => {
    store.dispatch(restoreClientSession() as any);
    store.dispatch(restoreSession() as any);
  }, []);

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Bootstrap />
      </View>
    </Provider>
  );
}
