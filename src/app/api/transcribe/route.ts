import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@deepgram/sdk';

interface SpeakerUtterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

export async function POST(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Deepgram API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize Deepgram client
    const deepgram = createClient(apiKey);
    
    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Convert the file to an ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Set up transcription options using Nova 3 model with diarization
    const options = {
      model: 'nova-3',
      smart_format: true,
      utterances: true,
      punctuate: true,
      diarize: true,
      language: 'en',
    };
    
    // Send the audio to Deepgram for transcription
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      options
    );
    
    if (error) {
      throw new Error(error.message || 'Failed to transcribe audio');
    }
    
    // Extract the transcript from the response
    const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript || '';
    
    // Extract speaker utterances if available
    const utterances: SpeakerUtterance[] = [];
    const words = result?.results?.channels[0]?.alternatives[0]?.words || [];
    
    // Group words by speaker and create utterances
    if (words.length > 0) {
      let currentSpeaker = words[0].speaker || 'A';
      let currentText = words[0].word;
      let startTime = words[0].start;
      let endTime = words[0].end;
      
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const speaker = word.speaker || 'A';
        
        if (speaker !== currentSpeaker) {
          // Save the current utterance
          utterances.push({
            speaker: `Speaker ${currentSpeaker}`,
            text: currentText.trim(),
            start: startTime,
            end: endTime
          });
          
          // Start a new utterance
          currentSpeaker = speaker;
          currentText = word.word;
          startTime = word.start;
        } else {
          // Add to current utterance
          currentText += ' ' + word.word;
        }
        
        endTime = word.end;
      }
      
      // Add the last utterance
      if (currentText) {
        utterances.push({
          speaker: `Speaker ${currentSpeaker}`,
          text: currentText.trim(),
          start: startTime,
          end: endTime
        });
      }
    }
    
    return NextResponse.json({ transcript, utterances });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
