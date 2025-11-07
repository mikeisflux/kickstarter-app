// WholesaleSettings.js - Global wholesale configuration
// Location: /frontend/src/components/WholesaleSettings.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings as SettingsIcon } from 'lucide-react';

function WholesaleSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    showCrossedOutPrices: true,
    useCompareAtPrice: false,
    couponFieldAccess: 'disabled',
    preventAutoDiscounts: true,
    discountMethod: 'draft_order',
    discountLabel: 'WHOLESALE DISCOUNT',
    signupFormOption: 'both',
    wholesaleSignupUrl: '',
    wholesaleSignupLabel: 'Create wholesale account',
    chargeAdditionalFee: false,
    additionalFeeType: 'percentage',
    additionalFeeValue: '',
    additionalFeeLabel: 'Processing Fee',
    saleClockEnabled: false,
    saleClockBackgroundColor: '#000000',
    saleClockForegroundColor: '#ffffff',
    saleClockTextAlign: 'left',
    saleClockFontSize: 14,
    saleClockBorderRadius: 4,
    mode: 'test',
    themeAppEmbedEnabled: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wholesale/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/wholesale/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        alert('Settings saved successfully!');
      } else {
        alert('Error saving settings');
      }
    } catch (error) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>⚙️ Wholesale Settings</h1>
            <p style={{ color: '#6B7280' }}>Configure global wholesale pricing behavior</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: saving ? '#D1D5DB' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Display Settings */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#F59E0B' }}>Display Settings</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.showCrossedOutPrices} onChange={(e) => setSettings({ ...settings, showCrossedOutPrices: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Show crossed-out retail prices</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.useCompareAtPrice} onChange={(e) => setSettings({ ...settings, useCompareAtPrice: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Use compare-at price as crossed-out price</span>
                </label>
              </div>
            </div>

            {/* Checkout Settings */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#F59E0B' }}>Checkout Settings</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Discount Method</label>
                  <select value={settings.discountMethod} onChange={(e) => setSettings({ ...settings, discountMethod: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="draft_order">Draft Order API (Recommended)</option>
                    <option value="coupon_code">Coupon Code API</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Discount Label</label>
                  <input type="text" value={settings.discountLabel} onChange={(e) => setSettings({ ...settings, discountLabel: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Coupon Field Access</label>
                  <select value={settings.couponFieldAccess} onChange={(e) => setSettings({ ...settings, couponFieldAccess: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="disabled">Disabled for Wholesale</option>
                    <option value="tagged">Tagged Customers Only</option>
                    <option value="all">All Customers</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.preventAutoDiscounts} onChange={(e) => setSettings({ ...settings, preventAutoDiscounts: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Prevent Shopify automatic discounts</span>
                </label>
              </div>
            </div>

            {/* Signup Settings */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#F59E0B' }}>Signup Form Settings</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Signup Form Option</label>
                  <select value={settings.signupFormOption} onChange={(e) => setSettings({ ...settings, signupFormOption: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="none">No Wholesale Signup Link</option>
                    <option value="wholesale_only">Wholesale Only</option>
                    <option value="both">Both (Default + Wholesale)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Wholesale Signup URL</label>
                  <input type="text" value={settings.wholesaleSignupUrl} onChange={(e) => setSettings({ ...settings, wholesaleSignupUrl: e.target.value })} placeholder="https://yourstore.com/pages/wholesale" style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Signup Link Label</label>
                  <input type="text" value={settings.wholesaleSignupLabel} onChange={(e) => setSettings({ ...settings, wholesaleSignupLabel: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                </div>
              </div>
            </div>

            {/* Additional Fee */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#F59E0B' }}>Additional Fees</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.chargeAdditionalFee} onChange={(e) => setSettings({ ...settings, chargeAdditionalFee: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Charge additional fee for wholesale orders</span>
                </label>
                {settings.chargeAdditionalFee && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fee Type</label>
                        <select value={settings.additionalFeeType} onChange={(e) => setSettings({ ...settings, additionalFeeType: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fee Value</label>
                        <input type="number" step="0.01" value={settings.additionalFeeValue} onChange={(e) => setSettings({ ...settings, additionalFeeValue: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Fee Label</label>
                      <input type="text" value={settings.additionalFeeLabel} onChange={(e) => setSettings({ ...settings, additionalFeeLabel: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mode */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#F59E0B' }}>Application Mode</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mode</label>
                <select value={settings.mode} onChange={(e) => setSettings({ ...settings, mode: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                  <option value="test">Test Mode (Preview)</option>
                  <option value="live">Live Mode (Deploy)</option>
                </select>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                  Test mode allows you to preview features without affecting live customers
                </p>
              </div>
            </div>

            {/* Theme Integration */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#F59E0B' }}>Theme Integration</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" checked={settings.themeAppEmbedEnabled} onChange={(e) => setSettings({ ...settings, themeAppEmbedEnabled: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontWeight: '500' }}>Enable theme app embed</span>
              </label>
              <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                Enable this in your Shopify theme customizer under "App embeds"
              </p>
            </div>
          </div>
        </div>

        {/* Save Button (sticky at bottom) */}
        <div style={{ position: 'sticky', bottom: '2rem', marginTop: '2rem' }}>
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: saving ? '#D1D5DB' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Save size={24} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WholesaleSettings;
