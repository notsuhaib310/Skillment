import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

// Placeholder participants data
const allParticipants = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Alice Brown", email: "alice@example.com" },
  { id: "4", name: "Bob Lee", email: "bob@example.com" },
];

export function BatchDetail({ onBatchCreated }: { onBatchCreated?: (batch: { name: string; participantIds: string[] }) => void }) {
  const [batchName, setBatchName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => {
      onBatchCreated?.({ name: batchName.trim(), participantIds: selected });
      setBatchName("");
      setSelected([]);
      setCreating(false);
      alert("Batch created!");
    }, 800);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border border-border/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <span>Create Custom Batch</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Batch Name</label>
          <Input
            placeholder="Enter batch name"
            className="rounded-2xl"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            disabled={creating}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Add Participants</label>
          <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-muted/30">
            {allParticipants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id={`participant-${p.id}`}
                  checked={selected.includes(p.id)}
                  onChange={() => handleToggle(p.id)}
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
        <div className="flex justify-end">
          <Button
            variant="default"
            className="rounded-2xl"
            disabled={creating || !batchName.trim() || selected.length === 0}
            onClick={handleCreate}
          >
            {creating ? "Creating..." : "Create Batch"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 