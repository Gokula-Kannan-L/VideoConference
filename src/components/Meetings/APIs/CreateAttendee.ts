
export const  CreateAttendee = async(MeetingId: string, ExternalUserId: string) => {
    try{
        const attendeeResponse = await fetch('https://crrss6qqnipimjyqgryv2r2j6m0ijgop.lambda-url.us-east-1.on.aws/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                MeetingId,
                ExternalUserId
            }),
        });

        if (!attendeeResponse.ok) {
            throw new Error('Failed to create attendee');
        }
        
        const attendeeData = await attendeeResponse.json();

        return attendeeData;
    }
    catch(error){
        console.error('Failed to attendee:', error);
        alert('An error occurred while creating the attendee. Please try again.');
    }
}
