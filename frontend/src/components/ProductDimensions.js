// ProductDimensions.js - Manage product dimensions for box selector
// Location: /frontend/src/components/ProductDimensions.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Package, Upload, Search, Download } from 'lucide-react';

function ProductDimensions() {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingDimension, setEditingDimension] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    productTitle: '',
    variantTitle: '',
    sku: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    dimensionUnit: 'inches',
    weightUnit: 'lbs',
    fragile: false,
    requiresPadding: false,
    cannotStack: false,
    notes: ''
  });

  useEffect(() => {
    fetchDimensions();
  }, []);

  const fetchDimensions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/box-selector/product-dimensions');
      const data = await response.json();
      if (data.success) setDimensions(data.dimensions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDimension
        ? `/api/box-selector/product-dimensions/${editingDimension.id}`
        : '/api/box-selector/product-dimensions';
      const method = editingDimension ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        alert(editingDimension ? 'Dimensions updated!' : 'Dimensions added!');
        setShowModal(false);
        setEditingDimension(null);
        resetForm();
        fetchDimensions();
      }
    } catch (error) {
      alert('Error saving dimensions');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product dimension?')) return;
    try {
      await fetch(`/api/box-selector/product-dimensions/${id}`, { method: 'DELETE' });
      fetchDimensions();
    } catch (error) {
      alert('Error deleting dimension');
    }
  };

  const handleBulkImport = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', csvFile);

      const response = await fetch('/api/box-selector/product-dimensions/bulk-import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        alert(`Import completed! ${data.summary.successful} products imported, ${data.summary.failed} failed.`);
        setShowBulkImport(false);
        setCsvFile(null);
        fetchDimensions();
      } else {
        alert('Import failed: ' + data.error);
      }
    } catch (error) {
      alert('Error importing CSV: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'productId,variantId,productTitle,variantTitle,sku,length,width,height,weight,dimensionUnit,weightUnit,fragile,requiresPadding,cannotStack,notes\n' +
      '123456,789012,Sample Product,Medium / Blue,SKU-001,12,8,6,2.5,inches,lbs,false,false,false,Sample notes';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_dimensions_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      variantId: '',
      productTitle: '',
      variantTitle: '',
      sku: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      dimensionUnit: 'inches',
      weightUnit: 'lbs',
      fragile: false,
      requiresPadding: false,
      cannotStack: false,
      notes: ''
    });
  };

  const calculateVolume = (length, width, height) => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;
    return (l * w * h).toFixed(2);
  };

  const filteredDimensions = dimensions.filter(dim => {
    const search = searchTerm.toLowerCase();
    return (
      dim.productTitle?.toLowerCase().includes(search) ||
      dim.variantTitle?.toLowerCase().includes(search) ||
      dim.sku?.toLowerCase().includes(search) ||
      dim.productId?.toString().includes(search)
    );
  });

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>📦 Product Dimensions</h1>
            <p style={{ color: '#6B7280' }}>Manage product dimensions for optimal box selection</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowBulkImport(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
              <Upload size={20} />
              <span>Bulk Import</span>
            </button>
            <button onClick={() => { setEditingDimension(null); resetForm(); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
              <Plus size={20} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by product title, SKU, or product ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', fontSize: '1rem' }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Products</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>{dimensions.length}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Fragile Items</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>{dimensions.filter(d => d.fragile).length}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Requires Padding</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>{dimensions.filter(d => d.requiresPadding).length}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Cannot Stack</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#EF4444' }}>{dimensions.filter(d => d.cannotStack).length}</div>
          </div>
        </div>

        {filteredDimensions.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '4rem', textAlign: 'center', border: '2px dashed #E5E7EB' }}>
            <Package size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Product Dimensions</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Add product dimensions manually or import from CSV</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Product</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>SKU</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Dimensions (L×W×H)</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Volume</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Weight</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Flags</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDimensions.map(dim => (
                    <tr key={dim.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{dim.productTitle}</div>
                        {dim.variantTitle && <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{dim.variantTitle}</div>}
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ID: {dim.productId}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{dim.sku || '-'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{dim.length} × {dim.width} × {dim.height}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{dim.dimensionUnit}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#10B981' }}>{calculateVolume(dim.length, dim.width, dim.height)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{dim.dimensionUnit}³</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{dim.weight}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{dim.weightUnit}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {dim.fragile && <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: '#FEF3C7', color: '#92400E', borderRadius: '0.25rem', width: 'fit-content' }}>Fragile</span>}
                          {dim.requiresPadding && <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: '#DBEAFE', color: '#1E40AF', borderRadius: '0.25rem', width: 'fit-content' }}>Padding</span>}
                          {dim.cannotStack && <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: '#FEE2E2', color: '#991B1B', borderRadius: '0.25rem', width: 'fit-content' }}>No Stack</span>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => { setEditingDimension(dim); setFormData(dim); setShowModal(true); }} style={{ padding: '0.5rem', background: '#DBEAFE', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#2563EB' }}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(dim.id)} style={{ padding: '0.5rem', background: '#FEE2E2', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#DC2626' }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                {editingDimension ? 'Edit Product Dimensions' : 'Add Product Dimensions'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product ID *</label>
                      <input type="text" value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Variant ID</label>
                      <input type="text" value={formData.variantId} onChange={(e) => setFormData({ ...formData, variantId: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Title *</label>
                      <input type="text" value={formData.productTitle} onChange={(e) => setFormData({ ...formData, productTitle: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Variant Title</label>
                      <input type="text" value={formData.variantTitle} onChange={(e) => setFormData({ ...formData, variantTitle: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>SKU</label>
                    <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Length *</label>
                      <input type="number" step="0.01" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Width *</label>
                      <input type="number" step="0.01" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Height *</label>
                      <input type="number" step="0.01" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Unit</label>
                      <select value={formData.dimensionUnit} onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="inches">Inches</option>
                        <option value="cm">Centimeters</option>
                      </select>
                    </div>
                  </div>
                  {formData.length && formData.width && formData.height && (
                    <div style={{ padding: '1rem', background: '#ECFDF5', borderRadius: '0.5rem', border: '1px solid #10B981' }}>
                      <div style={{ fontSize: '0.875rem', color: '#047857' }}>
                        <strong>Volume:</strong> {calculateVolume(formData.length, formData.width, formData.height)} {formData.dimensionUnit}³
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight *</label>
                      <input type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Unit</label>
                      <select value={formData.weightUnit} onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="lbs">Pounds (lbs)</option>
                        <option value="kg">Kilograms (kg)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="g">Grams (g)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>Special Handling</label>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" checked={formData.fragile} onChange={(e) => setFormData({ ...formData, fragile: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontWeight: '500' }}>Fragile (requires careful handling)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" checked={formData.requiresPadding} onChange={(e) => setFormData({ ...formData, requiresPadding: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontWeight: '500' }}>Requires padding (extra packaging material)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input type="checkbox" checked={formData.cannotStack} onChange={(e) => setFormData({ ...formData, cannotStack: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                        <span style={{ fontWeight: '500' }}>Cannot stack (nothing can be placed on top)</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" placeholder="Any additional notes..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    {editingDimension ? 'Update' : 'Add Product'}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingDimension(null); resetForm(); }} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkImport && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '600px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Bulk Import Product Dimensions</h2>

              <div style={{ marginBottom: '2rem' }}>
                <button onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', margin: '0 auto' }}>
                  <Download size={20} />
                  <span>Download CSV Template</span>
                </button>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem', textAlign: 'center' }}>
                  Use this template to ensure correct formatting
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                />
                {csvFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#10B981' }}>
                    ✓ Selected: {csvFile.name}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleBulkImport} disabled={!csvFile || importing} style={{ flex: 1, padding: '0.75rem', background: importing ? '#D1D5DB' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: importing || !csvFile ? 'not-allowed' : 'pointer' }}>
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button onClick={() => { setShowBulkImport(false); setCsvFile(null); }} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDimensions;
