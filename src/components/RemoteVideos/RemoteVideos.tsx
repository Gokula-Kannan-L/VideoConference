import React, { FunctionComponent, useEffect } from "react";
import { RemoteVideo, useAttendeeStatus, useRemoteVideoTileState } from 'amazon-chime-sdk-component-library-react';
import Avatar from '@mui/material/Avatar';

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
                <RemoteVideo tileId={attendeeIdToTileId[AttendeeId]} name={AttendeeId} className={`remote-video${attendeeIdToTileId[AttendeeId]}`}/> 
                : 
                <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}><Avatar sx={{ width: 100, height: 100, fontSize: 24, fontWeight:600 }}>U</Avatar></div>
        }
        </>
    )
}

export default RemoteVideos;
