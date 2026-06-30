"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react";
import {
  createApiKeyAction,
  revokeApiKeyAction,
} from "@/app/dashboard/api-keys/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export interface ApiKeyListItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export function ApiKeysManager({
  initialKeys,
}: {
  initialKeys: ApiKeyListItem[];
}) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setNewKey(null);
    const res = await createApiKeyAction({ name });
    if (res.ok) {
      setNewKey(res.data.plaintext);
      setName("");
    } else {
      setError(res.error);
    }
    setCreating(false);
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create API key</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="keyName">Key name</Label>
              <Input
                id="keyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Production server"
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create key
            </Button>
          </form>

          {error && (
            <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {newKey && (
            <div className="mt-4 rounded-md border border-success/40 bg-success/5 p-4">
              <p className="text-sm font-medium">
                Copy your key now — it won't be shown again.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded bg-muted px-3 py-2 text-sm">
                  {newKey}
                </code>
                <Button type="button" variant="outline" size="sm" onClick={copyKey}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your API keys</CardTitle>
        </CardHeader>
        <CardContent>
          {initialKeys.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <KeyRound className="h-6 w-6" />
              <p className="text-sm">No API keys yet.</p>
            </div>
          ) : (
            <ul className="divide-y">
              {initialKeys.map((key) => (
                <li key={key.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      {key.revokedAt ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {key.prefix}••••••••
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(key.createdAt)}
                      {key.lastUsedAt
                        ? ` · last used ${formatDate(key.lastUsedAt)}`
                        : " · never used"}
                    </p>
                  </div>
                  {!key.revokedAt && (
                    <RevokeButton id={key.id} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RevokeButton({ id }: { id: string }) {
  const [revoking, setRevoking] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={revoking}
      onClick={async () => {
        setRevoking(true);
        await revokeApiKeyAction(id);
        setRevoking(false);
      }}
    >
      {revoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Revoke
    </Button>
  );
}
