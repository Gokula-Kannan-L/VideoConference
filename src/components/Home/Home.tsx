import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AudioInputControl, ContentShare, ContentShareControl, Grid, LocalVideo, MeetingManagerJoinOptions, PreviewVideo, RemoteVideo, Roster, RosterAttendee, RosterGroup, VideoGrid, VideoInputControl, VideoTile, VideoTileGrid, useAttendeeStatus, useLocalVideo, useMeetingManager, useRemoteVideoTileState, useRosterState } from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration, VideoTileState } from 'amazon-chime-sdk-js';
import CallEndIcon from '@mui/icons-material/CallEnd';
import './Home.scss';
import RemoteVideos from '../RemoteVideos/RemoteVideos';
import { Avatar } from '@mui/material';
import { CreateAttendeeRequest } from '@aws-sdk/client-chime-sdk-meetings';

enum MeetType{
  START = 'start',
  CREATE = 'create',
  JOIN = 'join'
}

const Home: React.FC = () => {
  
  const meetingManager = useMeetingManager();
  const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo();
  const [meetType, setMeetType] = useState<MeetType>(MeetType.START);

  const [AttendeeId, setAttendeeId] = useState<string>(''); //Self AttendeeId
  const [Attendees, setAttendees] = useState<string[]>([]); //Others AttendeeId

  const [username, setUserName] = useState<string>('');

  const [meetingId, setMeetingId] = useState<string>('');
  const [joinMeetId, setJoinMeetId] = useState<string>(''); 

  const { roster } = useRosterState();
  const {
    muted,
    videoEnabled,
    sharingContent,
    signalStrength
  } = useAttendeeStatus(AttendeeId);

  const toggleCamera = async () => {

    if (isVideoEnabled || !meetingManager.selectedVideoInputDevice) {
      meetingManager.meetingSession?.audioVideo?.stopLocalVideoTile();
      // Change the state to hide the `LocalVideo` tile
      setIsVideoEnabled(false);
    } else {
      await meetingManager.meetingSession?.audioVideo?.startVideoInput(
        meetingManager.selectedVideoInputDevice
      );
      meetingManager.meetingSession?.audioVideo?.startLocalVideoTile();
      // Change the state to display the `LocalVideo` tile
      setIsVideoEnabled(true);
    }
  };

  const createMeeting = async () => {
    if(username){
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
            ExternalUserId: uuidv4()
          }),
        });

        console.log("AttendeeResponse----------------",attendeeResponse);
  
  
        if (!attendeeResponse.ok) {
          throw new Error('Failed to create attendee');
        }
        const attendeeData = await attendeeResponse.json();
  
        setAttendeeId(attendeeData.Attendee.AttendeeId);
  
        const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeData);
  
        const deviceLabels = async () => await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const options = {
          deviceLabels,
        };
  
        await meetingManager.join(configuration, options);
   
  
        await meetingManager.start();
  
        const videoInputDevices = await meetingManager.meetingSession?.audioVideo?.listVideoInputDevices();
        const audioInputDevices = await meetingManager.meetingSession?.audioVideo?.listAudioInputDevices();
        const audioOutputDevices = await meetingManager.meetingSession?.audioVideo?.listAudioOutputDevices();
        
        if(videoInputDevices)
          await meetingManager.startVideoInputDevice(videoInputDevices[0].deviceId);
        if(audioInputDevices)
          await meetingManager.startVideoInputDevice(audioInputDevices[0].deviceId);
        if(audioOutputDevices)
          await meetingManager.startVideoInputDevice(audioOutputDevices[0].deviceId);

        setMeetType(MeetType.CREATE);
  
      } catch (error) {
        console.error('Failed to join meeting:', error);
        alert('An error occurred while joining the meeting. Please try again.');
      }
    }
  
  };

  const joinMeeting = async () => {
    if(joinMeetId && username.length > 0){
      try {
        const attendeeResponse = await fetch('https://ziinfncfqo52tguw3ewlhsrl7i0vvvny.lambda-url.us-east-1.on.aws/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
          MeetingId: joinMeetId,
          ExternalUserId: uuidv4(),
          }),
      });
      const attendee = await attendeeResponse.json();
      setAttendeeId(attendee.attendeeResponse.Attendee.AttendeeId);
   
      const configuration = new MeetingSessionConfiguration(attendee.meeting, attendee.attendeeResponse);
      await meetingManager.join(configuration);

      meetingManager.meetingSession?.audioVideo.setDeviceLabelTrigger(() => Promise.resolve(new MediaStream()));
  
      await meetingManager.start();

      meetingManager.meetingSession?.audioVideo.setDeviceLabelTrigger(async () => 
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      );
  
      const videoInputDevices = await meetingManager.meetingSession?.audioVideo?.listVideoInputDevices();
      const audioInputDevices = await meetingManager.meetingSession?.audioVideo?.listAudioInputDevices();
      const audioOutputDevices = await meetingManager.meetingSession?.audioVideo?.listAudioOutputDevices();
        
      if(videoInputDevices)
        await meetingManager.startVideoInputDevice(videoInputDevices[0].deviceId);
      if(audioInputDevices)
        await meetingManager.startVideoInputDevice(audioInputDevices[0].deviceId);
      if(audioOutputDevices)
        await meetingManager.startVideoInputDevice(audioOutputDevices[0].deviceId);

      
      
      setMeetType(MeetType.JOIN);
  
      } catch (error) {
        console.error('Failed to join meeting:', error);
        alert('An error occurred while joining the meeting. Please try again.');
      }
    }
   
  };

  useEffect( () => {
    if(meetType === MeetType.CREATE || meetType === MeetType.JOIN)
      toggleCamera();

  }, [meetType])


  const copyMeetingId = async() => {
    navigator.clipboard.writeText(meetingId);
    if(meetingManager && AttendeeId)
      console.log("All VideoTiles------------------------", meetingManager.meetingSession?.audioVideo.getAllVideoTiles())

    alert('Meeting ID copied to clipboard');
  };

  const leaveMeeting = async () => {
    try {
      await meetingManager.leave();
      setMeetType(MeetType.START);
      setMeetingId('');
      setJoinMeetId('');
    } catch (error) {
      console.error('Failed to leave meeting:', error);
      alert('An error occurred while leaving the meeting. Please try again.');
    }
  };



  useEffect( () => {
    if(roster){
      console.log(roster);
      const attendees = Object.values(roster);
      let temp :string[] = [];
      attendees.map( ({chimeAttendeeId, externalUserId} ) => {
        if(chimeAttendeeId !== AttendeeId ){
          temp.push(chimeAttendeeId);
        }
     })
     setAttendees(temp);
    }
    
  }, [roster]);


  return (
    <div className='home-container'>
      {
        <>
        {meetType === MeetType.START && 
        <div className='main-container'>
          <div className='create-meeting'>
            <input className='meeting-input' placeholder='Enter your name' value={username} onChange={ (e) => setUserName(e.target.value)}/>
            <button onClick={createMeeting} className='create-btn'>Create Meeting</button>
          </div>
          <div>OR</div>
          <div className='join-meeting'>
            <input className='meeting-input' placeholder='Enter meeting id' value={joinMeetId} onChange={ (e) => setJoinMeetId(e.target.value)}/>
            <input className='meeting-input' placeholder='Enter your name' value={username} onChange={ (e) => setUserName(e.target.value)}/>
            <button  className='join-btn' onClick={joinMeeting}>Join Meeting</button>
          </div>
        </div>
        }
        {
        (meetType === MeetType.CREATE || meetType === MeetType.JOIN) &&
        <>
            {/* <VideoTileGrid className='video-grid-container' 
            // noRemoteVideoView = {<div className='no-participants-div'>No Other Participants</div>}
            /> */}

            <Grid responsive className='grid-container'  >
              <ContentShare nameplate='You are presenting' className='local-share'/>
              {videoEnabled ? 
                <LocalVideo nameplate={username} className='local-video'/> : 
                <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}  className='local-video'><Avatar sx={{ width: 100, height: 100, fontSize: 40, fontWeight:600, backgroundColor: 'rgb(41, 220, 248)' }} >{username[0].toUpperCase()}</Avatar></div>
              }
              {Attendees.length > 0 &&  
                Attendees.map( (id: string, index) =>  <RemoteVideos AttendeeId={id} key={index}/>)
              }
            </Grid>
          <div className="controls-div">
            <div onClick={copyMeetingId} className="copy-meeting">Copy Meeting ID</div>
            <VideoInputControl />
            <AudioInputControl />
            <ContentShareControl />
            <div onClick={leaveMeeting} className='leave-btn'><CallEndIcon color='error' fontSize='small'/></div>
            
          </div> 
        </>
        }
        

        </>
      }
      
      
    </div>
  );
};

export default Home;
