import axios from 'axios';
const API = axios.create({ baseURL:'https://api.daily.co/v1', headers:{ Authorization:`Bearer ${process.env.DAILY_API_KEY||''}` }});

export const createMeetingRoom = async (sessionId) => {
  if (!process.env.DAILY_API_KEY)
    return { url:`https://meet.daily.co/devmeet-${sessionId}`, name:`devmeet-${sessionId}`, isMock:true };
  try {
    const { data } = await API.post('/rooms', {
      name:`devmeet-${sessionId}`,
      privacy:'private',
      properties:{ exp:Math.floor(Date.now()/1000)+7200, max_participants:2, enable_screenshare:true }
    });
    return { url:data.url, name:data.name, isMock:false };
  } catch { return { url:`https://meet.daily.co/devmeet-${sessionId}`, name:`devmeet-${sessionId}`, isMock:true }; }
};

export const createMeetingToken = async (roomName, userId, isOwner=false) => {
  if (!process.env.DAILY_API_KEY) return null;
  try {
    const { data } = await API.post('/meeting-tokens', { properties:{ room_name:roomName, user_id:userId, is_owner:isOwner, exp:Math.floor(Date.now()/1000)+7200 }});
    return data.token;
  } catch { return null; }
};
export const deleteMeetingRoom = async (roomName) => {
  if (!process.env.DAILY_API_KEY) return null;
  try {
    await API.delete(`/rooms/${roomName}`);
  } catch (err) {
    console.error("Daily.co room delete error:", err.message);
  }
};
