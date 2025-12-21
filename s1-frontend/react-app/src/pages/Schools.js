import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import ApiService from '../services/api';

function Schools() {
  const { schools, loading, addSchool, updateSchool, deleteSchool } = useData();
  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    principal: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.address || !newSchool.principal) {
      setMessage('All fields are required');
      return;
    }

    if (editingId) {
      // Update existing school
      const result = await updateSchool(editingId, newSchool);
      if (result.success) {
        setMessage('School updated successfully!');
        setEditingId(null);
        setNewSchool({ name: '', address: '', principal: '' });
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } else {
      // Add new school
      const result = await addSchool(newSchool);
      if (result.success) {
        setMessage('School added successfully!');
        setNewSchool({ name: '', address: '', principal: '' });
      } else {
        setMessage(`Error: ${result.error}`);
      }
    }
  };

  const handleEdit = (school) => {
    setEditingId(school._id);
    setNewSchool({
      name: school.name,
      address: school.address,
      principal: school.principal
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await deleteSchool(id);
    if (result.success) {
      setMessage(result.message || 'School deleted successfully!');
      setShowDeleteConfirm(null);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewSchool({ name: '', address: '', principal: '' });
    setMessage('');
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Schools Management (MongoDB Integration)</h1>
      
      {/* Add/Edit School Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h3>{editingId ? 'Edit School' : 'Add New School'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">School Name</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.name}
                onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                required
                placeholder="Enter school name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.address}
                onChange={(e) => setNewSchool({...newSchool, address: e.target.value})}
                required
                placeholder="Enter school address"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Principal</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.principal}
                onChange={(e) => setNewSchool({...newSchool, principal: e.target.value})}
                required
                placeholder="Enter principal's name"
              />
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update School' : 'Add School'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} mt-3`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Schools List */}
      <div className="card">
        <div className="card-body">
          <h3>Schools List ({schools.length})</h3>
          {schools.length === 0 ? (
            <p className="text-muted">No schools found. Add one above.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Principal</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school._id}>
                      <td>{school.name}</td>
                      <td>{school.address}</td>
                      <td>{school.principal}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-warning"
                            onClick={() => handleEdit(school)}
                            title="Edit School"
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => setShowDeleteConfirm(school._id)}
                            title="Delete School"
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(null)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this school? This action cannot be undone.
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  Delete School
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schools;