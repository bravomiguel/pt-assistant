import { createClient } from '@deepgram/sdk';

/**
 * Interface for the transcription result with speaker diarization
 */
export interface TranscriptionResult {
  transcript: string;
  utterances: SpeakerUtterance[];
}

/**
 * Interface for a speaker utterance
 */
export interface SpeakerUtterance {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

/**
 * Transcribes audio using Deepgram's Nova 3 model with speaker diarization
 * @param audioBlob - The audio blob to transcribe
 * @param apiKey - The Deepgram API key
 * @returns A promise that resolves to the transcription result with speaker diarization
 */
export async function transcribeAudio(audioBlob: Blob, apiKey: string): Promise<TranscriptionResult> {
  try {
    // Initialize the Deepgram client with the API key
    const deepgram = createClient(apiKey);
    
    // Convert the blob to an ArrayBuffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Create a buffer from the ArrayBuffer
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
    
    return {
      transcript,
      utterances
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to transcribe audio');
  }
}
