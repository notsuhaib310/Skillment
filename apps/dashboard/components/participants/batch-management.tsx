import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Trash2, Plus } from "lucide-react";

// Placeholder participants data
const allParticipants = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Alice Brown", email: "alice@example.com" },
  { id: "4", name: "Bob Lee", email: "bob@example.com" },
];

export function BatchManagement() {
  const [batches, setBatches] = useState([
    { name: "Batch-2024", participantIds: ["1", "2"] },
    { name: "Frontend", participantIds: ["3"] },
  ]);
  const [batchName, setBatchName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [activeBatch, setActiveBatch] = useState<string | null>(null);

  // Add participant to batch
  const handleAddToBatch = (batchName: string, participantId: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.name === batchName && !b.participantIds.includes(participantId)
          ? { ...b, participantIds: [...b.participantIds, participantId] }
          : b
      )
    );
  };

  // Remove participant from batch
  const handleRemoveFromBatch = (batchName: string, participantId: string) => {
    setBatches((prev) =>
      prev.map((b) =>
        b.name === batchName
          ? { ...b, participantIds: b.participantIds.filter((id) => id !== participantId) }
          : b
      )
    );
  };

  // Delete batch
  const handleDeleteBatch = (batchName: string) => {
    setBatches((prev) => prev.filter((b) => b.name !== batchName));
    if (activeBatch === batchName) setActiveBatch(null);
  };

  // Create batch
  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      setBatches((prev) => [...prev, { name: batchName.trim(), participantIds: selected }]);
      setBatchName("");
      setSelected([]);
      setCreating(false);
    }, 800);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border border-border/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <span>Batch Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Create Batch */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 border-b pb-6 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Batch Name</label>
            <Input
              placeholder="Enter batch name"
              className="rounded-2xl"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              disabled={creating}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Add Participants</label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-muted/30">
              {allParticipants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-1">
                  <input
                    type="checkbox"
                    id={`participant-${p.id}`}
                    checked={selected.includes(p.id)}
                    onChange={() =>
                      setSelected((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((pid) => pid !== p.id)
                          : [...prev, p.id]
                      )
                    }
                    className="accent-primary h-4 w-4 rounded"
                    disabled={creating}
                  />
                  <label htmlFor={`participant-${p.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{p.email}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="default"
            className="rounded-2xl h-12 mt-6"
            disabled={creating || !batchName.trim() || selected.length === 0}
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4 mr-1" />
            {creating ? "Creating..." : "Create Batch"}
          </Button>
        </div>
        {/* Batches List */}
        <div className="space-y-6">
          {batches.length === 0 ? (
            <div className="text-muted-foreground text-center">No batches found.</div>
          ) : (
            batches.map((batch) => (
              <Card key={batch.name} className="border border-border/30 bg-muted/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="rounded-2xl bg-accent/40 text-foreground border-border/40 px-4 py-1 text-base font-semibold">
                      {batch.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{batch.participantIds.length} participants</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-100"
                    onClick={() => handleDeleteBatch(batch.name)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {batch.participantIds.length === 0 ? (
                      <span className="text-muted-foreground">No participants in this batch.</span>
                    ) : (
                      batch.participantIds.map((pid) => {
                        const p = allParticipants.find((x) => x.id === pid);
                        return (
                          <Badge key={pid} className="rounded-xl bg-primary/10 text-primary border-primary/20 px-3 py-1 flex items-center gap-2">
                            {p?.name || pid}
                            <button
                              className="ml-1 text-xs text-red-400 hover:text-red-600"
                              onClick={() => handleRemoveFromBatch(batch.name, pid)}
                            >
                              Remove
                            </button>
                          </Badge>
                        );
                      })
                    )}
                  </div>
                  {/* Add more participants to this batch */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {allParticipants
                      .filter((p) => !batch.participantIds.includes(p.id))
                      .map((p) => (
                        <Button
                          key={p.id}
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={() => handleAddToBatch(batch.name, p.id)}
                        >
                          Add {p.name}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 