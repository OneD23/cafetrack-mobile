import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { api } from '../api/client';

const ReportsScreen: React.FC = () => {
  const [tab, setTab] = useState<'stats' | 'invoices' | 'reports' | 'fiscal'>('stats');
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'day' | 'month' | 'year'>('day');
  const [filterValue, setFilterValue] = useState(new Date().toISOString().slice(0, 10));
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [fiscalConfig, setFiscalConfig] = useState({
    businessName: 'CafeTrack',
    taxId: '',
    fiscalAddress: '',
    taxRate: '16',
  });

  const ingredients = useSelector((state: any) => state.inventory?.ingredients || []);

  const buildRange = () => {
    const now = new Date();
    if (filterType === 'day') {
      const day = filterValue || now.toISOString().slice(0, 10);
      const start = new Date(`${day}T00:00:00`);
      const end = new Date(`${day}T23:59:59`);
      return { start, end };
    }

    if (filterType === 'month') {
      const month = filterValue || now.toISOString().slice(0, 7);
      const [year, m] = month.split('-').map(Number);
      const start = new Date(year, (m || 1) - 1, 1, 0, 0, 0);
      const end = new Date(year, (m || 1), 0, 23, 59, 59);
      return { start, end };
    }

    const year = Number(filterValue || new Date().getFullYear());
    const start = new Date(year, 0, 1, 0, 0, 0);
    const end = new Date(year, 11, 31, 23, 59, 59);
    return { start, end };
  };

  const loadSales = async () => {
    try {
      setLoading(true);
      const { start, end } = buildRange();
      const response = await api.getSales({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: '1000',
      });
      setSales(response?.data || []);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'No se pudieron cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [filterType, filterValue]);

  const accountingSummary = useMemo(() => {
    return sales.reduce(
      (acc: any, sale: any) => {
        acc.invoices += 1;
        acc.subtotal += Number(sale.subtotal || 0);
        acc.tax += Number(sale.tax || 0);
        acc.discount += Number(sale.discount?.amount || 0);
        acc.total += Number(sale.total || 0);
        const key = sale.paymentMethod || 'unknown';
        acc.byMethod[key] = (acc.byMethod[key] || 0) + Number(sale.total || 0);
        return acc;
      },
      { invoices: 0, subtotal: 0, tax: 0, discount: 0, total: 0, byMethod: {} as Record<string, number> }
    );
  }, [sales]);

  const inventoryValue = ingredients.reduce(
    (sum: number, ing: any) => sum + Number(ing.stock || 0) * Number(ing.costPerUnit || 0),
    0
  );

  const printAccountingReport = () => {
    const { start, end } = buildRange();
    const report = [
      '📘 REPORTE CONTABLE DEL DÍA',
      `Periodo: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      `Facturas emitidas: ${accountingSummary.invoices}`,
      `Subtotal: $${accountingSummary.subtotal.toFixed(2)}`,
      `Descuentos: $${accountingSummary.discount.toFixed(2)}`,
      `Impuestos: $${accountingSummary.tax.toFixed(2)}`,
      `Total: $${accountingSummary.total.toFixed(2)}`,
      `Valor de inventario: $${inventoryValue.toFixed(2)}`,
      '--- Métodos de pago ---',
      ...Object.entries(accountingSummary.byMethod).map(
        ([method, amount]) => `${method}: $${Number(amount).toFixed(2)}`
      ),
    ].join('\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const win = window.open('', '_blank', 'width=450,height=700');
      if (win) {
        win.document.write(`<pre style="font-family: monospace; font-size: 13px; padding: 16px;">${report}</pre>`);
        win.document.close();
        win.focus();
        win.print();
        return;
      }
    }

    Alert.alert('Reporte contable', report);
  };

  const printInvoice = (sale: any) => {
    const text = [
      `Factura #${sale.saleId}`,
      `Fecha: ${new Date(sale.createdAt).toLocaleString()}`,
      `Cliente: ${sale.customer?.name || sale.customerId?.name || 'Consumidor final'}`,
      '----------------------',
      ...(sale.items || []).map(
        (item: any) =>
          `${item.quantity} x ${item.product?.name || 'Producto'}  $${Number(item.total || 0).toFixed(2)}`
      ),
      '----------------------',
      `Subtotal: $${Number(sale.subtotal || 0).toFixed(2)}`,
      `Descuento: $${Number(sale.discount?.amount || 0).toFixed(2)}`,
      `Impuesto: $${Number(sale.tax || 0).toFixed(2)}`,
      `Total: $${Number(sale.total || 0).toFixed(2)}`,
    ].join('\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const win = window.open('', '_blank', 'width=420,height=700');
      if (win) {
        win.document.write(`<pre style="font-family: monospace; font-size: 13px; padding: 16px;">${text}</pre>`);
        win.document.close();
        win.focus();
        win.print();
        return;
      }
    }
    Alert.alert('Factura', text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>💼 Contabilidad</Text>

      <View style={styles.tabs}>
        {[
          { id: 'stats', label: 'Estadísticas' },
          { id: 'invoices', label: 'Facturas' },
          { id: 'reports', label: 'Reportes' },
          { id: 'fiscal', label: 'Config. fiscal' },
        ].map((option: any) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.tabBtn, tab === option.id && styles.tabBtnActive]}
            onPress={() => setTab(option.id)}
          >
            <Text style={[styles.tabText, tab === option.id && styles.tabTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterBox}>
        <View style={styles.filterTypeRow}>
          {(['day', 'month', 'year'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTypeBtn, filterType === f && styles.filterTypeBtnActive]}
              onPress={() => {
                setFilterType(f);
                if (f === 'day') setFilterValue(new Date().toISOString().slice(0, 10));
                if (f === 'month') setFilterValue(new Date().toISOString().slice(0, 7));
                if (f === 'year') setFilterValue(String(new Date().getFullYear()));
              }}
            >
              <Text style={styles.filterTypeText}>
                {f === 'day' ? 'Día' : f === 'month' ? 'Mes' : 'Año'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={filterValue}
          onChangeText={setFilterValue}
          placeholder={filterType === 'day' ? 'YYYY-MM-DD' : filterType === 'month' ? 'YYYY-MM' : 'YYYY'}
          placeholderTextColor="#8b6f4e"
        />
        <TouchableOpacity style={styles.primaryBtn} onPress={loadSales}>
          <Text style={styles.primaryBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
        {tab === 'stats' && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Resumen del día</Text>
            <Text style={styles.line}>Facturas: {accountingSummary.invoices}</Text>
            <Text style={styles.line}>Subtotal: ${accountingSummary.subtotal.toFixed(2)}</Text>
            <Text style={styles.line}>Descuentos: ${accountingSummary.discount.toFixed(2)}</Text>
            <Text style={styles.line}>Impuestos: ${accountingSummary.tax.toFixed(2)}</Text>
            <Text style={styles.line}>Total neto: ${accountingSummary.total.toFixed(2)}</Text>
            <Text style={styles.line}>Inventario valorizado: ${inventoryValue.toFixed(2)}</Text>
          </View>
        )}

        {tab === 'invoices' && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Facturas emitidas hoy</Text>
            {loading ? <Text style={styles.line}>Cargando...</Text> : null}
            {sales.map((sale) => (
              <View key={String(sale.id || sale._id)} style={styles.invoiceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invoiceId}>Factura #{sale.saleId}</Text>
                  <Text style={styles.lineSmall}>
                    Cliente: {sale.customer?.name || sale.customerId?.name || 'Consumidor final'}
                  </Text>
                  <Text style={styles.lineSmall}>
                    {new Date(sale.createdAt).toLocaleString()}
                  </Text>
                </View>
                <Text style={styles.invoiceTotal}>${Number(sale.total || 0).toFixed(2)}</Text>
                <TouchableOpacity
                  style={styles.reprintBtn}
                  onPress={() => setSelectedInvoice(sale)}
                >
                  <Text style={styles.reprintText}>Ver / Reimprimir</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {tab === 'reports' && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Reportes</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={printAccountingReport}>
              <Text style={styles.primaryBtnText}>Imprimir reporte contable del día</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'fiscal' && (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>Configuraciones fiscales</Text>
            <TextInput
              style={styles.input}
              value={fiscalConfig.businessName}
              onChangeText={(v) => setFiscalConfig((s) => ({ ...s, businessName: v }))}
              placeholder="Razón social"
              placeholderTextColor="#8b6f4e"
            />
            <TextInput
              style={styles.input}
              value={fiscalConfig.taxId}
              onChangeText={(v) => setFiscalConfig((s) => ({ ...s, taxId: v }))}
              placeholder="NIT/RFC"
              placeholderTextColor="#8b6f4e"
            />
            <TextInput
              style={styles.input}
              value={fiscalConfig.fiscalAddress}
              onChangeText={(v) => setFiscalConfig((s) => ({ ...s, fiscalAddress: v }))}
              placeholder="Dirección fiscal"
              placeholderTextColor="#8b6f4e"
            />
            <TextInput
              style={styles.input}
              value={fiscalConfig.taxRate}
              onChangeText={(v) => setFiscalConfig((s) => ({ ...s, taxRate: v }))}
              placeholder="Tasa de impuesto (%)"
              placeholderTextColor="#8b6f4e"
              keyboardType="numeric"
            />
            <Text style={styles.lineSmall}>
              Esta configuración se aplica visualmente a los reportes/facturas del módulo.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedInvoice}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvoice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.blockTitle}>
              Factura #{selectedInvoice?.saleId}
            </Text>
            <Text style={styles.lineSmall}>
              Cliente: {selectedInvoice?.customer?.name || selectedInvoice?.customerId?.name || 'Consumidor final'}
            </Text>
            <Text style={styles.lineSmall}>
              {selectedInvoice?.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString() : ''}
            </Text>

            <ScrollView style={{ maxHeight: 220, marginTop: 10 }}>
              {(selectedInvoice?.items || []).map((item: any, idx: number) => (
                <Text key={idx} style={styles.line}>
                  {item.quantity} x {item.product?.name || 'Producto'} - $
                  {Number(item.total || 0).toFixed(2)}
                </Text>
              ))}
            </ScrollView>

            <Text style={styles.line}>Total: ${Number(selectedInvoice?.total || 0).toFixed(2)}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setSelectedInvoice(null)}
              >
                <Text style={styles.secondaryBtnText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => selectedInvoice && printInvoice(selectedInvoice)}
              >
                <Text style={styles.primaryBtnText}>Reimprimir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0f0a', padding: 16 },
  title: { color: '#f5f1e8', fontSize: 26, fontWeight: '700', marginBottom: 10 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  filterBox: { backgroundColor: '#2c1810', borderRadius: 12, padding: 10, marginBottom: 10 },
  filterTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterTypeBtn: {
    backgroundColor: '#1a0f0a',
    borderWidth: 1,
    borderColor: '#4a3428',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterTypeBtnActive: { backgroundColor: '#d4a574', borderColor: '#d4a574' },
  filterTypeText: { color: '#f5f1e8', fontWeight: '700' },
  tabBtn: {
    backgroundColor: '#2c1810',
    borderColor: '#4a3428',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: '#d4a574', borderColor: '#d4a574' },
  tabText: { color: '#8b6f4e', fontWeight: '700' },
  tabTextActive: { color: '#1a0f0a' },
  block: { backgroundColor: '#2c1810', borderRadius: 12, padding: 12, marginBottom: 10 },
  blockTitle: { color: '#f5f1e8', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  line: { color: '#d9c8b1', marginBottom: 6 },
  lineSmall: { color: '#c9b39b', fontSize: 12, marginTop: 2 },
  primaryBtn: { backgroundColor: '#27ae60', borderRadius: 10, padding: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#4a3428',
  },
  invoiceId: { color: '#f5f1e8', fontWeight: '700' },
  invoiceTotal: { color: '#d4a574', fontWeight: '700' },
  reprintBtn: {
    marginLeft: 10,
    backgroundColor: '#1a0f0a',
    borderWidth: 1,
    borderColor: '#4a3428',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  reprintText: { color: '#d4a574', fontSize: 11, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2c1810',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  secondaryBtn: {
    backgroundColor: '#1a0f0a',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#4a3428',
  },
  secondaryBtnText: { color: '#f5f1e8', fontWeight: '700' },
  input: {
    backgroundColor: '#1a0f0a',
    borderColor: '#4a3428',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: '#f5f1e8',
    marginBottom: 8,
  },
});

export default ReportsScreen;
