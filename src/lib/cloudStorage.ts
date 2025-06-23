import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = import.meta.env.VITE_AZURE_STORAGE_CONNECTION_STRING;
const containerName = import.meta.env.VITE_AZURE_STORAGE_CONTAINER;

if (!connectionString) {
  throw new Error('Azure Storage connection string is not configured');
}

if (!containerName) {
  throw new Error('Azure Storage container name is not configured');
}

let blobServiceClient: BlobServiceClient;

try {
  blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
} catch (error) {
  console.error('Failed to initialize Azure Storage client:', error);
  throw new Error('Failed to initialize Azure Storage client');
}

export async function uploadToCloudStorage(file: File, fileName: string): Promise<string> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'blob'
    });

    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Upload the file
    await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Upload to cloud storage failed:', error);
    throw new Error(`Failed to upload document to cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFromCloudStorage(fileName: string): Promise<void> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error('Delete from cloud storage failed:', error);
    throw new Error(`Failed to delete document from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getFileUrl(fileName: string): Promise<string> {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    return blockBlobClient.url;
  } catch (error) {
    console.error('Get file URL failed:', error);
    throw new Error(`Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}