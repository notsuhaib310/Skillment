"use client";

import { AddParticipantForm } from "@/components/participants/add-participant-modal";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download } from "lucide-react";
import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { participantsApi } from "@/lib/api";

const sampleCsv = `fullName,email,phone,tags\nJohn Doe,john@example.com,1234567890,Frontend|Batch-2024\nJane Smith,jane@example.com,9876543210,Backend|Batch-2023`;

function downloadSampleCsv() {
  const blob = new Blob([sampleCsv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "participants-sample.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AddParticipantPage() {
  const [bulkParticipants, setBulkParticipants] = useState<any[]>([]);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBulkError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setBulkError("Failed to parse CSV. Please check your file format.");
          setBulkParticipants([]);
          return;
        }
        // Map tags from 'tag1|tag2' to array
        const participants = (results.data as any[]).map((row) => ({
          fullName: row.fullName || row.name || "",
          email: row.email || "",
          phone: row.phone || "",
          tags: row.tags ? row.tags.split("|").map((t: string) => t.trim()) : [],
        }));
        setBulkParticipants(participants);
      },
      error: () => {
        setBulkError("Failed to parse CSV. Please try again.");
        setBulkParticipants([]);
      },
    });
  };

  const handleBulkUpload = async () => {
    setIsBulkUploading(true);
    setBulkError(null);
    try {
      for (const p of bulkParticipants) {
        await participantsApi.create({
          name: p.fullName,
          email: p.email,
          phone: p.phone,
          tags: p.tags,
          location: "",
        });
      }
      setBulkParticipants([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Bulk upload successful!");
    } catch (err) {
      setBulkError("Failed to upload some participants. Please check your data and try again.");
    } finally {
      setIsBulkUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8 space-y-8">
          <Card className="w-full shadow-xl border border-border/30">
            <CardHeader>
              <CardTitle>Add New Participant</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <AddParticipantForm onParticipantAdded={() => {}} />
            </CardContent>
          </Card>
          <Card className="w-full shadow-xl border border-border/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Bulk Add Participants</CardTitle>
              <Button variant="ghost" onClick={downloadSampleCsv} className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Sample CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4 py-8">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleBulkFileChange}
                />
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBulkUploading}
                >
                  <Upload className="h-5 w-5" />
                  {isBulkUploading ? "Uploading..." : "Upload CSV"}
                </Button>
                <p className="text-muted-foreground text-sm">Upload a CSV file to add multiple participants at once.</p>
                {bulkError && <div className="text-red-500 text-sm">{bulkError}</div>}
                {bulkParticipants.length > 0 && (
                  <div className="w-full max-w-2xl mt-4">
                    <h4 className="font-semibold mb-2">Parsed Participants:</h4>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-3 py-2 text-left">Full Name</th>
                            <th className="px-3 py-2 text-left">Email</th>
                            <th className="px-3 py-2 text-left">Phone</th>
                            <th className="px-3 py-2 text-left">Tags</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkParticipants.map((p, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-3 py-2">{p.fullName}</td>
                              <td className="px-3 py-2">{p.email}</td>
                              <td className="px-3 py-2">{p.phone}</td>
                              <td className="px-3 py-2">{p.tags.join(", ")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button
                      className="mt-4"
                      onClick={handleBulkUpload}
                      disabled={isBulkUploading}
                    >
                      {isBulkUploading ? "Uploading..." : `Upload ${bulkParticipants.length} Participants`}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 