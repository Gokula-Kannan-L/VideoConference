import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMeetingManager} from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import './Home.scss';
import { Backdrop, CircularProgress } from '@mui/material';
import { useGlobalState } from '../../GlobalProvider/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { CreateMeeting } from '../Meetings/APIs/CreateMeeting';
import { CreateAttendee } from '../Meetings/APIs/CreateAttendee';
import { JoinMeeting } from '../Meetings/APIs/JoinMeeting';

const Home: React.FC = () => {

  const {userName, setUserName, setAttendeeId} = useGlobalState();
  const [joinMeetId, setJoinMeetId] = useState<string>('');

  const meetingManager = useMeetingManager();

  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const configureDevices = async() => {
    const videoInputDevices = await meetingManager.meetingSession?.audioVideo?.listVideoInputDevices();
    const audioInputDevices = await meetingManager.meetingSession?.audioVideo?.listAudioInputDevices();
    const audioOutputDevices = await meetingManager.meetingSession?.audioVideo?.listAudioOutputDevices();
      
    if(videoInputDevices)
      await meetingManager.startVideoInputDevice(videoInputDevices[0].deviceId);
    if(audioInputDevices)
      await meetingManager.startVideoInputDevice(audioInputDevices[0].deviceId);
    if(audioOutputDevices)
      await meetingManager.startVideoInputDevice(audioOutputDevices[0].deviceId);
    
    navigate('/meeting');
  }

  const createMeeting = async() => {
    setLoading(true);
    const meetingData =  await CreateMeeting();
    if(meetingData.Meeting.MeetingId){
      const attendeeData = await CreateAttendee(meetingData.Meeting.MeetingId, uuidv4());
      setAttendeeId(attendeeData.Attendee.AttendeeId);

      meetingManager.meetingSession?.audioVideo.setDeviceLabelTrigger(() => Promise.resolve(new MediaStream()));
      const configuration = new MeetingSessionConfiguration(meetingData, attendeeData);

      const deviceLabels = async () => await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const options = {
          deviceLabels,
      };

      await meetingManager.join(configuration, options);
      await meetingManager.start();

      configureDevices();
    }
   
  }

  const joinMeeting = async() => {
    if(joinMeetId && userName.length > 0 ){
      setLoading(true);
      const meetingData = await JoinMeeting( joinMeetId, uuidv4());
      setAttendeeId(meetingData.attendeeResponse.Attendee.AttendeeId);

      meetingManager.meetingSession?.audioVideo.setDeviceLabelTrigger(() => Promise.resolve(new MediaStream()));

      const configuration = new MeetingSessionConfiguration(meetingData.meeting, meetingData.attendeeResponse);
      
      const deviceLabels = async () => await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      const options = {
        deviceLabels,
      };

      await meetingManager.join(configuration, options);
      await meetingManager.start();

      configureDevices();
    }
  }

  return (
  
     <div className='home-container'>
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="success" />
        </Backdrop> 
        <div className='create-meeting'>
          <input className='meeting-input' placeholder='Enter your name' value={userName} onChange={ (e) => setUserName(e.target.value)}/>
          <button onClick={createMeeting} className='create-btn'>Create Meeting</button>
        </div>
        <div>OR</div>
        <div className='join-meeting'>
            <input className='meeting-input' placeholder='Enter meeting id' value={joinMeetId} onChange={ (e) => setJoinMeetId(e.target.value)}/>
            <input className='meeting-input' placeholder='Enter your name' value={userName} onChange={ (e) => setUserName(e.target.value)}/>
            <button  className='join-btn' onClick={joinMeeting}>Join Meeting</button>
        </div>
    </div>
  );
};

export default Home;
