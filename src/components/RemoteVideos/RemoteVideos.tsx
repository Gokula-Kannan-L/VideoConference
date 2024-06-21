import React, { Dispatch, FunctionComponent, SetStateAction, useEffect } from "react";
import { ContentShare, RemoteVideo, useAttendeeStatus, useRemoteVideoTileState } from 'amazon-chime-sdk-component-library-react';
import Avatar from '@mui/material/Avatar';
import './RemoteVideos.scss';

type props = {
    AttendeeId: string
    setRemoteSharing: Dispatch<SetStateAction<boolean>>
}

const RemoteVideos:FunctionComponent<props> = ({AttendeeId, setRemoteSharing}) => {

    const {
        muted,
        videoEnabled,
        sharingContent,
        signalStrength
      } = useAttendeeStatus(AttendeeId);

    const { tiles, attendeeIdToTileId } = useRemoteVideoTileState();

    useEffect( () => {
        setRemoteSharing(sharingContent);
    }, [sharingContent])

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
