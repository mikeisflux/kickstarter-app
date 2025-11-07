// WholesaleOrderLimits.js - Manage order minimum requirements
// Location: /frontend/src/components/WholesaleOrderLimits.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Tag } from 'lucide-react';

function WholesaleOrderLimits() {
  const navigate = useNavigate();
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLimit, setEditingLimit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    customerTags: '',
    customerTargeting: 'tagged',
    orderScope: 'all',
    minimumType: 'amount',
    minimumValue: '',
    firstOrderMinimum: '',
    subsequentOrderMinimum: '',
    conditionLogic: 'all',
    failureAction: 'block_order',
    customMessage: ''
  });

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wholesale/order-limits');
      const data = await response.json();
      if (data.success) setLimits(data.limits);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        customerTags: formData.customerTags ? formData.customerTags.split(',').map(t => t.trim()) : []
      };

      const url = editingLimit ? `/api/wholesale/order-limits/${editingLimit.id}` : '/api/wholesale/order-limits';
      const method = editingLimit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        alert(editingLimit ? 'Limit updated!' : 'Limit created!');
        setShowModal(false);
        setEditingLimit(null);
        fetchLimits();
      }
    } catch (error) {
      alert('Error saving limit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order limit?')) return;
    try {
      await fetch(`/api/wholesale/order-limits/${id}`, { method: 'DELETE' });
      fetchLimits();
    } catch (error) {
      alert('Error deleting limit');
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>🏷️ Wholesale Order Limits</h1>
            <p style={{ color: '#6B7280' }}>Set minimum order requirements for wholesale customers</p>
          </div>
          <button onClick={() => { setEditingLimit(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={20} />
            <span>New Limit</span>
          </button>
        </div>

        {limits.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '4rem', textAlign: 'center', border: '2px dashed #E5E7EB' }}>
            <Tag size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Order Limits</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Create your first order minimum requirement</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {limits.map(limit => (
              <div key={limit.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{limit.name}</h3>
                      <span style={{ padding: '0.25rem 0.75rem', background: limit.status === 'active' ? '#DCFCE7' : '#F3F4F6', color: limit.status === 'active' ? '#16A34A' : '#6B7280', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>
                        {limit.status === 'active' ? '✓ Active' : '○ Inactive'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Minimum</div>
                        <div style={{ fontWeight: '600', fontSize: '1.125rem', color: '#F59E0B' }}>
                          {limit.minimumType === 'amount' ? `$${limit.minimumValue}` : `${limit.minimumValue} items`}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Scope</div>
                        <div style={{ fontWeight: '500' }}>{limit.orderScope.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Action</div>
                        <div style={{ fontWeight: '500' }}>{limit.failureAction.replace('_', ' ')}</div>
                      </div>
                    </div>
                    {limit.customMessage && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FFFBEB', borderRadius: '0.5rem', fontSize: '0.875rem', color: '#92400E' }}>
                        <strong>Message:</strong> {limit.customMessage}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button onClick={() => { setEditingLimit(limit); setFormData({ ...limit, customerTags: limit.customerTags.join(', ') }); setShowModal(true); }} style={{ padding: '0.5rem', background: '#DBEAFE', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#2563EB' }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(limit.id)} style={{ padding: '0.5rem', background: '#FEE2E2', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#DC2626' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                {editingLimit ? 'Edit Order Limit' : 'Create Order Limit'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rule Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Targeting</label>
                      <select value={formData.customerTargeting} onChange={(e) => setFormData({ ...formData, customerTargeting: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="tagged">Tagged Customers</option>
                        <option value="all_logged_in">All Logged In</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Tags (comma-separated)</label>
                    <input type="text" value={formData.customerTags} onChange={(e) => setFormData({ ...formData, customerTags: e.target.value })} placeholder="wholesale, vip" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Order Scope</label>
                    <select value={formData.orderScope} onChange={(e) => setFormData({ ...formData, orderScope: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                      <option value="all">All Orders</option>
                      <option value="first_only">First Orders Only</option>
                      <option value="first_and_subsequent">First & Subsequent</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Minimum Type</label>
                      <select value={formData.minimumType} onChange={(e) => setFormData({ ...formData, minimumType: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="amount">Amount ($)</option>
                        <option value="quantity">Quantity (items)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Minimum Value *</label>
                      <input type="number" step="0.01" value={formData.minimumValue} onChange={(e) => setFormData({ ...formData, minimumValue: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Failure Action</label>
                    <select value={formData.failureAction} onChange={(e) => setFormData({ ...formData, failureAction: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                      <option value="block_order">Block Order</option>
                      <option value="retail_price">Allow at Retail Price</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Custom Message (shown to customer)</label>
                    <textarea value={formData.customMessage} onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })} rows="3" placeholder="e.g. Minimum order of $100 required for wholesale pricing" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    {editingLimit ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingLimit(null); }} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WholesaleOrderLimits;
