// BoxLibrary.js - Manage shipping boxes
// Location: /frontend/src/components/BoxLibrary.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Power, Box as BoxIcon, Package } from 'lucide-react';

function BoxLibrary() {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    boxType: 'box',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'inches',
    maxWeight: '',
    boxWeight: '',
    weightUnit: 'lbs',
    cost: '',
    material: '',
    supplierSku: '',
    isActive: true,
    priority: 50,
    notes: ''
  });

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/box-selector/boxes');
      const data = await response.json();

      if (data.success) {
        setBoxes(data.boxes);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
      alert('Failed to load boxes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEdit = async (e) => {
    e.preventDefault();

    try {
      const url = editingBox
        ? `/api/box-selector/boxes/${editingBox.id}`
        : '/api/box-selector/boxes';

      const method = editingBox ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingBox ? 'Box updated!' : 'Box created!');
        setShowModal(false);
        setEditingBox(null);
        resetForm();
        fetchBoxes();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving box:', error);
      alert('Failed to save box');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this box?')) return;

    try {
      const response = await fetch(`/api/box-selector/boxes/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        if (data.hadAssignments) {
          alert(`Box deleted. Note: ${data.assignmentCount} unfulfilled orders were using this box.`);
        } else {
          alert('Box deleted');
        }
        fetchBoxes();
      }
    } catch (error) {
      console.error('Error deleting box:', error);
      alert('Failed to delete box');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await fetch(`/api/box-selector/boxes/${id}/toggle-active`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (data.success) {
        fetchBoxes();
      }
    } catch (error) {
      console.error('Error toggling box status:', error);
      alert('Failed to toggle status');
    }
  };

  const openEditModal = (box) => {
    setEditingBox(box);
    setFormData({
      name: box.name,
      boxType: box.boxType,
      length: box.length,
      width: box.width,
      height: box.height,
      dimensionUnit: box.dimensionUnit,
      maxWeight: box.maxWeight,
      boxWeight: box.boxWeight,
      weightUnit: box.weightUnit,
      cost: box.cost || '',
      material: box.material || '',
      supplierSku: box.supplierSku || '',
      isActive: box.isActive,
      priority: box.priority,
      notes: box.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      boxType: 'box',
      length: '',
      width: '',
      height: '',
      dimensionUnit: 'inches',
      maxWeight: '',
      boxWeight: '',
      weightUnit: 'lbs',
      cost: '',
      material: '',
      supplierSku: '',
      isActive: true,
      priority: 50,
      notes: ''
    });
  };

  const calculateVolume = (l, w, h) => {
    return (parseFloat(l) * parseFloat(w) * parseFloat(h)).toFixed(2);
  };

  if (loading) {
    return (
      <div className="box-container">
        <div className="box-max-width">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
            <div style={{ fontSize: '1.25rem', color: '#6B7280' }}>Loading boxes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="box-container">
      <div className="box-max-width">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                📦 Box Library
              </h1>
              <p style={{ color: '#6B7280' }}>
                Manage shipping boxes for optimal packing
              </p>
            </div>

            <button
              onClick={() => {
                setEditingBox(null);
                resetForm();
                setShowModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={20} />
              <span>New Box</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Boxes</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>{boxes.length}</div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Active</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
              {boxes.filter(b => b.isActive).length}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Inactive</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6B7280' }}>
              {boxes.filter(b => !b.isActive).length}
            </div>
          </div>
        </div>

        {/* Boxes List */}
        {boxes.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '4rem',
            textAlign: 'center',
            border: '2px dashed #E5E7EB'
          }}>
            <Package size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Boxes</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Add your first shipping box</p>
            <button
              onClick={() => {
                setEditingBox(null);
                resetForm();
                setShowModal(true);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add First Box
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {boxes.map(box => (
              <div
                key={box.id}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  opacity: box.isActive ? 1 : 0.6
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <BoxIcon size={24} style={{ color: '#10B981' }} />
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{box.name}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: box.isActive ? '#DCFCE7' : '#F3F4F6',
                        color: box.isActive ? '#16A34A' : '#6B7280',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {box.isActive ? '✓ Active' : '○ Inactive'}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#E0F2FE',
                        color: '#0284C7',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {box.boxType}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Dimensions</div>
                        <div style={{ fontWeight: '600' }}>
                          {box.length} × {box.width} × {box.height} {box.dimensionUnit}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#10B981' }}>
                          Vol: {calculateVolume(box.length, box.width, box.height)} cu {box.dimensionUnit}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Max Weight</div>
                        <div style={{ fontWeight: '600' }}>{box.maxWeight} {box.weightUnit}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          Box: {box.boxWeight} {box.weightUnit}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Cost</div>
                        <div style={{ fontWeight: '600' }}>
                          {box.cost ? `$${parseFloat(box.cost).toFixed(2)}` : 'N/A'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Priority</div>
                        <div style={{ fontWeight: '500' }}>{box.priority}</div>
                      </div>
                    </div>

                    {(box.material || box.supplierSku) && (
                      <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#6B7280' }}>
                        {box.material && <div><strong>Material:</strong> {box.material}</div>}
                        {box.supplierSku && <div><strong>SKU:</strong> {box.supplierSku}</div>}
                      </div>
                    )}

                    {box.notes && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F0FDF4', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{box.notes}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleToggleActive(box.id)}
                      style={{
                        padding: '0.5rem',
                        background: box.isActive ? '#DCFCE7' : '#F3F4F6',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        color: box.isActive ? '#16A34A' : '#6B7280'
                      }}
                      title={box.isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power size={18} />
                    </button>

                    <button
                      onClick={() => openEditModal(box)}
                      style={{
                        padding: '0.5rem',
                        background: '#DBEAFE',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        color: '#2563EB'
                      }}
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(box.id)}
                      style={{
                        padding: '0.5rem',
                        background: '#FEE2E2',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        color: '#DC2626'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              width: '90%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                {editingBox ? 'Edit Box' : 'Create Box'}
              </h2>

              <form onSubmit={handleCreateEdit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Box Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="e.g. Small Mailer 6x4x2"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                      <select
                        value={formData.boxType}
                        onChange={(e) => setFormData({ ...formData, boxType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="box">Box</option>
                        <option value="mailer">Mailer</option>
                        <option value="envelope">Envelope</option>
                        <option value="tube">Tube</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Dimensions * (Length × Width × Height)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        required
                        placeholder="Length"
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        required
                        placeholder="Width"
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        required
                        placeholder="Height"
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <select
                        value={formData.dimensionUnit}
                        onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value })}
                        style={{
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="inches">inches</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                    {formData.length && formData.width && formData.height && (
                      <div style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.5rem' }}>
                        Volume: {calculateVolume(formData.length, formData.width, formData.height)} cubic {formData.dimensionUnit}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Max Weight *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.maxWeight}
                        onChange={(e) => setFormData({ ...formData, maxWeight: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Box Weight *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.boxWeight}
                        onChange={(e) => setFormData({ ...formData, boxWeight: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Unit</label>
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="lbs">lbs</option>
                        <option value="kg">kg</option>
                        <option value="oz">oz</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Material</label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                        placeholder="e.g. Corrugated"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Supplier SKU</label>
                      <input
                        type="text"
                        value={formData.supplierSku}
                        onChange={(e) => setFormData({ ...formData, supplierSku: e.target.value })}
                        placeholder="BOX-001"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority (1-100)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          style={{ width: '20px', height: '20px' }}
                        />
                        <span>Active</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
                      placeholder="Additional notes about this box..."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {editingBox ? 'Update Box' : 'Create Box'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBox(null);
                      resetForm();
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .box-container {
          min-height: 100vh;
          background: #F9FAFB;
          padding: 2rem;
        }
        .box-max-width {
          max-width: 1400px;
          margin: 0 auto;
        }
        .loading-spinner {
          border: 3px solid #F3F4F6;
          border-top: 3px solid #10B981;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default BoxLibrary;
