import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  LogLevel,
  MeetingSessionConfiguration,
} from 'amazon-chime-sdk-js';
import './Home.scss'

enum MeetType{
  CREATE = 'create',
  JOIN = 'join'
}

const Home: React.FC = () => {
  const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession | null>(null);
  const [meetingId, setMeetingId] = useState<string>('');
  const [joinId, setJoinId] = useState<string>('');

  const [meetType, setMeetType] = useState<MeetType>();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);



  const createMeeting = async () => {
    try {
      const response = await fetch('https://fe2dreo6t3b7lycn5jx5k7qcbq0hdivl.lambda-url.us-east-1.on.aws/');
      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }
      const meetingResponse = await response.json();
      setMeetingId(meetingResponse.Meeting.MeetingId);

      const attendeeResponse = await fetch('https://crrss6qqnipimjyqgryv2r2j6m0ijgop.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MeetingId: meetingResponse.Meeting.MeetingId,
          ExternalUserId: uuidv4(),
        }),
      });


      if (!attendeeResponse.ok) {
        throw new Error('Failed to create attendee');
}
      const attendeeData = await attendeeResponse.json();

      console.log("meetingResponse-----------------",meetingResponse)
      console.log("attendeeResponse-----------------", attendeeData)

      const logger = new ConsoleLogger('ChimeLogger', LogLevel.INFO);
      const deviceController = new DefaultDeviceController(logger);

      const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeData);
      const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

      const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
      await meetingSession.audioVideo.startAudioInput(audioInputDevices[0].deviceId);

      const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();
      await meetingSession.audioVideo.startVideoInput(videoInputDevices[0].deviceId);

      const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
      await meetingSession.audioVideo.chooseAudioOutput(audioOutputDevices[0].deviceId);

       // Create and bind audio element
       const audioElement = document.createElement('audio');
       audioElement.id = 'audio-element';
       audioElement.autoplay = true;
       document.body.appendChild(audioElement);
       meetingSession.audioVideo.bindAudioElement(audioElement);

      meetingSession.audioVideo.start();
      setMeetingSession(meetingSession);

    } catch (error) {
      console.error('Failed to join meeting:', error);
      alert('An error occurred while joining the meeting. Please try again.');
    }
  };

  useEffect(() => {
    if (meetingSession) {
      console.log('Meeting session started', meetingSession);


      const observer = {
        audioVideoDidStart: () => {
          console.log('Audio and video started');
          const tiles = meetingSession.audioVideo.getAllVideoTiles();
          console.log("tiles------------------", tiles);

        },
        audioVideoDidStartConnecting: (reconnecting: any) => {
          if (reconnecting) {
            // e.g. the WiFi connection is dropped.
            console.log('Attempting to reconnect');
          }
        },
        videoTileDidUpdate: (tileState: any) => {
          console.log('Video tile updated', tileState);
          if (!tileState.boundAttendeeId) {
            return;
          }

          let tileElement = document.getElementById(`video-${tileState.tileId}`) as HTMLVideoElement;
          if (!tileElement) {
            tileElement = document.createElement('video');
            tileElement.id = `video-${tileState.tileId}`;
            tileElement.style.width = '600px';
            tileElement.style.height = '400px';
            tileElement.style.backgroundColor = 'black';
            tileElement.autoplay = true;
            tileElement.muted = false;

            const videoTilesContainer = document.getElementById('video-tiles');
            if (videoTilesContainer) {
              videoTilesContainer.appendChild(tileElement);
              console.log(`Added video tile for attendee ${tileState.boundAttendeeId}`);
            } else {
              console.error('Video tiles container not found');
              return;
            }
          }

          meetingSession.audioVideo.bindVideoElement(tileState.tileId, tileElement);
          console.log(`Bound video tile ${tileState.tileId} to attendee ${tileState.boundAttendeeId}`);

        },
      };

      meetingSession.audioVideo.addObserver(observer);
      meetingSession.audioVideo.startLocalVideoTile();


      return () => {
        console.log('Cleaning up meeting session');
        meetingSession.audioVideo.removeObserver(observer);
        meetingSession.audioVideo.stop();
        setMeetingSession(null);
      };
    }
  }, [meetingSession]);
const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    alert('Meeting ID copied to clipboard');
  };


  const joinMeeting = async() => {
    if(joinId){
      const attendeeResponse = await fetch('https://ziinfncfqo52tguw3ewlhsrl7i0vvvny.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          MeetingId: joinId,
          ExternalUserId: uuidv4(),
        }),
      });
      const attendee = await attendeeResponse.json();
      console.log("New attendee-----------------------",attendee)

      const logger = new ConsoleLogger('ChimeLogger', LogLevel.INFO);
      const deviceController = new DefaultDeviceController(logger);

      const configuration = new MeetingSessionConfiguration(attendee.meeting, attendee.attendeeResponse);

      const meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);

      const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
      await meetingSession.audioVideo.startAudioInput(audioInputDevices[0].deviceId);

      const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();
      await meetingSession.audioVideo.startVideoInput(videoInputDevices[0].deviceId);

      const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
      await meetingSession.audioVideo.chooseAudioOutput(audioOutputDevices[0].deviceId);

       const audioElement = document.createElement('audio');
      audioElement.id = 'audio-element';
      audioElement.autoplay = true;
      document.body.appendChild(audioElement);
      meetingSession.audioVideo.bindAudioElement(audioElement);

      meetingSession.audioVideo.start();
      setMeetingSession(meetingSession);

    }
  }

  const toggleMute = () => {
    if (meetingSession) {
        if (isMuted) {
            meetingSession.audioVideo.realtimeUnmuteLocalAudio();
            setIsMuted(false);
        } else {
            meetingSession.audioVideo.realtimeMuteLocalAudio();
            setIsMuted(true);
        }
    }
};

const toggleVideo = () => {
    if (meetingSession) {
        if (isVideoEnabled) {
            meetingSession.audioVideo.stopLocalVideoTile();
            setIsVideoEnabled(false);
        } else {
            meetingSession.audioVideo.startLocalVideoTile();
            setIsVideoEnabled(true);
        }
    }
};

useEffect( () => {
  if(meetingSession){
    setMeetType(MeetType.CREATE);
  }
}, [meetingSession])

  return (
    <div className='home-container'>
      {
        !meetType &&
        <>
        <div className='create-meeting'>
          <button onClick={createMeeting} className='create-btn'>Create Meeting</button>
        </div>
        <div>OR</div>
        <div className='join-meeting'>
          <input value={joinId} onChange={ (e) => setJoinId(e.target.value)} className='meeting-input' placeholder='Enter meeting id'/>
          <button onClick={joinMeeting} className='join-btn'>Join Meeting</button>
        </div>
        </>
      }
      {
        MeetType.CREATE === meetType && 
        <>
           <div id="video-tiles" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {/* Video tiles will be appended here */}
          </div>
          <div className="controls-div">
        <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
        <button onClick={toggleVideo}>{isVideoEnabled ? 'Stop Video' : 'Start Video'}</button>

        </div>
        <div className="copy-meeting">
          <button onClick={copyMeetingId}>Copy Meeting ID</button>
        </div>  
        
        </>
      }
      
      
    </div>
  );
};

export default Home;
