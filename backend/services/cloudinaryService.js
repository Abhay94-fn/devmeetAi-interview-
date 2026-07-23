import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
cloudinary.config({ cloud_name:process.env.CLOUDINARY_CLOUD_NAME, api_key:process.env.CLOUDINARY_API_KEY, api_secret:process.env.CLOUDINARY_API_SECRET });
const upload = (buffer, opts) => new Promise((res,rej) => { const s = cloudinary.uploader.upload_stream(opts,(e,r)=>e?rej(e):res(r)); Readable.from(buffer).pipe(s); });
export const uploadResume = (buf, uid) => upload(buf, { folder:'devmeet/resumes', public_id:`resume_${uid}`, resource_type:'raw' });
export const uploadAvatar = (buf, uid) => upload(buf, { folder:'devmeet/avatars', public_id:`avatar_${uid}`, transformation:[{width:200,height:200,crop:'fill',gravity:'face'}] });
export const deleteFile = (publicId) => cloudinary.uploader.destroy(publicId);
