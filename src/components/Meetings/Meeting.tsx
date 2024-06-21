import { AudioInputControl, ContentShare, ContentShareControl, LocalVideo, VideoInputControl, useAttendeeStatus, useLocalVideo, useMeetingManager, useRosterState } from "amazon-chime-sdk-component-library-react";
import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../GlobalProvider/GlobalContext";
import CallEndIcon from '@mui/icons-material/CallEnd';  
import './Meeting.scss';
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RemoteVideos from "../RemoteVideos/RemoteVideos";

const Meeting = () => {

    const {userName, attendeeId} = useGlobalState();
    const navigate = useNavigate();
    
    const meetingManager = useMeetingManager();
    const { isVideoEnabled, setIsVideoEnabled } = useLocalVideo();
    const [attendeesData, setAttendeesData] = useState<string[]>([]);
    const { roster } = useRosterState();
    const {
        muted,
        videoEnabled,
        sharingContent,
        signalStrength
    } = useAttendeeStatus(attendeeId);

     const toggleCamera = async () => {
        if (isVideoEnabled || !meetingManager.selectedVideoInputDevice) {
            meetingManager.meetingSession?.audioVideo?.stopLocalVideoTile();
            // Change the state to hide the `LocalVideo` tile
            setIsVideoEnabled(false);
        } else {
            await meetingManager.meetingSession?.audioVideo?.startVideoInput(meetingManager.selectedVideoInputDevice);
            meetingManager.meetingSession?.audioVideo?.startLocalVideoTile();
            // Change the state to display the `LocalVideo` tile
            setIsVideoEnabled(true);
        }
    };

    useEffect( () => {
        if(meetingManager?.meetingId)
            toggleCamera();
    },[]);

    useEffect( () => {
        if(roster && attendeeId){
            const attendees = Object.values(roster);
            let temp :string[] = [];
            attendees.map( ({chimeAttendeeId, externalUserId} ) => {
                if(chimeAttendeeId !== attendeeId ){
                temp.push(chimeAttendeeId);
                }
            });
            setAttendeesData(temp);
        }
    }, [roster]);

    const copyMeetingId = async() => {
        if(meetingManager.meetingId){
            navigator.clipboard.writeText(meetingManager.meetingId);
            alert('Meeting ID copied to clipboard');
        }
    };

    const leaveMeeting = async () => {
        try {
            await meetingManager.leave();
            navigate('/');
        } catch (error) {
            console.error('Failed to leave meeting:', error);
            alert('An error occurred while leaving the meeting. Please try again.');
        }
  };
    
    return(
        <div className="main-container">
            <div className="wrap-container">
                <div className="meet-container">
                {attendeesData.length > 0 &&
                    <div className='remote-container'>     
                        {attendeesData.map( (id: string, index) =>  <RemoteVideos AttendeeId={id} key={index} />)}
                    </div> 
                }
                
                {sharingContent ?
                    <div className="share-container">
                        <ContentShare nameplate='You are presenting' className='local-share'/>
                        <LocalVideo nameplate={userName} className='localshare-video'/>
                    </div>
                    :
                    <div className="video-container">
                        {videoEnabled ?
                            <LocalVideo nameplate={userName} className='local-video'/> :
                            <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}  className='local-video'>
                                <Avatar className="avatar-icon">{userName ? userName[0].toUpperCase() : null}</Avatar>
                            </div>
                        }
                    </div>
                    
                }
                </div>
                <div className="chat-container">
                    <div>Chat Room</div>
                    <div>Work in progress...</div>
                </div>
            </div>
           
           
            <div className="controls-div">
                <div onClick={copyMeetingId} className="copy-meeting">Copy Meeting ID</div>
                <VideoInputControl />
                <AudioInputControl />
                <ContentShareControl />
                <div onClick={leaveMeeting} className='leave-btn'><CallEndIcon color='error' fontSize='small'/></div>
           </div> 
        </div> 
    )
}


export default Meeting;
