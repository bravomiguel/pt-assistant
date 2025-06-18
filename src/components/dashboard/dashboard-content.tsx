"use client";

import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Define the speaker utterance interface
interface SpeakerUtterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

// Mock data for recent sessions
const recentSessions = [
  {
    id: "1",
    patientName: "John Doe",
    date: new Date(2025, 5, 15),
    duration: "45 min",
    notes: "Patient reported improvement in knee mobility. Exercises increased to level 3.",
    status: "completed"
  },
  {
    id: "2",
    patientName: "Sarah Johnson",
    date: new Date(2025, 5, 16),
    duration: "30 min",
    notes: "First assessment. Lower back pain, prescribed initial stretching routine.",
    status: "completed"
  },
  {
    id: "3",
    patientName: "Michael Brown",
    date: new Date(2025, 5, 17),
    duration: "60 min",
    notes: "Post-surgery rehabilitation session. Focus on gentle mobility exercises.",
    status: "in-progress"
  }
];

// Helper function to format time in MM:SS format
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function DashboardContent() {
  const setActiveTab = useState("record")[1];
  const [transcription, setTranscription] = useState("");
  const [utterances, setUtterances] = useState<SpeakerUtterance[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [transcriptionError, setTranscriptionError] = useState("");
  const [viewMode, setViewMode] = useState<"full" | "diarized">("diarized");
  
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({
    audio: true,
    video: false,
    onStop: (blobUrl) => {
      console.log("Recording stopped: ", blobUrl);
    }
  });

  const handleTranscribe = async () => {
    if (!mediaBlobUrl) {
      setTranscriptionError("No recording found. Please record audio first.");
      return;
    }
    
    try {
      setIsTranscribing(true);
      setTranscriptionError("");
      setUtterances([]);
      
      // Fetch the audio blob from the blob URL
      const response = await fetch(mediaBlobUrl);
      const audioBlob = await response.blob();
      
      // Create a FormData object and append the audio blob
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Send the audio to our API endpoint for transcription
      const transcriptionResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json();
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }
      
      const data = await transcriptionResponse.json();
      setTranscription(data.transcript);
      
      // Set the speaker utterances if available
      if (data.utterances && data.utterances.length > 0) {
        setUtterances(data.utterances);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveSession = () => {
    // In a real app, this would save the session data to a database
    alert("Session saved successfully!");
    setTranscription("");
    setSessionNotes("");
  };

  return (
    <Tabs defaultValue="record" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="record">Record Session</TabsTrigger>
        <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="record" className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Record & Transcribe Session</CardTitle>
            <CardDescription>
              Record your session with a patient and get an automatic transcription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button 
                variant={status === "recording" ? "destructive" : "default"}
                onClick={status === "recording" ? stopRecording : startRecording}
              >
                {status === "recording" ? "Stop Recording" : "Start Recording"}
              </Button>
              <Badge variant={status === "recording" ? "destructive" : "outline"}>
                {status === "recording" ? "Recording..." : "Ready"}
              </Badge>
            </div>
            
            {mediaBlobUrl && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Recording Preview:</p>
                <audio src={mediaBlobUrl} controls className="w-full" />
                <div className="mt-4 flex items-center space-x-4">
                  <Button onClick={handleTranscribe} disabled={isTranscribing}>
                    {isTranscribing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      "Transcribe with Deepgram Nova 3"
                    )}
                  </Button>
                </div>
                {isTranscribing && (
                  <Progress value={45} className="mt-2" />
                )}
              </div>
            )}
            
            {transcription && (
              <div className="mt-4">
                {transcriptionError && (
                  <p className="mt-2 text-sm text-red-500">{transcriptionError}</p>
                )}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Transcription:</p>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={viewMode === "full" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setViewMode("full")}
                    >
                      Full Text
                    </Button>
                    <Button 
                      variant={viewMode === "diarized" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setViewMode("diarized")}
                    >
                      Speaker Labels
                    </Button>
                  </div>
                </div>
                
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    {viewMode === "full" ? (
                      <p>{transcription}</p>
                    ) : utterances.length > 0 ? (
                      <div className="space-y-4">
                        {utterances.map((utterance, index) => (
                          <div key={index} className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <Avatar>
                                <AvatarFallback className={utterance.speaker.includes('A') ? 'bg-blue-500' : 'bg-green-500'}>
                                  {utterance.speaker.slice(-1)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{utterance.speaker}</p>
                              <p>{utterance.text}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(utterance.start)} - {formatTime(utterance.end)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>{transcription}</p>
                    )}
                  </CardContent>
                </Card>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium">Session Notes</h3>
                  <Textarea 
                    className="mt-2" 
                    placeholder="Add your notes about this session..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    rows={6}
                  />
                  <Button onClick={handleSaveSession} className="mt-2">
                    Save Session
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSession} disabled={!transcription && !sessionNotes}>
              Save Session
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="recent" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              View and manage your recent patient sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{session.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.patientName}</CardTitle>
                        <CardDescription>
                          {format(session.date, 'MMM dd, yyyy')} • {session.duration}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={session.status === "completed" ? "outline" : "secondary"}>
                      {session.status === "completed" ? "Completed" : "In Progress"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm">{session.notes}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button variant="ghost" size="sm">Edit Notes</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="analytics" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Session Analytics</CardTitle>
            <CardDescription>
              View statistics and insights about your patient sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42 min</div>
                    <p className="text-xs text-muted-foreground">-3 min from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8/5</div>
                    <p className="text-xs text-muted-foreground">Based on 18 reviews</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Session Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Initial Assessment</p>
                        <p className="text-sm font-medium">25%</p>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Rehabilitation</p>
                        <p className="text-sm font-medium">40%</p>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Follow-up</p>
                        <p className="text-sm font-medium">35%</p>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
