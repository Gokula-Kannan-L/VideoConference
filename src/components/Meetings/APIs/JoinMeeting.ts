

export const JoinMeeting = async(MeetingId: string, ExternalUserId: string) => {
    try{
        const response = await fetch('https://ziinfncfqo52tguw3ewlhsrl7i0vvvny.lambda-url.us-east-1.on.aws/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            MeetingId,
            ExternalUserId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to join meeting');
        }

        const joinMeetingResponse = await response.json();

        return joinMeetingResponse;
    }
    catch(error){
        console.error('Failed to attendee:', error);
        alert('An error occurred while creating the attendee. Please try again.');
    }
}