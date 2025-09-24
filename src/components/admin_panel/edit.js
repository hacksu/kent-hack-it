import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../../components/purification.js';

function AdminChallengeEditTab({ target_challenge_id }) {
    const [files, setFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

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
        setUpdateFormData(prev => {
            const alreadySelected = prev.files.includes(filename);
            return {
                ...prev,
                files: alreadySelected
                    ? prev.files.filter(f => f !== filename) // remove
                    : [...prev.files, filename]              // add
            };
        });
    }

    const [updateFormData, setUpdateFormData] = useState({
        name: '',
        description: '',
        category: '',
        difficulty: '',
        flag: '',
        points: '',
        files: []
    });

    const handleUpdateChange = e => {
        const { name, value } = e.target;
        setUpdateFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    async function GetChallengeInfo() {
        try {
            const response = await fetch(`/api/admin/ctf/fetch_challenges`);
            const data = await response.json();
            if (data) {
                const challenge = data.find(c => c._id === target_challenge_id);

                setUpdateFormData(prev => ({
                    ...prev,
                    'name': challenge.name
                }));
                setUpdateFormData(prev => ({
                    ...prev,
                    'description': challenge.description
                }));
                setUpdateFormData(prev => ({
                    ...prev,
                    'category': challenge.category
                }));
                setUpdateFormData(prev => ({
                    ...prev,
                    'difficulty': challenge.difficulty
                }));
                setUpdateFormData(prev => ({
                    ...prev,
                    'flag': challenge.flag
                }));
                setUpdateFormData(prev => ({
                    ...prev,
                    'points': challenge.points
                }));
                setUpdateFormData(prev => ({
                    ...prev,
                    'files': challenge.hlinks || [] // incase there are no hlinks we can default to empty array
                }));
            }
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }
    useEffect(() => {
        if (target_challenge_id) {
            GetChallengeInfo();
        }
    }, []); // runs on-load

    const UpdateChallenge = async (event) => {
        event.preventDefault();
        let msgArea = document.getElementById('msg_popup');

        try {
            const response = await fetch(`/api/admin/ctf/update_challenge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "challenge_id": target_challenge_id,
                    "name": updateFormData.name,
                    "description": updateFormData.description,
                    "category": updateFormData.category,
                    "difficulty": updateFormData.difficulty,
                    "flag": updateFormData.flag,
                    "points": updateFormData.points,
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
        <div className="container mt-4" style={{ maxWidth: "700px" }}>
            <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                    <h3 className="card-title text-center mb-4">✏️ Edit Challenge</h3>

                    <form onSubmit={UpdateChallenge}>
                        {/* Challenge Name */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Challenge Name</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                value={updateFormData.name}
                                onChange={handleUpdateChange}
                                required
                                placeholder="Enter challenge name"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Description</label>
                            <textarea
                                className="form-control"
                                name="description"
                                value={updateFormData.description}
                                onChange={handleUpdateChange}
                                style={{
                                    minHeight: "120px",
                                    maxHeight: "300px",
                                    overflowY: "auto",
                                    resize: "vertical",
                                    width: "100%",
                                }}
                                placeholder="Enter challenge description"
                            />
                        </div>

                        {/* Challenge Links */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Challenge Files</label>
                            <hr/>

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
                                        checked={updateFormData.files.includes(file)}
                                        onChange={() => toggleFile(file)}
                                        />
                                        {file}
                                    </label>
                                    ))}
                                </div>
                                )}
                            <hr/>
                        </div>

                        {/* Category */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Category</label>
                            <select
                                className="form-select"
                                name="category"
                                value={updateFormData.category}
                                onChange={handleUpdateChange}
                                required
                            >
                                <option value="" disabled>
                                    Select Category
                                </option>
                                <option value="Web Exploitation">Web Exploitation</option>
                                <option value="Cryptography">Cryptography</option>
                                <option value="Reverse Engineering">Reverse Engineering</option>
                                <option value="Forensics">Forensics</option>
                                <option value="Steganography">Steganography</option>
                                <option value="Binary Exploitation">Binary Exploitation</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Difficulty</label>
                            <select
                                className="form-select"
                                name="difficulty"
                                value={updateFormData.difficulty}
                                onChange={handleUpdateChange}
                                required
                            >
                                <option value="" disabled>
                                    Select difficulty
                                </option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        {/* Flag */}
                        <div className="mb-4">
                            <label className="form-label fw-semibold">Flag</label>
                            <input
                                type="text"
                                className="form-control"
                                name="flag"
                                value={updateFormData.flag}
                                onChange={handleUpdateChange}
                                required
                                placeholder="Enter challenge flag"
                            />
                        </div>

                        {/* Points */}
                        <div className="mb-4 text-center">
                            <label className="form-label fw-semibold d-block">Points</label>
                            <input
                                type="number"
                                className="form-control mx-auto text-center"
                                name="points"
                                value={updateFormData.points}
                                onChange={handleUpdateChange}
                                required
                                style={{ maxWidth: "120px" }}
                                placeholder="100"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button type="submit" className="btn btn-primary px-5">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
export default AdminChallengeEditTab;