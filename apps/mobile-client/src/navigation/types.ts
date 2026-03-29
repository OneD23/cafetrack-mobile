import { BusinessItem } from '../types/superApp';

export type MainTabsParamList = {
  InicioTab: undefined;
  PedidosTab: undefined;
  PerfilTab: undefined;
  ServiciosTab: undefined;
};

export type RootStackParamList = {
  AuthLogin: undefined;
  AuthRegister: undefined;
  MainTabs: undefined;
  BusinessList: undefined;
  BusinessDetail: { business: BusinessItem };
  Cart: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
  BusinessOwnerForm: undefined;
};
