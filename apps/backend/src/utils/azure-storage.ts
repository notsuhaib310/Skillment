import { BlobServiceClient } from '@azure/storage-blob';

// Azure Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'skillmentasset';

if (!connectionString) {
  throw new Error('Azure Storage connection string is not configured');
}

// Create the BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Get a reference to the container
const containerClient = blobServiceClient.getContainerClient(containerName);

// Ensure container exists
export const ensureContainerExists = async () => {
  try {
    const createResult = await containerClient.createIfNotExists({
      access: 'blob', // This makes blobs publicly accessible
    });
    if (createResult.succeeded) {
      console.log('Container created successfully');
    }
  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
};

// Upload a file to Azure Blob Storage
export const uploadToBlob = async (file: Express.Multer.File): Promise<string> => {
  try {
    // Validate file size (2MB limit)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Generate a unique blob name using timestamp and original filename
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file with proper headers
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    // Return the public URL of the uploaded file
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to blob storage:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error('Failed to upload file');
  }
};

// Delete a blob from Azure Storage
export const deleteBlob = async (blobUrl: string): Promise<void> => {
  try {
    const blobName = blobUrl.split('/').pop();
    if (!blobName) {
      throw new Error('Invalid blob URL');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (error) {
    console.error('Error deleting blob:', error);
    throw error;
  }
}; 