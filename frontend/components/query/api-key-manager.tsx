"use client";

import { useState } from "react";
import { Copy, Key, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAPIKeys, useCreateAPIKey } from "@/hooks/use-api-keys";

interface APIKeyManagerProps {
  kbId: string;
  selectedKey: string;
  onSelectKey: (key: string) => void;
}

export function APIKeyManager({ kbId, selectedKey, onSelectKey }: APIKeyManagerProps) {
  const { data } = useAPIKeys(kbId);
  const createKey = useCreateAPIKey(kbId);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    const result = await createKey.mutateAsync(newKeyName.trim());
    setCreatedKey(result.key);
    onSelectKey(result.key);
    setNewKeyName("");
    setShowCreate(false);
    toast.success("API key created successfully");
  };

  const copyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      toast.success("Key copied to clipboard");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-text-secondary">
          <Key className="h-4 w-4" />
          API Key
        </h3>
        {!showCreate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreate(true)}
            className="text-accent"
          >
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        )}
      </div>

      {createdKey && (
        <div className="rounded-md bg-success/10 p-2">
          <p className="text-xs text-success mb-1">Key created! Save it now — it won&apos;t be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate text-xs text-text-primary font-mono">
              {createdKey}
            </code>
            <Button variant="ghost" size="icon" onClick={copyKey} className="h-6 w-6">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="flex gap-2">
          <Input
            placeholder="Key name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="border-border bg-surface-2 text-sm text-text-primary"
          />
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={createKey.isPending}
            className="bg-accent text-white"
          >
            Create
          </Button>
        </div>
      )}

      {selectedKey && (
        <p className="text-xs text-text-muted">
          Using: <span className="font-mono">{selectedKey.slice(0, 12)}...</span>
        </p>
      )}

      {data && data.items.length > 0 && !selectedKey && !createdKey && (
        <p className="text-xs text-warning">
          Create an API key to start querying
        </p>
      )}
    </div>
  );
}
