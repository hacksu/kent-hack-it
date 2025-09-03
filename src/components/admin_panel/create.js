import { useEffect, useState } from 'react';

function AdminChallengeCreateTab() {
    const [newFormData, setNewFormData] = useState({
        name: '',
        description: '',
        category: '',
        difficulty: '',
        flag: '',
        points: ''
    });

    const handleNewChange = e => {
        const { name, value } = e.target;
        setNewFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
                    "flag": newFormData.flag,
                    "points": newFormData.points,
                }),
                credentials: 'include'  // ensures cookies are sent
            });

            // get the response output from the above fetch call
            const data = await response.json();

            if (data && data.acknowledge) {
                if (msgArea) {
                    msgArea.innerHTML = "<p style='color: green;'>" + data.message + "</p>";
                }
            } else {
                if (msgArea) {
                    msgArea.innerHTML = "<p style='color: red;'>" + data.message + "</p>";
                }
            }
        } catch (error) {
            console.error("Error sending request:", error);
            if (msgArea) {
                msgArea.innerHTML = "<p style='color: red;'> Error Occured! </p>";
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
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
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
                            <label className="form-label fw-semibold d-block">Points</label>
                            <input
                                type="number"
                                className="form-control mx-auto"
                                name="points"
                                value={newFormData.points}
                                onChange={handleNewChange}
                                required
                                style={{ maxWidth: '150px' }}
                                placeholder="100"
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