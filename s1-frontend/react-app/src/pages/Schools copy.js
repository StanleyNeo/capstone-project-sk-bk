import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import ApiService from '../services/api'; // Import your ApiService

function Schools() {
  const { schools, loading, addSchool } = useData();
  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    principal: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.address || !newSchool.principal) {
      setMessage('All fields are required');
      return;
    }

    const result = await addSchool(newSchool);
    if (result.success) {
      setMessage('School added successfully!');
      setNewSchool({ name: '', address: '', principal: '' });
    } else {
      setMessage(`Error: ${result.error}`);
    }
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
      
      {/* Add School Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h3>Add New School</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">School Name</label>
              <input
                type="text"
                className="form-control"
                value={newSchool.name}
                onChange={(e) => setNewSchool({...newSchool, name: e.target.value})}
                required
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
              />
            </div>
            <button type="submit" className="btn btn-primary">Add School</button>
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
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school, index) => (
                    <tr key={index}>
                      <td>{school.name}</td>
                      <td>{school.address}</td>
                      <td>{school.principal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schools;