// WholesalePricingRules.js - Manage wholesale pricing rules
// Location: /frontend/src/components/WholesalePricingRules.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Power, TrendingUp } from 'lucide-react';

function WholesalePricingRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'common',
    status: 'unpublished',
    discountType: 'percentage',
    discountValue: '',
    customerTags: [],
    customerTargeting: 'tagged',
    productScope: 'all',
    priority: 50,
    notes: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wholesale/pricing-rules');
      const data = await response.json();

      if (data.success) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
      alert('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEdit = async (e) => {
    e.preventDefault();

    try {
      const url = editingRule
        ? `/api/wholesale/pricing-rules/${editingRule.id}`
        : '/api/wholesale/pricing-rules';

      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingRule ? 'Rule updated!' : 'Rule created!');
        setShowModal(false);
        setEditingRule(null);
        resetForm();
        fetchRules();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('Failed to save rule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pricing rule?')) return;

    try {
      const response = await fetch(`/api/wholesale/pricing-rules/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('Rule deleted');
        fetchRules();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`/api/wholesale/pricing-rules/${id}/toggle-status`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (data.success) {
        fetchRules();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      status: rule.status,
      discountType: rule.discountType,
      discountValue: rule.discountValue,
      customerTags: rule.customerTags || [],
      customerTargeting: rule.customerTargeting,
      productScope: rule.productScope,
      priority: rule.priority,
      notes: rule.notes || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'common',
      status: 'unpublished',
      discountType: 'percentage',
      discountValue: '',
      customerTags: [],
      customerTargeting: 'tagged',
      productScope: 'all',
      priority: 50,
      notes: ''
    });
  };

  if (loading) {
    return (
      <div className="wholesale-container">
        <div className="wholesale-max-width">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
            <div style={{ fontSize: '1.25rem', color: '#6B7280' }}>Loading pricing rules...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wholesale-container">
      <div className="wholesale-max-width">
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
                💰 Wholesale Pricing Rules
              </h1>
              <p style={{ color: '#6B7280' }}>
                Manage discount rules for wholesale customers
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRule(null);
                resetForm();
                setShowModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={20} />
              <span>New Rule</span>
            </button>
          </div>
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '4rem',
            textAlign: 'center',
            border: '2px dashed #E5E7EB'
          }}>
            <TrendingUp size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Pricing Rules</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Create your first wholesale pricing rule</p>
            <button
              onClick={() => {
                setEditingRule(null);
                resetForm();
                setShowModal(true);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create First Rule
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rules.map(rule => (
              <div
                key={rule.id}
                style={{
                  background: 'white',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{rule.name}</h3>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: rule.status === 'published' ? '#DCFCE7' : '#F3F4F6',
                        color: rule.status === 'published' ? '#16A34A' : '#6B7280',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {rule.status === 'published' ? '✓ Published' : '○ Draft'}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#FEF3C7',
                        color: '#D97706',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {rule.type}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Discount</div>
                        <div style={{ fontWeight: '600', fontSize: '1.125rem', color: '#F59E0B' }}>
                          {rule.discountType === 'percentage' && `${rule.discountValue}% off`}
                          {rule.discountType === 'fixed_amount' && `$${rule.discountValue} off`}
                          {rule.discountType === 'fixed_price' && `$${rule.discountValue} fixed`}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Targeting</div>
                        <div style={{ fontWeight: '500' }}>{rule.customerTargeting}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Priority</div>
                        <div style={{ fontWeight: '500' }}>{rule.priority}</div>
                      </div>
                    </div>

                    {rule.notes && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#F9FAFB', borderRadius: '0.5rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{rule.notes}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleToggleStatus(rule.id)}
                      style={{
                        padding: '0.5rem',
                        background: rule.status === 'published' ? '#DCFCE7' : '#F3F4F6',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        color: rule.status === 'published' ? '#16A34A' : '#6B7280'
                      }}
                      title={rule.status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      <Power size={18} />
                    </button>

                    <button
                      onClick={() => openEditModal(rule)}
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
                      onClick={() => handleDelete(rule.id)}
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
              </h2>

              <form onSubmit={handleCreateEdit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rule Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="common">Common</option>
                        <option value="individual">Individual</option>
                        <option value="volume">Volume</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="unpublished">Unpublished</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <option value="percentage">Percentage Off</option>
                        <option value="fixed_amount">Fixed Amount Off</option>
                        <option value="fixed_price">Fixed Price</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Discount Value
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #E5E7EB',
                          borderRadius: '0.5rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Targeting</label>
                    <select
                      value={formData.customerTargeting}
                      onChange={(e) => setFormData({ ...formData, customerTargeting: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <option value="tagged">Tagged Customers</option>
                      <option value="all_logged_in">All Logged In</option>
                      <option value="all_customers">All Customers</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Scope</label>
                    <select
                      value={formData.productScope}
                      onChange={(e) => setFormData({ ...formData, productScope: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <option value="all">All Products</option>
                      <option value="collections">Specific Collections</option>
                      <option value="specific">Specific Products</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Priority (1-100)
                    </label>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes (Optional)</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="3"
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
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingRule(null);
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
        .wholesale-container {
          min-height: 100vh;
          background: #F9FAFB;
          padding: 2rem;
        }
        .wholesale-max-width {
          max-width: 1200px;
          margin: 0 auto;
        }
        .loading-spinner {
          border: 3px solid #F3F4F6;
          border-top: 3px solid #F59E0B;
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

export default WholesalePricingRules;
