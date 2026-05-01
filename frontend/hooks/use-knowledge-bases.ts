"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface KnowledgeBase {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  qdrant_collection: string;
  doc_count: number;
  chunk_count: number;
  total_tokens: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface KBListResponse {
  items: KnowledgeBase[];
  total: number;
}

export function useKnowledgeBases() {
  return useQuery<KBListResponse>({
    queryKey: ["knowledge-bases"],
    queryFn: async () => {
      const res = await api.get("/v1/kb");
      return res.data;
    },
  });
}

export function useKnowledgeBase(id: string) {
  return useQuery<KnowledgeBase>({
    queryKey: ["knowledge-base", id],
    queryFn: async () => {
      const res = await api.get(`/v1/kb/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateKB() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const res = await api.post("/v1/kb", data);
      return res.data as KnowledgeBase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}

export function useDeleteKB() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/v1/kb/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-bases"] });
    },
  });
}
