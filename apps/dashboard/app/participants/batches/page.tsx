"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { BatchManagement } from "@/components/participants/batch-management";
import { BatchDetail } from "@/components/participants/batch-detail";
import React, { useState } from "react";

const initialBatches = ["Batch-2024", "Batch-2023", "Frontend", "Backend"];

export default function BatchManagementPage() {
  const [batches, setBatches] = useState(initialBatches);
  const [selectedParticipantsCount, setSelectedParticipantsCount] = useState(0); // Placeholder

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8 space-y-8">
          <BatchDetail onBatchCreated={(batch) => setBatches((prev) => [...prev, batch.name])} />
          <div className="h-4" />
          <BatchManagement
            batches={batches}
            selectedParticipantsCount={selectedParticipantsCount}
            onCreateBatch={(batch) => setBatches((prev) => [...prev, batch])}
            onAssignBatch={(batch) => alert(`Assigning ${selectedParticipantsCount} participants to ${batch}`)}
          />
        </main>
      </div>
    </div>
  );
} 