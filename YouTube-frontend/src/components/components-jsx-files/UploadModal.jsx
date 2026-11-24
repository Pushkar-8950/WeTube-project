import React, { useState } from 'react';
import api from '../../services/api';
import { X, Upload, Video, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import '../components-css-files/uploadModal.css';

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);

    const [videoPreview, setVideoPreview] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isOpen) return null;

    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            if (!title) {
                // Auto-fill title from filename
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleThumbnailSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!videoFile) {
            setError('Please select a video file to upload.');
            return;
        }

        if (!thumbnailFile) {
            setError('Please select a thumbnail image.');
            return;
        }

        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('videoToPublish', videoFile);
            formData.append('thumbnail', thumbnailFile);

            const response = await api.post('/videos/publish-video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                }
            });

            if (response.data?.success) {
                setSuccess('Video uploaded and published successfully!');
                setTimeout(() => {
                    if (onUploadSuccess) onUploadSuccess(response.data.data);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to upload video');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="upload-modal-header">
                    <h2>Upload Video</h2>
                    <button className="upload-modal-close" onClick={onClose} aria-label="Close modal">
                        <X size={22} />
                    </button>
                </header>

                {error && (
                    <div className="upload-alert error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="upload-alert success">
                        <CheckCircle size={18} />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="upload-modal-form">
                    {/* Video File Dropzone */}
                    <div className="file-drop-zone">
                        {videoFile ? (
                            <div className="selected-file-info">
                                <Video size={36} color="var(--accent-secondary, #c68a5c)" />
                                <div className="file-details">
                                    <span className="file-name">{videoFile.name}</span>
                                    <span className="file-size">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                                <label className="reselect-btn">
                                    Change
                                    <input type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                                </label>
                            </div>
                        ) : (
                            <label className="dropzone-label">
                                <Upload size={40} className="dropzone-icon" />
                                <h3>Select video file to upload</h3>
                                <p>Your video will be public as soon as it's processed</p>
                                <span className="select-btn">Select Video</span>
                                <input type="file" accept="video/*" onChange={handleVideoSelect} style={{ display: 'none' }} />
                            </label>
                        )}
                    </div>

                    {/* Thumbnail Selector */}
                    <div className="form-group-custom">
                        <label className="form-label">Thumbnail</label>
                        <p className="form-helper">Select or upload a picture that shows what's in your video.</p>
                        
                        <div className="thumbnail-selector">
                            {thumbnailPreview ? (
                                <div className="thumbnail-preview-box">
                                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                                    <label className="reselect-thumb-badge">
                                        Change Thumbnail
                                        <input type="file" accept="image/*" onChange={handleThumbnailSelect} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            ) : (
                                <label className="thumbnail-upload-box">
                                    <ImageIcon size={24} color="#a96536" />
                                    <span>Upload Thumbnail</span>
                                    <input type="file" accept="image/*" onChange={handleThumbnailSelect} style={{ display: 'none' }} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="form-group-custom">
                        <label className="form-label">Title (required)</label>
                        <input
                            type="text"
                            className="text-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Add a title that describes your video"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group-custom">
                        <label className="form-label">Description (required)</label>
                        <textarea
                            className="textarea-input"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell viewers about your video"
                            required
                        />
                    </div>

                    {uploading && (
                        <div className="upload-progress-container">
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <span className="progress-text">Uploading & Processing... {uploadProgress}%</span>
                        </div>
                    )}

                    <footer className="upload-modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={uploading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-publish" disabled={uploading || !videoFile || !thumbnailFile}>
                            {uploading ? 'Publishing...' : 'Publish Video'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

export default UploadModal;
