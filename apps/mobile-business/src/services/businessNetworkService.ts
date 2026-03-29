const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface NetworkStatusResponse {
  businessId: string;
  isConnectedToNetwork: boolean;
  isActive: boolean;
}

const parseJson = async (response: Response) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.message || 'Error consultando red OneD Hub');
  }
  return payload;
};

export const businessNetworkService = {
  async getNetworkStatus(businessId?: string): Promise<NetworkStatusResponse> {
    const query = businessId ? `?businessId=${encodeURIComponent(businessId)}` : '';
    const response = await fetch(`${API_URL}/v1/businesses/network-status${query}`);
    const payload = await parseJson(response);
    return payload.data;
  },

  async updateNetworkStatus(businessId: string, isConnectedToNetwork: boolean): Promise<NetworkStatusResponse> {
    const response = await fetch(`${API_URL}/v1/businesses/${businessId}/network-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isConnectedToNetwork }),
    });
    const payload = await parseJson(response);
    return payload.data;
  },
};
