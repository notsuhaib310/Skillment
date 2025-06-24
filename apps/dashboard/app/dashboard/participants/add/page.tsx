"use client"

import { AddParticipantForm } from "@/components/participants/add-participant-modal";

export default function AddParticipantPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <AddParticipantForm onParticipantAdded={() => {}} />
    </div>
  );
} 