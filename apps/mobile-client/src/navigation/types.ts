export type MainTabsParamList = {
  InicioTab: undefined;
  PedidosTab: undefined;
  PerfilTab: undefined;
};

export type RootStackParamList = {
  AuthLogin: undefined;
  AuthRegister: undefined;
  MainTabs: undefined;
  BusinessList: undefined;
  BusinessDetail: { businessId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
};
