import { useEffect, useState, useRef } from 'react';
import { SanitizeDescription } from '../../components/purification.js';

function AdminChallengeUploadTab() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    
    // Disable uploads during event
    const uploadsDisabled = true;

    async function fetchUploads() {
        try {
            const response = await fetch(`/api/admin/ctf/get_uploads`, {
                method: "GET",
                credentials: 'include'
            });

            const data = await response.json();
            if (data) setFiles(data);
        } catch (error) {
            console.error("Error sending request:", error);
        }
    }

    useEffect(() => {
        fetchUploads();
    }, []);

    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files);
        
        // Check if all files are ZIP files
        const invalidFiles = fileList.filter(file => 
            file.type !== "application/zip" && !file.name.endsWith(".zip")
        );
        
        if (invalidFiles.length > 0) {
            alert(`Only ZIP files are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
            e.target.value = ""; // reset input
            setSelectedFiles([]);
        } else {
            setSelectedFiles(fileList);
        }
    };

    const uploadFiles = async (e) => {
        e.preventDefault();

        if (uploadsDisabled) {
            alert("Uploads are currently disabled during the event.");
            return;
        }

        if (selectedFiles.length === 0) return alert("Please select at least one ZIP file.");

        let msgArea = document.getElementById('msg_popup');
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        // Show progress message
        if (msgArea) {
            msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: blue; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>Uploading files...</p>");
        }

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch(`/api/admin/ctf/upload`, {
                    method: "POST",
                    body: formData,
                    credentials: 'include'
                });

                const data = await response.json();
                
                if (data && data.acknowledge) {
                    results.push(`✓ ${file.name}: ${data.message}`);
                    successCount++;
                } else {
                    results.push(`✗ ${file.name}: ${data.message}`);
                    errorCount++;
                }
            } catch (error) {
                console.error("Error uploading file:", file.name, error);
                results.push(`✗ ${file.name}: Upload failed`);
                errorCount++;
            }
        }

        // Display results
        const resultColor = errorCount > 0 ? (successCount > 0 ? 'orange' : 'red') : 'green';
        const summary = `Uploaded ${successCount} of ${selectedFiles.length} files successfully.`;
        
        if (msgArea) {
            msgArea.innerHTML = SanitizeDescription(msgArea, 
                `<div style='color: ${resultColor}; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>
                    <strong>${summary}</strong><br/>
                    <small>${results.join('<br/>')}</small>
                </div>`
            );
        }

        if (successCount > 0) {
            await fetchUploads();
        }

        // Clear form
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    async function deleteFile(file) {
        let msgArea = document.getElementById('msg_popup');
        if (window.confirm(`Are you sure you want to delete this file?`)) {
            try {
                const response = await fetch(`/api/admin/ctf/delete_file`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ filename: file }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data && data.acknowledge) {
                    if (msgArea) {
                        msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                    }
                    await fetchUploads();
                } else {
                    if (msgArea) {
                        msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                    }
                }
            } catch (error) {
                console.error("Error sending request:", error);
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'> Error Occured! </p>");
                }
            }
        }
    }

    return (
        <>
            <div className="container">
                <p>Upload Compressed CTF Challenge Files (zip)</p>
                
                {uploadsDisabled && (
                    <div className="alert alert-warning text-center mb-4" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Uploads Disabled:</strong> File uploads are currently disabled during the event.
                    </div>
                )}
                
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className={`card shadow ${uploadsDisabled ? 'opacity-50' : ''}`}>
                            <div className="card-body">
                                <h3 className="card-title text-center mb-4">Upload Challenge</h3>
                                <div id='msg_popup'></div>
                                <form onSubmit={uploadFiles}>
                                    <div className="mb-3">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".zip"
                                            multiple
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            disabled={uploadsDisabled}
                                        />
                                        {selectedFiles.length > 0 && (
                                            <small className="form-text text-muted mt-2">
                                                Selected {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}: {selectedFiles.map(f => f.name).join(', ')}
                                            </small>
                                        )}
                                    </div>
                                    <div className="d-grid">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary" 
                                            disabled={uploadsDisabled || selectedFiles.length === 0}
                                        >
                                            Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}` : ''}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                  .custom-hover-dark {
                    transition: color 0.2s ease-in-out, transform 0.2s ease-in-out, font-weight 0.2s ease-in-out;
                  }
                  .custom-hover-dark:hover {
                    color: rgb(36, 34, 34) !important;
                    transform: scale(1.15);
                  }
                `}
            </style>

            <div className="container mt-2" >
                <h3 style={{ padding: '5px' }}>Current Uploads</h3>
                <div className="row justify-content-center">
                    <ul className="list-group w-auto">
                        {files.map((file, index) => (
                            <li
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center px-3 py-2"
                                style={{ fontSize: '0.9rem', minWidth: '300px', maxWidth: '600px' }}
                            >
                                <a
                                    href={`/api/ctf/download/${file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none text-muted flex-grow-1 custom-hover-dark"
                                    style={{ marginRight: '1rem' }}
                                >
                                    {file}
                                </a>
                                <button
                                    className="btn btn-sm btn-outline-danger flex-shrink-0"
                                    onClick={() => deleteFile(file)}
                                >
                                    <i className="bi bi-trash"></i> Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div style={{ paddingBottom: '4rem' }}></div>
                </div>
            </div>
        </>
    );
}
export default AdminChallengeUploadTab;