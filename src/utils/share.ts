export function encodeToBase64Url(str: string): string {
  try {
    const utf8 = encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16)),
    );
    const b64 = btoa(utf8);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeFromBase64Url(base64Url: string): string {
  try {
    const b64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

export function encodeSharePayload<T>(payload: T): string {
  try {
    const json = JSON.stringify(payload);
    return encodeToBase64Url(json);
  } catch {
    return '';
  }
}

export function decodeSharePayload<T>(encoded: string, fallback?: T): T | null {
  try {
    const decoded = decodeFromBase64Url(encoded);
    if (!decoded) return fallback || null;
    return JSON.parse(decoded) as T;
  } catch {
    return fallback || null;
  }
}

export interface TimelineShareData {
  project: {
    groomName: string;
    brideName: string;
    coupleName: string;
    weddingDate: string;
    location: string;
  };
  timeline: Array<{
    id: string;
    time: string;
    title: string;
    location: string;
    description?: string;
    vendorIds?: string[];
    responsibleType: 'collaborator' | 'vendor' | 'both';
    vendorConfirmations?: Array<{
      vendorId: string;
      status: string;
      confirmedAt?: string;
      contactPerson?: string;
      contactPhone?: string;
      note?: string;
    }>;
  }>;
  vendors: Array<{
    id: string;
    name: string;
    category: string;
    avatar: string;
  }>;
  createdAt: string;
  sig?: string;
}
