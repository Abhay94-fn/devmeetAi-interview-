import Session from '../models/Session.js';
export const generateSessionCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code, exists;
  do {
    code = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    exists = await Session.findOne({ sessionCode: code });
  } while (exists);
  return code;
};
