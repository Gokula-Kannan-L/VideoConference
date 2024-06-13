import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
    ConsoleLogger,
    DefaultDeviceController,
    DefaultMeetingSession,
    LogLevel,
    MeetingSessionConfiguration
  } from 'amazon-chime-sdk-js';
import { RemoteVideo, VideoTileGrid } from 'amazon-chime-sdk-component-library-react';
import { LocalVideo, MeetingProvider } from 'amazon-chime-sdk-component-library-react';



interface MeetingProps {
  meetingId: string;
  attendeeId: string;
}

const Meeting: React.FC<MeetingProps> = ({ meetingId, attendeeId }) => {

    const logger = new ConsoleLogger('MyLogger', LogLevel.INFO);
    const deviceController = new DefaultDeviceController(logger);

    const [meetingSession, setMeetingSession] = useState<DefaultMeetingSession>();
   
   

    useEffect( () => {
        if(meetingId && attendeeId){
            const meetingResponse = meetingId
            const attendeeResponse = attendeeId
            const configuration = new MeetingSessionConfiguration(meetingResponse, attendeeResponse);
            const meetingSessionData = new DefaultMeetingSession(
                configuration,
                logger,
                deviceController
            );
            setMeetingSession(meetingSessionData);
            console.log("meetingSession---------------------",meetingSessionData);
        }
    }, [meetingId, attendeeId]);


    function updateTiles(meetingSession: any) {
        const tiles = meetingSession.audioVideo.getAllVideoTiles();
        tiles.forEach((tile: any) => {
            let tileId = tile.tileState.tileId
            var videoElement = document.getElementById("video-" + tileId);
      
            if (!videoElement) {
                videoElement = document.createElement("video");
                videoElement.id = "video-" + tileId;
                document.getElementById("video-list")?.append(videoElement);
                meetingSession.audioVideo.bindVideoElement(
                    tileId,
                    videoElement
                );
            }
        })
     }


    const getDevicePermissions = async() => {
        if(meetingSession){
            const audioInputDevices = await meetingSession.audioVideo.listAudioInputDevices();
            const audioOutputDevices = await meetingSession.audioVideo.listAudioOutputDevices();
            // const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();

           await meetingSession.audioVideo.startAudioInput(
            audioInputDevices[0].deviceId
            );
            await meetingSession.audioVideo.chooseAudioOutput(
                audioOutputDevices[0].deviceId
            );

        
            const videoInputDevices = await meetingSession.audioVideo.listVideoInputDevices();
            await meetingSession.audioVideo.startVideoInput(videoInputDevices[0].deviceId);
            const videoElement =  await document.getElementById('video-element') as HTMLVideoElement;
            console.log('videoElement--------------------', videoElement)
            const observer = {
                // videoTileDidUpdate is called whenever a new tile is created or tileState changes.
                audioVideoDidStart: () => {
                    console.log('audioVideoDidStart Started');
                },
                videoTileDidUpdate: (tileState: any) => {
                    // Ignore a tile without attendee ID and other attendee's tile.
                    if (!tileState.boundAttendeeId || !tileState.localTile) {
                        return;
                    }                    
                    updateTiles(meetingSession);
                }
                };
            
                meetingSession.audioVideo.addObserver(observer);
                meetingSession.audioVideo.start();
           }
    }
    useEffect( () => {
        if(meetingSession){
            getDevicePermissions();
        }
    },[meetingSession])

  return (
   <>
     <div id="video-list">
     </div>
   </>
  );
};

export default Meeting;
