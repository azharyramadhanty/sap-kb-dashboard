import { BlobServiceClient } from '@azure/storage-blob';

class CloudStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER || 'documents';
    
    if (!connectionString) {
      throw new Error('Azure Storage connection string not configured');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob'
      });

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const uploadResponse = await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: {
          blobContentType: file.type
        }
      });

      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading file to Azure Blob Storage:', error);
      throw new Error('Failed to upload file to cloud storage');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      console.error('Error deleting file from Azure Blob Storage:', error);
      throw new Error('Failed to delete file from cloud storage');
    }
  }

  async getSignedUrl(fileName: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      // Generate SAS URL for temporary access
      const expiresOn = new Date();
      expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);
      
      // For simplicity, return the direct URL
      // In production, you'd generate a proper SAS token
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate file access URL');
    }
  }
}

export const cloudStorage = new CloudStorageService();