"use client";

import { useState } from "react";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock data for upcoming sessions
const upcomingSessions = [
  {
    id: "1",
    patientName: "Emma Wilson",
    date: addDays(new Date(), 1),
    time: "9:00 AM",
    type: "Follow-up",
    duration: "45 min"
  },
  {
    id: "2",
    patientName: "Robert Chen",
    date: addDays(new Date(), 1),
    time: "11:30 AM",
    type: "Initial Assessment",
    duration: "60 min"
  },
  {
    id: "3",
    patientName: "Olivia Martinez",
    date: addDays(new Date(), 2),
    time: "2:15 PM",
    type: "Rehabilitation",
    duration: "30 min"
  },
  {
    id: "4",
    patientName: "James Taylor",
    date: addDays(new Date(), 3),
    time: "10:00 AM",
    type: "Follow-up",
    duration: "45 min"
  }
];

export function UpcomingSessions() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>
            Your scheduled sessions for the next few days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-start space-x-3">
                <div className="bg-muted text-center p-2 rounded-md min-w-[50px]">
                  <p className="text-xs font-medium">{format(session.date, 'MMM')}</p>
                  <p className="text-lg font-bold">{format(session.date, 'd')}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{session.patientName}</p>
                    <Badge variant="outline" className="text-xs">
                      {session.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.time} • {session.duration}
                  </p>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full" asChild>
              <a href="#">View All Sessions</a>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>
            Schedule and manage your sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          
          <div className="mt-4 flex justify-between">
            <Button variant="outline" size="sm">
              View Schedule
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">Add Session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Session</DialogTitle>
                  <DialogDescription>
                    Schedule a new session with a patient
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    This is a placeholder for the session creation form.
                    In a complete application, you would add form fields here
                    for patient selection, date/time, session type, etc.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowAddDialog(false)}>
                    Schedule Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span className="text-xs">New Report</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="text-xs">Add Patient</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              <span className="text-xs">Schedule</span>
            </Button>
            <Button variant="outline" className="h-auto flex flex-col items-center justify-center py-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="text-xs">Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
