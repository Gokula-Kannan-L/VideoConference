import React, { FunctionComponent } from "react";
import { RemoteVideo, useAttendeeStatus } from 'amazon-chime-sdk-component-library-react';


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

    return(
        <>
        {
            videoEnabled ? <RemoteVideo tileId={2}/> : <>hello</>
        }
        </>
    )
}

export default RemoteVideos;
