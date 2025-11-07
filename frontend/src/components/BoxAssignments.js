// BoxAssignments.js - View and manage order-to-box assignments
// Location: /frontend/src/components/BoxAssignments.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Filter, Edit2, RotateCcw, Download, Calendar } from 'lucide-react';

function BoxAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, assigned, unassigned
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [overrideBoxId, setOverrideBoxId] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchBoxes();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/box-selector/box-assignments');
      const data = await response.json();
      if (data.success) setAssignments(data.assignments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoxes = async () => {
    try {
      const response = await fetch('/api/box-selector/boxes');
      const data = await response.json();
      if (data.success) setBoxes(data.boxes);
    } catch (error) {
      console.error('Error fetching boxes:', error);
    }
  };

  const handleOverride = async () => {
    if (!overrideBoxId) {
      alert('Please select a box');
      return;
    }

    try {
      const response = await fetch(`/api/box-selector/box-assignments/${selectedAssignment.id}/override`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxId: overrideBoxId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Box assignment updated!');
        setShowOverrideModal(false);
        setSelectedAssignment(null);
        setOverrideBoxId('');
        fetchAssignments();
      } else {
        alert('Error updating assignment: ' + data.error);
      }
    } catch (error) {
      alert('Error updating assignment');
    }
  };

  const handleResetToAuto = async (id) => {
    if (!window.confirm('Reset to automatic box selection?')) return;

    try {
      const response = await fetch(`/api/box-selector/box-assignments/${id}/reset`, {
        method: 'PUT'
      });

      const data = await response.json();
      if (data.success) {
        alert('Reset to automatic selection!');
        fetchAssignments();
      } else {
        alert('Error resetting: ' + data.error);
      }
    } catch (error) {
      alert('Error resetting assignment');
    }
  };

  const exportToCSV = () => {
    const csvRows = [
      ['Order ID', 'Order Number', 'Customer', 'Box Name', 'Box Size', 'Items', 'Total Weight', 'Assignment Type', 'Date'].join(',')
    ];

    filteredAssignments.forEach(assignment => {
      const row = [
        assignment.orderId,
        assignment.orderNumber || assignment.orderId,
        assignment.customerName || 'N/A',
        assignment.box?.name || 'Unassigned',
        assignment.box ? `${assignment.box.length}×${assignment.box.width}×${assignment.box.height}` : 'N/A',
        assignment.totalItems || 0,
        assignment.totalWeight ? `${assignment.totalWeight} ${assignment.box?.weightUnit || 'lbs'}` : 'N/A',
        assignment.manualOverride ? 'Manual' : 'Automatic',
        new Date(assignment.createdAt).toLocaleDateString()
      ].join(',');
      csvRows.push(row);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `box_assignments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filterByDateRange = (assignment) => {
    if (dateRange === 'all') return true;

    const assignmentDate = new Date(assignment.createdAt);
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;

    switch (dateRange) {
      case 'today':
        return assignmentDate.toDateString() === now.toDateString();
      case 'week':
        return now - assignmentDate < 7 * dayInMs;
      case 'month':
        return now - assignmentDate < 30 * dayInMs;
      default:
        return true;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    // Search filter
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      assignment.orderId?.toString().includes(search) ||
      assignment.orderNumber?.toLowerCase().includes(search) ||
      assignment.customerName?.toLowerCase().includes(search) ||
      assignment.box?.name?.toLowerCase().includes(search);

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'assigned' && !assignment.boxId) return false;
    if (statusFilter === 'unassigned' && assignment.boxId) return false;

    // Date range filter
    return filterByDateRange(assignment);
  });

  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.boxId).length,
    manual: assignments.filter(a => a.manualOverride).length,
    automatic: assignments.filter(a => a.boxId && !a.manualOverride).length
  };

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
            <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>📦 Box Assignments</h1>
            <p style={{ color: '#6B7280' }}>View and manage order-to-box assignments</p>
          </div>
          <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Total Orders</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>{stats.total}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Assigned</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6' }}>{stats.assigned}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Automatic</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B5CF6' }}>{stats.automatic}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>Manual Override</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B' }}>{stats.manual}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  type="text"
                  placeholder="Search orders, customers, boxes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                <option value="all">All Orders</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '1rem', padding: '4rem', textAlign: 'center', border: '2px dashed #E5E7EB' }}>
            <Package size={48} style={{ color: '#D1D5DB', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>No Assignments Found</h3>
            <p style={{ color: '#6B7280' }}>No box assignments match your current filters</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Order</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Customer</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Assigned Box</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Items / Weight</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Assignment</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map(assignment => (
                    <tr key={assignment.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600' }}>{assignment.orderNumber || `#${assignment.orderId}`}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>ID: {assignment.orderId}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{assignment.customerName || 'N/A'}</div>
                        {assignment.customerEmail && <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{assignment.customerEmail}</div>}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {assignment.box ? (
                          <>
                            <div style={{ fontWeight: '600', color: '#10B981' }}>{assignment.box.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                              {assignment.box.length}×{assignment.box.width}×{assignment.box.height} {assignment.box.dimensionUnit}
                            </div>
                            {assignment.packingEfficiency && (
                              <div style={{ fontSize: '0.75rem', color: '#3B82F6' }}>
                                Efficiency: {assignment.packingEfficiency}%
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: '#EF4444', fontSize: '0.875rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem' }}>
                          <div><strong>{assignment.totalItems || 0}</strong> items</div>
                          <div style={{ color: '#6B7280' }}>{assignment.totalWeight || 0} {assignment.box?.weightUnit || 'lbs'}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {assignment.manualOverride ? (
                          <span style={{ padding: '0.25rem 0.75rem', background: '#FEF3C7', color: '#92400E', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>
                            Manual
                          </span>
                        ) : (
                          <span style={{ padding: '0.25rem 0.75rem', background: '#DBEAFE', color: '#1E40AF', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' }}>
                            Auto
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          {new Date(assignment.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => { setSelectedAssignment(assignment); setOverrideBoxId(assignment.boxId || ''); setShowOverrideModal(true); }}
                            style={{ padding: '0.5rem', background: '#DBEAFE', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#2563EB' }}
                            title="Override box selection"
                          >
                            <Edit2 size={18} />
                          </button>
                          {assignment.manualOverride && (
                            <button
                              onClick={() => handleResetToAuto(assignment.id)}
                              style={{ padding: '0.5rem', background: '#FEF3C7', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', color: '#92400E' }}
                              title="Reset to automatic"
                            >
                              <RotateCcw size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Override Modal */}
        {showOverrideModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: '500px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Override Box Assignment</h2>

              <div style={{ background: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.25rem' }}>Order</div>
                <div style={{ fontWeight: '600' }}>{selectedAssignment?.orderNumber || `#${selectedAssignment?.orderId}`}</div>
                {selectedAssignment?.customerName && (
                  <>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Customer</div>
                    <div style={{ fontWeight: '500' }}>{selectedAssignment.customerName}</div>
                  </>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Box</label>
                <select
                  value={overrideBoxId}
                  onChange={(e) => setOverrideBoxId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem' }}
                >
                  <option value="">-- Select a box --</option>
                  {boxes.filter(b => b.status === 'active').map(box => (
                    <option key={box.id} value={box.id}>
                      {box.name} ({box.length}×{box.width}×{box.height} {box.dimensionUnit}, max {box.maxWeight} {box.weightUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleOverride} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                  Update Assignment
                </button>
                <button onClick={() => { setShowOverrideModal(false); setSelectedAssignment(null); setOverrideBoxId(''); }} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
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

export default BoxAssignments;
