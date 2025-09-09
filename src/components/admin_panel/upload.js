import { useEffect, useState, useRef } from 'react';
import { SanitizeDescription } from '../../components/purification.js';

function AdminChallengeUploadTab() {
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

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
        const selectedFile = e.target.files[0];

        if (selectedFile && selectedFile.type !== "application/zip" && !selectedFile.name.endsWith(".zip")) {
            alert("Only ZIP files are allowed.");
            e.target.value = ""; // reset input
            setFile(null);
        } else {
            setFile(selectedFile);
        }
    };

    const uploadFile = async (e) => {
        e.preventDefault();

        if (!file) return alert("Please select a ZIP file.");

        const formData = new FormData();
        formData.append("file", file);

        let msgArea = document.getElementById('msg_popup');

        try {
            const response = await fetch(`/api/admin/ctf/upload`, {
                method: "POST",
                body: formData,
                credentials: 'include'
            });

            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
                }

                await fetchUploads();

                // clear form
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
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
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card shadow">
                            <div className="card-body">
                                <h3 className="card-title text-center mb-4">Upload Challenge</h3>
                                <div id='msg_popup'></div>
                                <form onSubmit={uploadFile}>
                                    <div className="mb-3">
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept=".zip"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                        />
                                    </div>
                                    <div className="d-grid">
                                        <button type="submit" className="btn btn-primary">
                                            Upload
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

            <div className="container mt-2">
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
                </div>
            </div>
        </>
    );
}
export default AdminChallengeUploadTab;