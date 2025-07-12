'use client';

import React from 'react';
import { useAuth } from '../components/AuthProvider';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="p-8 max-w-3xl mx-auto text-center">
        <p className="text-gray-500">You need to be logged in to view this page.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500">Full Name</h2>
          <p className="text-lg">{user.profile?.full_name || 'N/A'}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500">Email</h2>
          <p className="text-lg">{user.email || 'N/A'}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500">Organization</h2>
          <p className="text-lg">{user.profile?.organization || 'N/A'}</p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500">Preferred Language</h2>
          <p className="text-lg">{user.profile?.preferred_language || 'N/A'}</p>
        </div>

        {/* Add more profile fields as needed */}
      </div>
    </main>
  );
}
