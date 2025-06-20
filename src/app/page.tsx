import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">PT Assistant Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <DashboardContent />
          </div>
          <div>
            <UpcomingSessions />
          </div>
        </div>
      </div>
    </div>
  );
}
