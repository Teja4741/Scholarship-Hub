import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import api from '../services/api';

interface FileUploadProps {
  applicationId: number;
  documentType: string;
  onUploadSuccess?: (document: any) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
}

interface UploadedDocument {
  id: number;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  verified: boolean;
  extractedData?: any;
  uploadedAt: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  applicationId,
  documentType,
  onUploadSuccess,
  onUploadError,
  acceptedTypes = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSize = 10
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<UploadedDocument | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      const errorMsg = `File size must be less than ${maxSize}MB`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validate file type
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      const errorMsg = `File type not allowed. Accepted types: ${acceptedTypes}`;
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('applicationId', applicationId.toString());
      formData.append('documentType', documentType);

      const response = await api.uploadDocument(formData);

      setUploadedDocument(response.data);
      onUploadSuccess?.(response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to upload document';
      setError(errorMsg);
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = () => {
    if (uploadedDocument?.url) {
      window.open(uploadedDocument.url, '_blank');
    }
  };

  const handleDeleteDocument = async () => {
    if (!uploadedDocument) return;

    try {
      await api.deleteDocument(uploadedDocument.id);
      setUploadedDocument(null);
    } catch (err: any) {
      setError('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!uploadedDocument && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isUploading
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Uploading document...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload {documentType} document
              </p>
              <p className="text-xs text-gray-500">
                {acceptedTypes} (max {maxSize}MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Document */}
      {uploadedDocument && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{uploadedDocument.originalname}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(uploadedDocument.size)} • Uploaded {new Date(uploadedDocument.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Verification Status */}
              <div className="flex items-center space-x-1">
                {uploadedDocument.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className={`text-sm ${uploadedDocument.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {uploadedDocument.verified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>

              {/* Actions */}
              <button
                onClick={handleViewDocument}
                className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                title="View document"
              >
                <Eye className="h-4 w-4" />
              </button>

              <button
                onClick={handleDeleteDocument}
                className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                title="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Extracted Data */}
          {uploadedDocument.extractedData && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Extracted Information:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {uploadedDocument.extractedData.gpa && (
                  <p>GPA: {uploadedDocument.extractedData.gpa}</p>
                )}
                {uploadedDocument.extractedData.coursesCount && (
                  <p>Courses: {uploadedDocument.extractedData.coursesCount}</p>
                )}
                {uploadedDocument.extractedData.name && (
                  <p>Name: {uploadedDocument.extractedData.name}</p>
                )}
                {uploadedDocument.extractedData.dob && (
                  <p>Date of Birth: {uploadedDocument.extractedData.dob}</p>
                )}
                {uploadedDocument.extractedData.id && (
                  <p>ID: {uploadedDocument.extractedData.id}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}
    </div>
  );
};
