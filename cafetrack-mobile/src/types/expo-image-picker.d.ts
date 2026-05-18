declare module 'expo-image-picker' {
  export const MediaTypeOptions: {
    Images: any;
  };

  export function requestMediaLibraryPermissionsAsync(): Promise<{
    granted: boolean;
  }>;

  export function launchImageLibraryAsync(options?: any): Promise<{
    canceled: boolean;
    assets?: Array<{
      base64?: string;
      mimeType?: string;
    }>;
  }>;
}
