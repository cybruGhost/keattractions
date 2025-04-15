"use client"

import { AdminChat } from "@/components/admin-chat"

export default function AdminMessagesPage() {
  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Customer Messages</h1>

        <AdminChat />
      </div>
    </div>
  )
}

