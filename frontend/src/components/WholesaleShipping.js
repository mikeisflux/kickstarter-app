// WholesaleShipping.js - Manage wholesale shipping rules
// Location: /frontend/src/components/WholesaleShipping.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Truck } from 'lucide-react';

function WholesaleShipping() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shippingTitle: '',
    shippingMessage: '',
    status: 'active',
    customerTags: '',
    customerTargeting: 'tagged',
    geographicScope: 'all',
    countries: '',
    chargeType: 'flat_rate',
    chargeValue: '',
    conditionBasis: 'cart_total',
    minAmount: '',
    maxAmount: '',
    priority: 50
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wholesale/shipping-rules');
      const data = await response.json();
      if (data.success) setRules(data.rules);
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
        customerTags: formData.customerTags ? formData.customerTags.split(',').map(t => t.trim()) : [],
        countries: formData.countries ? formData.countries.split(',').map(c => c.trim()) : []
      };

      const url = editingRule ? `/api/wholesale/shipping-rules/${editingRule.id}` : '/api/wholesale/shipping-rules';
      const method = editingRule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        alert(editingRule ? 'Rule updated!' : 'Rule created!');
        setShowModal(false);
        setEditingRule(null);
        fetchRules();
      }
    } catch (error) {
      alert('Error saving rule');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipping rule?')) return;
    try {
      await fetch(`/api/wholesale/shipping-rules/${id}`, { method: 'DELETE' });
      fetchRules();
    } catch (error) {
      alert('Error deleting rule');
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
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>🚚 Wholesale Shipping Rules</h1>
            <p style={{ color: '#6B7280' }}>Manage custom shipping rates for wholesale customers</p>
          </div>
          <button onClick={() => { setEditingRule(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={20} />
            <span>New Rule</span>
          </button>
        </div>

        {rules.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '4rem', textAlign: 'center', border: '2px dashed #E5E7EB' }}>
            <Truck size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Shipping Rules</h3>
            <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>Create your first wholesale shipping rule</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rules.map(rule => (
              <div key={rule.id} style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{rule.name}</h3>
                      <span style={{ padding: '0.25rem 0.75rem', background: rule.status === 'active' ? '#DCFCE7' : '#F3F4F6', color: rule.status === 'active' ? '#16A34A' : '#6B7280', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>
                        {rule.status === 'active' ? '✓ Active' : '○ Inactive'}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#F59E0B', marginBottom: '1rem' }}>
                      {rule.shippingTitle}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Charge</div>
                        <div style={{ fontWeight: '600' }}>
                          {rule.chargeType === 'flat_rate' && `$${rule.chargeValue}`}
                          {rule.chargeType === 'percentage' && `${rule.chargeValue}%`}
                          {rule.chargeType === 'conditional' && 'Conditional'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Targeting</div>
                        <div style={{ fontWeight: '500' }}>{rule.customerTargeting}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Priority</div>
                        <div style={{ fontWeight: '500' }}>{rule.priority}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button onClick={() => { setEditingRule(rule); setFormData({ ...rule, customerTags: rule.customerTags.join(', '), countries: rule.countries.join(', ') }); setShowModal(true); }} style={{ padding: '0.5rem', background: '#DBEAFE', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#2563EB' }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(rule.id)} style={{ padding: '0.5rem', background: '#FEE2E2', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#DC2626' }}>
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
                {editingRule ? 'Edit Shipping Rule' : 'Create Shipping Rule'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rule Name *</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Shipping Title * (shown to customer)</label>
                    <input type="text" value={formData.shippingTitle} onChange={(e) => setFormData({ ...formData, shippingTitle: e.target.value })} required maxLength="80" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Shipping Message (optional)</label>
                    <input type="text" value={formData.shippingMessage} onChange={(e) => setFormData({ ...formData, shippingMessage: e.target.value })} maxLength="160" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Targeting</label>
                      <select value={formData.customerTargeting} onChange={(e) => setFormData({ ...formData, customerTargeting: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="tagged">Tagged Customers</option>
                        <option value="all_logged_in">All Logged In</option>
                        <option value="all_customers">All Customers</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Tags (comma-separated)</label>
                    <input type="text" value={formData.customerTags} onChange={(e) => setFormData({ ...formData, customerTags: e.target.value })} placeholder="wholesale, vip, partner" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Charge Type</label>
                      <select value={formData.chargeType} onChange={(e) => setFormData({ ...formData, chargeType: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                        <option value="flat_rate">Flat Rate</option>
                        <option value="percentage">Percentage</option>
                        <option value="conditional">Conditional</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Charge Value *</label>
                      <input type="number" step="0.01" value={formData.chargeValue} onChange={(e) => setFormData({ ...formData, chargeValue: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                  </div>
                  {formData.chargeType === 'conditional' && (
                    <>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Condition Basis</label>
                        <select value={formData.conditionBasis} onChange={(e) => setFormData({ ...formData, conditionBasis: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                          <option value="cart_total">Cart Total</option>
                          <option value="cart_items">Cart Items</option>
                          <option value="cart_weight">Cart Weight</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Min Amount</label>
                          <input type="number" step="0.01" value={formData.minAmount} onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Max Amount</label>
                          <input type="number" step="0.01" value={formData.maxAmount} onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                        </div>
                      </div>
                    </>
                  )}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Priority (1-100)</label>
                    <input type="number" min="1" max="100" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    {editingRule ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingRule(null); }} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
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

export default WholesaleShipping;
