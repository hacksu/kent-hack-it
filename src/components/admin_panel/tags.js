import { useEffect, useState } from 'react';
import { SanitizeDescription } from '../../components/purification.js';

function AdminTagsTab() {
    const [challenges, setChallenges] = useState([]);
    const [yearTags, setYearTags] = useState([]);
    const [newYear, setNewYear] = useState('');

    async function FetchChallenges() {
        try {
            const response = await fetch(`/api/admin/ctf/fetch_challenges`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (data) {
                setChallenges(data);
                // Extract unique years and calculate usage
                const yearMap = {};
                data.forEach(challenge => {
                    const year = challenge.year || 'Unknown';
                    if (!yearMap[year]) {
                        yearMap[year] = { year, count: 0, archived: 0, active: 0 };
                    }
                    yearMap[year].count++;
                    if (challenge.is_archived) {
                        yearMap[year].archived++;
                    } else {
                        yearMap[year].active++;
                    }
                });
                
                // Convert to array and sort
                const tagsArray = Object.values(yearMap).sort((a, b) => {
                    if (a.year === 'Unknown') return 1;
                    if (b.year === 'Unknown') return -1;
                    return b.year - a.year;
                });
                
                setYearTags(tagsArray);
            }
        } catch (err) {
            console.error('Failed to fetch challenges:', err);
        }
    }

    useEffect(() => {
        FetchChallenges();
    }, []);

    const handleAddTag = async (e) => {
        e.preventDefault();
        let msgArea = document.getElementById('msg_popup');
        
        const yearNum = parseInt(newYear);
        
        // Validation
        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            if (msgArea) {
                msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: red; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>Please enter a valid year between 2000 and 2100</p>");
            }
            return;
        }
        
        // Check if year already exists
        if (yearTags.some(tag => tag.year === yearNum)) {
            if (msgArea) {
                msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: orange; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>Year tag already exists!</p>");
            }
            return;
        }
        
        // Add to local state
        const newTag = { year: yearNum, count: 0, archived: 0, active: 0 };
        setYearTags(prev => [newTag, ...prev].sort((a, b) => {
            if (a.year === 'Unknown') return 1;
            if (b.year === 'Unknown') return -1;
            return b.year - a.year;
        }));
        
        setNewYear('');
        
        if (msgArea) {
            msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>Year tag added! It will be available for use when creating or editing challenges.</p>");
        }
    };

    const handleDeleteTag = (year) => {
        let msgArea = document.getElementById('msg_popup');
        
        const tag = yearTags.find(t => t.year === year);
        
        if (!tag) return;
        
        if (tag.count > 0) {
            if (!window.confirm(`This year tag is used by ${tag.count} challenge(s). Deleting it won't remove the challenges, but they will lose their year tag. Continue?`)) {
                return;
            }
        }
        
        if (year === 'Unknown' || tag.count > 0) {
            if (msgArea) {
                msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: orange; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>Cannot delete year tags that are in use. Please update or delete the associated challenges first.</p>");
            }
            return;
        }
        
        // Remove from local state
        setYearTags(prev => prev.filter(t => t.year !== year));
        
        if (msgArea) {
            msgArea.innerHTML = SanitizeDescription(msgArea, "<p style='color: green; background: white; padding: 4px 10px; border-radius: 9999px; display: inline-block;'>Year tag removed successfully!</p>");
        }
    };

    return (
        <div className="container mt-4">
            <h4 className="mb-4">
                <i className="bi bi-tags-fill me-2"></i>
                Manage Year Tags
            </h4>
            
            {/* Add New Year Tag */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-3">Add New Year Tag</h5>
                    <form onSubmit={handleAddTag} className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Year</label>
                            <input
                                type="number"
                                className="form-control"
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                placeholder="Enter year (e.g., 2027)"
                                min="2000"
                                max="2100"
                                required
                            />
                            <small className="text-muted">Add a new year to the tag pool for organizing challenges</small>
                        </div>
                        <div className="col-md-6">
                            <button type="submit" className="btn btn-primary">
                                <i className="bi bi-plus-circle me-2"></i>
                                Add Year Tag
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Year Tags List */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-3">Existing Year Tags</h5>
                    
                    {yearTags.length === 0 ? (
                        <p className="text-muted">No year tags found. Add a year tag above to get started.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Year</th>
                                        <th>Total Challenges</th>
                                        <th>Active</th>
                                        <th>Archived</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {yearTags.map((tag, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <strong className="fs-5">
                                                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                                                    {tag.year}
                                                </strong>
                                            </td>
                                            <td>
                                                <span className="badge bg-info">{tag.count}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-success">{tag.active}</span>
                                            </td>
                                            <td>
                                                <span className="badge bg-warning text-dark">{tag.archived}</span>
                                            </td>
                                            <td>
                                                {tag.count === 0 && tag.year !== 'Unknown' ? (
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteTag(tag.year)}
                                                    >
                                                        <i className="bi bi-trash me-1"></i>
                                                        Delete
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        disabled
                                                        title={tag.year === 'Unknown' ? "Cannot delete Unknown tag" : "Cannot delete tags in use"}
                                                    >
                                                        <i className="bi bi-lock me-1"></i>
                                                        In Use
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    <div className="alert alert-info mt-3 mb-0" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Note:</strong> Year tags that are in use by challenges cannot be deleted. 
                        Update or delete the associated challenges first, or create new challenges with different year tags.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminTagsTab;
