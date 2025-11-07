// BoxSettings.js - Configure box selector and packing algorithm settings
// Location: /frontend/src/components/BoxSettings.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Settings as SettingsIcon } from 'lucide-react';

function BoxSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Packing algorithm settings
    packingBufferPercentage: 20,
    packingMaterialWeight: 0.1,
    packingMaterialWeightUnit: 'lbs',
    boxSelectionStrategy: 'smallest_volume',

    // Units configuration
    defaultDimensionUnit: 'inches',
    defaultWeightUnit: 'lbs',

    // Carrier integration
    enableUSPS: true,
    enableUPS: false,
    enableFedEx: false,
    uspsApiKey: '',
    upsApiKey: '',
    fedexApiKey: '',
    originAddress: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    },

    // Order settings
    autoAssignBoxes: true,
    sendNotifications: false,
    notificationEmail: '',
    includeBoxInfoInPackingSlips: true,

    // Fallback behavior
    fallbackBehavior: 'largest_box',

    // Advanced settings
    debugMode: false,
    enableManualOverride: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/box-selector/settings');
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
      const response = await fetch('/api/box-selector/settings', {
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
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>⚙️ Box Selector Settings</h1>
            <p style={{ color: '#6B7280' }}>Configure packing algorithm and box selection behavior</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: saving ? '#D1D5DB' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Save size={20} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Packing Algorithm */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981' }}>Packing Algorithm</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Packing Buffer Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.packingBufferPercentage}
                    onChange={(e) => setSettings({ ...settings, packingBufferPercentage: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                  />
                  <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                    Extra space to account for irregular shapes and packing inefficiency (0-100%)
                  </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Packing Material Weight</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.packingMaterialWeight}
                      onChange={(e) => setSettings({ ...settings, packingMaterialWeight: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Unit</label>
                    <select value={settings.packingMaterialWeightUnit} onChange={(e) => setSettings({ ...settings, packingMaterialWeightUnit: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                      <option value="lbs">Pounds (lbs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="g">Grams (g)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Box Selection Strategy</label>
                  <select value={settings.boxSelectionStrategy} onChange={(e) => setSettings({ ...settings, boxSelectionStrategy: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="smallest_volume">Smallest Volume (minimize box size)</option>
                    <option value="lowest_cost">Lowest Cost (minimize shipping cost)</option>
                    <option value="highest_priority">Highest Priority (use priority ranking)</option>
                    <option value="best_fit">Best Fit (optimize packing efficiency)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Default Units */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981' }}>Default Units</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Dimension Unit</label>
                  <select value={settings.defaultDimensionUnit} onChange={(e) => setSettings({ ...settings, defaultDimensionUnit: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="inches">Inches</option>
                    <option value="cm">Centimeters</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Weight Unit</label>
                  <select value={settings.defaultWeightUnit} onChange={(e) => setSettings({ ...settings, defaultWeightUnit: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="oz">Ounces (oz)</option>
                    <option value="g">Grams (g)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Carrier Integration */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981' }}>Carrier Integration</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" checked={settings.enableUSPS} onChange={(e) => setSettings({ ...settings, enableUSPS: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>Enable USPS</span>
                  </label>
                  {settings.enableUSPS && (
                    <div style={{ marginLeft: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>USPS API Key</label>
                      <input
                        type="text"
                        value={settings.uspsApiKey}
                        onChange={(e) => setSettings({ ...settings, uspsApiKey: e.target.value })}
                        placeholder="Enter USPS API key"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" checked={settings.enableUPS} onChange={(e) => setSettings({ ...settings, enableUPS: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>Enable UPS</span>
                  </label>
                  {settings.enableUPS && (
                    <div style={{ marginLeft: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>UPS API Key</label>
                      <input
                        type="text"
                        value={settings.upsApiKey}
                        onChange={(e) => setSettings({ ...settings, upsApiKey: e.target.value })}
                        placeholder="Enter UPS API key"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" checked={settings.enableFedEx} onChange={(e) => setSettings({ ...settings, enableFedEx: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>Enable FedEx</span>
                  </label>
                  {settings.enableFedEx && (
                    <div style={{ marginLeft: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>FedEx API Key</label>
                      <input
                        type="text"
                        value={settings.fedexApiKey}
                        onChange={(e) => setSettings({ ...settings, fedexApiKey: e.target.value })}
                        placeholder="Enter FedEx API key"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500' }}>Origin Address (for shipping calculations)</label>
                  <div style={{ display: 'grid', gap: '0.75rem', padding: '1rem', background: '#F9FAFB', borderRadius: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Street Address Line 1"
                      value={settings.originAddress.street1}
                      onChange={(e) => setSettings({ ...settings, originAddress: { ...settings.originAddress, street1: e.target.value } })}
                      style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Street Address Line 2 (optional)"
                      value={settings.originAddress.street2}
                      onChange={(e) => setSettings({ ...settings, originAddress: { ...settings.originAddress, street2: e.target.value } })}
                      style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="text"
                        placeholder="City"
                        value={settings.originAddress.city}
                        onChange={(e) => setSettings({ ...settings, originAddress: { ...settings.originAddress, city: e.target.value } })}
                        style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={settings.originAddress.state}
                        onChange={(e) => setSettings({ ...settings, originAddress: { ...settings.originAddress, state: e.target.value } })}
                        style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}
                      />
                      <input
                        type="text"
                        placeholder="ZIP"
                        value={settings.originAddress.zip}
                        onChange={(e) => setSettings({ ...settings, originAddress: { ...settings.originAddress, zip: e.target.value } })}
                        style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}
                      />
                    </div>
                    <select
                      value={settings.originAddress.country}
                      onChange={(e) => setSettings({ ...settings, originAddress: { ...settings.originAddress, country: e.target.value } })}
                      style={{ padding: '0.5rem', border: '1px solid #E5E7EB', borderRadius: '0.375rem' }}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="MX">Mexico</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Settings */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981' }}>Order Settings</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.autoAssignBoxes} onChange={(e) => setSettings({ ...settings, autoAssignBoxes: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Automatically assign boxes to new orders</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.includeBoxInfoInPackingSlips} onChange={(e) => setSettings({ ...settings, includeBoxInfoInPackingSlips: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Include box information in packing slips</span>
                </label>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" checked={settings.sendNotifications} onChange={(e) => setSettings({ ...settings, sendNotifications: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontWeight: '500' }}>Send email notifications for box assignments</span>
                  </label>
                  {settings.sendNotifications && (
                    <div style={{ marginLeft: '2rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Notification Email</label>
                      <input
                        type="email"
                        value={settings.notificationEmail}
                        onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                        placeholder="email@example.com"
                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fallback Behavior */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981' }}>Fallback Behavior</h3>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>When no suitable box is found</label>
                <select value={settings.fallbackBehavior} onChange={(e) => setSettings({ ...settings, fallbackBehavior: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                  <option value="error">Show Error (require manual intervention)</option>
                  <option value="largest_box">Use Largest Available Box</option>
                  <option value="no_shipping">Mark as No Shipping Required</option>
                </select>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem' }}>
                  Determines what happens when items don't fit in any available box
                </p>
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#10B981' }}>Advanced Settings</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.enableManualOverride} onChange={(e) => setSettings({ ...settings, enableManualOverride: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Allow manual box override</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={settings.debugMode} onChange={(e) => setSettings({ ...settings, debugMode: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontWeight: '500' }}>Enable debug mode (detailed logging)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button (sticky at bottom) */}
        <div style={{ position: 'sticky', bottom: '2rem', marginTop: '2rem' }}>
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', background: saving ? '#D1D5DB' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Save size={24} />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoxSettings;
