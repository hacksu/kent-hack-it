import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../../components/purification.js';

function AdminChallengeCreateTab() {
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const [newFormData, setNewFormData] = useState({
        name: '',
        description: '',
        category: '',
        difficulty: '',
        written_by: '',
        flag: '',
        points: '',
        files: []
    });

    const handleNewChange = e => {
        const { name, value } = e.target;
        
        // Auto-set points based on difficulty
        let updatedData = { [name]: value };
        
        if (name === 'difficulty') {
            const pointsMap = {
                'Simple': 50,
                'Easy': 100,
                'Medium': 200,
                'Hard': 300,
                'Extreme': 400
            };
            updatedData.points = pointsMap[value] || '';
        }
        
        setNewFormData(prev => ({
            ...prev,
            ...updatedData
        }));
    };

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

    function toggleFile(filename) {
        setNewFormData(prev => {
            const alreadySelected = prev.files.includes(filename);
            return {
                ...prev,
                files: alreadySelected
                    ? prev.files.filter(f => f !== filename) // remove
                    : [...prev.files, filename]              // add
            };
        });
    }

    const addChallenge = async (event) => {
        event.preventDefault();
        let msgArea = document.getElementById('msg_popup');

        try {
            const response = await fetch(`/api/admin/ctf/create_challenge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "name": newFormData.name,
                    "description": newFormData.description,
                    "category": newFormData.category,
                    "difficulty": newFormData.difficulty,
                    "written_by": newFormData.written_by,
                    "flag": newFormData.flag,
                    "points": newFormData.points,
                    "files": newFormData.files,
                }),
                credentials: 'include'  // ensures cookies are sent
            });

            // get the response output from the above fetch call
            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>" + data.message + "</p>");
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
    }

    return (
        <>
            <div className="container mt-4" style={{ maxWidth: '700px' }}>
                <div className="card shadow-sm border-0 rounded-3">
                    <div className="card-body p-4">
                        <h4 className="card-title text-center mb-4">Create a New Challenge</h4>

                        <form onSubmit={addChallenge}>
                            {/* Challenge Name */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Challenge Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    value={newFormData.name}
                                    onChange={handleNewChange}
                                    required
                                    placeholder="Enter challenge name"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Description</label>
                                <textarea
                                    className="form-control"
                                    name="description"
                                    value={newFormData.description}
                                    onChange={handleNewChange}
                                    style={{
                                        minHeight: '120px',
                                        resize: 'vertical',
                                    }}
                                    placeholder="Enter a short challenge description"
                                />
                            </div>

                            {/* Author */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Written By</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="written_by"
                                    value={newFormData.written_by}
                                    onChange={handleNewChange}
                                    required
                                    placeholder="Enter challenge author name"
                                />
                            </div>

                            {/* Challenge Links */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Challenge Files</label>
                                <hr />

                                {/* Toggle button */}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary mb-2"
                                    onClick={() => setIsOpen(!isOpen)}
                                >
                                    {isOpen ? "Hide Files" : "Show Files"}
                                </button>

                                {/* Collapsible area */}
                                {isOpen && (
                                <div className="border rounded p-2 d-flex flex-wrap gap-2">
                                    {files.length === 0 && <p className="text-muted mb-0">No files uploaded</p>}
                                    {files.map(file => (
                                    <label
                                        key={file}
                                        htmlFor={`file-${file}`}
                                        className="d-flex align-items-center gap-1 small border rounded px-2 py-1 hover-highlight"
                                    >
                                        <input
                                        type="checkbox"
                                        id={`file-${file}`}
                                        className="form-check-input m-0"
                                        checked={newFormData.files.includes(file)}
                                        onChange={() => toggleFile(file)}
                                        />
                                        {file}
                                    </label>
                                    ))}
                                </div>
                                )}
                                <hr />
                            </div>

                            {/* Category & Difficulty side by side */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Category</label>
                                    <select
                                        className="form-select"
                                        name="category"
                                        value={newFormData.category}
                                        onChange={handleNewChange}
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        <option value="Web Exploitation">Web Exploitation</option>
                                        <option value="Cryptography">Cryptography</option>
                                        <option value="Reverse Engineering">Reverse Engineering</option>
                                        <option value="Forensics">Forensics</option>
                                        <option value="Steganography">Steganography</option>
                                        <option value="Binary Exploitation">Binary Exploitation</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">Difficulty</label>
                                    <select
                                        className="form-select"
                                        name="difficulty"
                                        value={newFormData.difficulty}
                                        onChange={handleNewChange}
                                        required
                                    >
                                        <option value="" disabled>Select difficulty</option>
                                        <option value="Simple">Simple</option>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                        <option value="Extreme">Extreme</option>
                                    </select>
                                </div>
                            </div>

                            {/* Flag */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Flag</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="flag"
                                    value={newFormData.flag}
                                    onChange={handleNewChange}
                                    required
                                    placeholder="Enter flag"
                                />
                            </div>

                            {/* Points */}
                            <div className="mb-4 text-center">
                                <label className="form-label fw-semibold d-block">Points (Auto-calculated)</label>
                                <input
                                    type="number"
                                    className="form-control mx-auto"
                                    name="points"
                                    value={newFormData.points}
                                    readOnly
                                    style={{ maxWidth: '150px', backgroundColor: '#f8f9fa' }}
                                    placeholder="Select difficulty first"
                                />
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn btn-primary w-100">
                                Submit Challenge
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
export default AdminChallengeCreateTab;