import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directory exists
export const ensureUploadDir = async (): Promise<void> => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

export const saveFile = async (file: File, userId: string): Promise<string> => {
  await ensureUploadDir();
  
  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const userDir = path.join(UPLOAD_DIR, userId);
  
  // Ensure user directory exists
  try {
    await fs.access(userDir);
  } catch {
    await fs.mkdir(userDir, { recursive: true });
  }
  
  const filePath = path.join(userDir, fileName);
  const relativePath = path.join(userId, fileName);
  
  // Convert File to Buffer (this would be handled differently in a real server environment)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  await fs.writeFile(filePath, buffer);
  
  return relativePath;
};

export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export const getFileUrl = (filePath: string): string => {
  return `/api/files/${filePath}`;
};

export const getFileBuffer = async (filePath: string): Promise<Buffer> => {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  return fs.readFile(fullPath);
};