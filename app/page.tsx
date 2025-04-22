"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Redirect to dashboard page
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Initialize database connection
    fetch('/api/initialize')
      .then(response => response.json())
      .then(data => {
        console.log('Database initialization:', data);
        // Redirect to dashboard
        router.push('/dashboard');
      })
      .catch(error => {
        console.error('Error initializing database:', error);
        // Still redirect even if there's an error
        router.push('/dashboard');
      });
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل متجرك...</p>
    </div>
  );
}
