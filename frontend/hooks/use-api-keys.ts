"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface APIKey {
  id: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
}

interface APIKeyCreated {
  id: string;
  name: string;
  key: string;
}

interface APIKeyListResponse {
  items: APIKey[];
  total: number;
}

export function useAPIKeys(kbId: string) {
  return useQuery<APIKeyListResponse>({
    queryKey: ["api-keys", kbId],
    queryFn: async () => {
      const res = await api.get(`/v1/kb/${kbId}/keys`);
      return res.data;
    },
    enabled: !!kbId,
  });
}

export function useCreateAPIKey(kbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(`/v1/kb/${kbId}/keys`, { name });
      return res.data as APIKeyCreated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", kbId] });
    },
  });
}

export function useRevokeAPIKey(kbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string) => {
      await api.delete(`/v1/kb/${kbId}/keys/${keyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys", kbId] });
    },
  });
}
