import React, { FunctionComponent, useEffect } from "react";
import { RemoteVideo, useAttendeeStatus, useRemoteVideoTileState } from 'amazon-chime-sdk-component-library-react';
import Avatar from '@mui/material/Avatar';
import './RemoteVideos.scss';

type props = {
    AttendeeId: string
}

const RemoteVideos:FunctionComponent<props> = ({AttendeeId}) => {

    const {
        muted,
        videoEnabled,
        sharingContent,
        signalStrength
      } = useAttendeeStatus(AttendeeId);

    const { tiles, attendeeIdToTileId } = useRemoteVideoTileState();

    return(
        <>
        {
            videoEnabled ? 
                <RemoteVideo 
                    tileId={attendeeIdToTileId[AttendeeId]} 
                    name={AttendeeId} 
                    className={`remote-video${attendeeIdToTileId[AttendeeId]}  remote-video`} 
                /> 
                : 
                <div style={{display:'flex', justifyContent:'center', alignItems:'center', backgroundColor: '#16161d'}} className="remote-video"><Avatar sx={{ width: 80, height: 80, fontSize: 24, fontWeight:600, zIndex: 1 }}>U</Avatar></div>
        }
        </>
    )
}

export default RemoteVideos;
