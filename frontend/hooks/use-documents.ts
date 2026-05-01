"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Document {
  id: string;
  kb_id: string;
  name: string;
  source_type: string;
  source_path: string | null;
  file_size: number | null;
  chunk_count: number;
  token_count: number;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface DocumentListResponse {
  items: Document[];
  total: number;
}

export function useDocuments(kbId: string) {
  const query = useQuery<DocumentListResponse>({
    queryKey: ["documents", kbId],
    queryFn: async () => {
      const res = await api.get(`/v1/kb/${kbId}/documents`);
      return res.data;
    },
    enabled: !!kbId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const hasProcessing = data.items.some(
        (doc) => doc.status === "pending" || doc.status === "processing"
      );
      return hasProcessing ? 2000 : false;
    },
  });

  return query;
}

export function useUploadDocument(kbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/v1/kb/${kbId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", kbId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", kbId] });
    },
  });
}

export function useSubmitURL(kbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (url: string) => {
      const res = await api.post(`/v1/kb/${kbId}/documents/url`, { url });
      return res.data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", kbId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", kbId] });
    },
  });
}

export function useDeleteDocument(kbId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string) => {
      await api.delete(`/v1/kb/${kbId}/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", kbId] });
      queryClient.invalidateQueries({ queryKey: ["knowledge-base", kbId] });
    },
  });
}
