import React from 'react';
import { Provider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { store } from './src/store';
import { restoreClientSession } from './src/store/superAuthSlice';

function Bootstrap() {
  React.useEffect(() => {
    store.dispatch(restoreClientSession() as any);
  }, []);

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <Bootstrap />
    </Provider>
  );
}
