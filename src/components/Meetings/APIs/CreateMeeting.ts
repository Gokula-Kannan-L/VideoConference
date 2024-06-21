
export const  CreateMeeting = async() => {
        try{
            const response = await fetch('https://fe2dreo6t3b7lycn5jx5k7qcbq0hdivl.lambda-url.us-east-1.on.aws/');
            if (!response.ok) {
                throw new Error('Failed to create meeting');
            }
            const meetingResponse = await response.json();

            return meetingResponse;
        }
        catch(error){
            console.error('Failed to create meeting:', error);
            alert('An error occurred while creating the meeting. Please try again.');
        }
}
