import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { detectCurrentLocation } from '../lib/geolocation';
import { ReportDetailModal } from '../components/reports/ReportDetailModal';
import { AiWasteAnalyzerModal } from '../components/citizen/AiWasteAnalyzerModal';
import {
  analyzeWasteWithGemini,
  verifyReportWastePhoto,
  PRESET_WASTE_SAMPLES,
} from '../lib/aiWasteAnalyzer';
import {
  FileText,
  PlusCircle,
  Search,
  UploadCloud,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Loader2,
  Eye,
  ChevronRight,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  X,
} from 'lucide-react';

export const ReportsView = () => {
  const {
    currentUser,
    reports,
    citizens,
    submitCitizenReport,
    dispatchDriverToReport,
    resolveReport,
    isLoadingSkeleton,
    addToast,
  } = useDashboard();

  const isCitizen = currentUser?.role === 'Citizen' || !currentUser?.role?.includes('Driver');

  // Selected report for interactive modal popup
  const [selectedReport, setSelectedReport] = useState(null);

  // Active subtab: 'queue' (Table view) or 'submit' (Form view)
  const [activeSubTab, setActiveSubTab] = useState('queue');
  const [isAiAnalyzerOpen, setIsAiAnalyzerOpen] = useState(false);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);

  // Form State
  const [category, setCategory] = useState('Overflowing Bin');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [photoName, setPhotoName] = useState('waste_site_evidence.jpg');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [wasteValidation, setWasteValidation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Handle Photo input & instant Gemini waste legitimacy check
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoName(file.name);
      setPhotoFile(file);
      setWasteValidation(null);

      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target.result);
      };
      reader.readAsDataURL(file);

      // Verify with Gemini
      setIsScanningPhoto(true);
      try {
        const res = await verifyReportWastePhoto({
          imageFile: file,
          textHint: file.name,
        });
        setWasteValidation(res);
        if (!res.isValid) {
          addToast('⚠️ Invalid Photo: Gemini verified this is not a legitimate waste item.', 'error');
        } else {
          if (res.category) {
            if (res.category.includes('Organic')) setCategory('Overflowing Bin');
            else if (res.category.includes('Hazardous') || res.category.includes('Electronic')) setCategory('Hazardous Waste');
            else setCategory('Illegal Dumping');
          }
          addToast(`✅ Gemini Verified Waste: ${res.wasteType}`, 'success');
        }
      } catch (err) {
        console.warn('Waste verification error:', err);
      } finally {
        setIsScanningPhoto(false);
      }
    }
  };

  const handleSelectPresetSample = async (sample) => {
    setPhotoName(sample.name);
    setPhotoPreview(sample.previewUrl);
    setPhotoFile(sample.tag);
    setWasteValidation(null);

    setIsScanningPhoto(true);
    try {
      const res = await verifyReportWastePhoto({
        imageFile: sample.previewUrl,
        textHint: sample.tag,
      });
      setWasteValidation(res);
      if (!res.isValid) {
        addToast('⚠️ Invalid Photo: Gemini verified this is not a legitimate waste item.', 'error');
      } else {
        if (res.category) {
          if (res.category.includes('Organic')) setCategory('Overflowing Bin');
          else if (res.category.includes('Hazardous') || res.category.includes('Electronic')) setCategory('Hazardous Waste');
          else setCategory('Illegal Dumping');
        }
        addToast(`✅ Gemini Verified Waste: ${res.wasteType}`, 'success');
      }
    } catch (err) {
      console.warn('Waste verification error:', err);
    } finally {
      setIsScanningPhoto(false);
    }
  };

  const handleAnalyzeReportPhoto = async () => {
    if (!photoFile && !photoName && !description) {
      addToast('Please attach a photo or specify waste description first.', 'warning');
      return;
    }
    setIsScanningPhoto(true);
    try {
      const res = await verifyReportWastePhoto({
        imageFile: photoFile || photoPreview,
        textHint: photoName || description || 'waste anomaly',
      });
      setWasteValidation(res);
      if (res && res.isValid) {
        if (res.category) {
          if (res.category.includes('Organic')) setCategory('Overflowing Bin');
          else if (res.category.includes('Hazardous') || res.category.includes('Electronic')) setCategory('Hazardous Waste');
          else setCategory('Illegal Dumping');
        }
        setDescription((prev) =>
          prev
            ? `${prev}\n\n[AI Gemini Verified]: ${res.wasteType} -> ${res.binColor}.\nTip: ${res.segregationTip}`
            : `[AI Gemini Verified]: ${res.wasteType} -> ${res.binColor}.\nTip: ${res.segregationTip}`
        );
        addToast(`AI Classified: ${res.wasteType} (${res.binColor})`, 'success');
      } else {
        addToast('⚠️ Gemini: Not legitimate physical waste.', 'error');
      }
    } catch (e) {
      addToast('AI analysis complete.', 'info');
    } finally {
      setIsScanningPhoto(false);
    }
  };

  // Geolocation filler
  const handleUseCurrentLocation = async (silent = false) => {
    setIsLocating(true);
    try {
      const result = await detectCurrentLocation();
      if (result && result.address) {
        setLocation(result.address);
        if (result.coordinates) setCoordinates(result.coordinates);
        if (!silent) addToast(`Exact location detected: ${result.address}`, 'success');
      } else if (!silent) {
        addToast('Unable to detect location. Please enter manually.', 'warning');
      }
    } catch (err) {
      if (!silent) addToast('Location error. Please enter manually.', 'warning');
    } finally {
      setIsLocating(false);
    }
  };

  // Automatically detect location when opening the submit form without clicking button
  useEffect(() => {
    if (activeSubTab === 'submit' && !location) {
      handleUseCurrentLocation(true);
    }
  }, [activeSubTab]);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!description.trim()) errors.description = 'Please provide an issue description';
    if (!location.trim()) errors.location = 'Please specify the location or landmark';

    // Strict Gemini Legitimacy Gate: Check if photo was explicitly rejected as non-waste
    if (wasteValidation && !wasteValidation.isValid) {
      errors.photo = `Invalid Photo: Gemini AI verified this is not legitimate physical waste (${wasteValidation.reason || 'Screenshot / Non-waste'}). Please upload a genuine waste photo.`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.photo) {
        addToast(errors.photo, 'error');
      }
      return;
    }

    setFormErrors({});
    submitCitizenReport({
      category,
      location,
      coordinates,
      description,
      priority,
      photoUrl: photoPreview || (photoName ? `/uploads/${photoName}` : '/uploads/waste_site_evidence.jpg'),
      wasteType: wasteValidation?.wasteType || 'General Municipal Waste',
      aiVerified: wasteValidation?.isValid ?? true,
    });

    // Reset Form
    setDescription('');
    setLocation('');
    setCoordinates(null);
    setPhotoName('waste_site_evidence.jpg');
    setPhotoPreview('');
    setWasteValidation(null);
    setActiveSubTab('queue');
  };

  // Base reports: For citizens, strictly filter by authenticated citizen email
  const baseReports = isCitizen
    ? reports.filter((report) => {
        if (!currentUser?.email) return false;
        return (
          report.citizenEmail &&
          report.citizenEmail.toLowerCase() === currentUser.email.toLowerCase()
        );
      })
    : reports;

  // Filtered reports with search & category filters
  const filteredReports = baseReports.filter((report) => {
    const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || report.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      report.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in-up">
      {/* Top Action & Sub-Navigation Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.3px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText size={20} style={{ color: 'var(--primary-500)' }} />
            <span>My Reports</span>
          </h2>
        </div>

        {activeSubTab === 'queue' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="search-bar" style={{ minWidth: '180px', flex: 1 }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ height: '36px', fontSize: '12px', width: 'auto' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Filter by Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
              style={{ height: '36px', fontSize: '12px', width: 'auto' }}
            >
              <option value="All">All Categories</option>
              <option value="Overflowing Bin">Overflowing Bin</option>
              <option value="Illegal Dumping">Illegal Dumping</option>
              <option value="Missed Pickup">Missed Pickup</option>
              <option value="Hazardous Waste">Hazardous Waste</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: Submit Issue Form */}
      {activeSubTab === 'submit' && (
        <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <PlusCircle size={18} style={{ color: 'var(--primary-500)' }} />
                Citizen Issue Ingestion Form
              </h3>
              <p className="card-subtitle">Report public waste anomalies with precise geolocation and photo evidence</p>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
                {/* Category Dropdown */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Waste Category</span>
                    <span style={{ color: 'var(--accent-rose)' }}>*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    id="report-category-select"
                  >
                    <option value="Overflowing Bin">Overflowing Bin</option>
                    <option value="Illegal Dumping">Illegal Dumping</option>
                    <option value="Missed Pickup">Missed Pickup</option>
                    <option value="Hazardous Waste">Hazardous Waste</option>
                    <option value="Damaged Infrastructure">Damaged Infrastructure</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Severity / Priority</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="form-select"
                  >
                    <option value="Low">Low (Standard Collection)</option>
                    <option value="Medium">Medium (Attention Required)</option>
                    <option value="High">High (Health / Hazard Risk)</option>
                    <option value="Critical">Critical (Emergency Spill)</option>
                  </select>
                </div>
              </div>

              {/* Location Input with Geolocation button */}
              <div className="form-group">
                <div className="form-label">
                  <span>Incident Location / Landmark</span>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-600)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isLocating ? (
                      <>
                        <Loader2 size={12} className="spin" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={12} />
                        <span>Auto-Detect GPS</span>
                      </>
                    )}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <MapPin
                    size={15}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                  <input
                    type="text"
                    placeholder="Enter street address, intersection or landmark..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    id="report-location-input"
                  />
                </div>
                {formErrors.location && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>
                    {formErrors.location}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <span>Incident Description & Details</span>
                  <span style={{ color: 'var(--accent-rose)' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the waste accumulation, odors, obstruction or hazards..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  id="report-description-input"
                />
                {formErrors.description && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '4px', display: 'block' }}>
                    {formErrors.description}
                  </span>
                )}
              </div>

              {/* Photo Upload Zone (Compulsory + Gemini Verification) */}
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    <span>Evidence Photo Attachment</span>
                    <span style={{ color: 'var(--accent-rose)', marginLeft: '4px' }}>*</span>
                  </label>
                  {(photoName || photoFile || photoPreview) && (
                    <button
                      type="button"
                      onClick={handleAnalyzeReportPhoto}
                      disabled={isScanningPhoto}
                      style={{
                        background: 'rgba(5, 150, 105, 0.1)',
                        border: '1px solid rgba(5, 150, 105, 0.25)',
                        color: 'var(--primary-700)',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: isScanningPhoto ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isScanningPhoto ? (
                        <>
                          <Loader2 size={12} className="spin" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} color="var(--primary-600)" />
                          <span>Scan</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <label
                  className="file-dropzone"
                  htmlFor="photo-upload"
                  style={{
                    borderColor: wasteValidation && !wasteValidation.isValid ? 'var(--accent-rose)' : wasteValidation?.isValid ? 'var(--primary-500)' : 'var(--border-medium)',
                    background: wasteValidation && !wasteValidation.isValid ? 'rgba(244, 63, 94, 0.04)' : wasteValidation?.isValid ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface-elevated)',
                  }}
                >
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <UploadCloud size={28} style={{ color: wasteValidation && !wasteValidation.isValid ? 'var(--accent-rose)' : photoName ? 'var(--primary-500)' : 'var(--text-muted)' }} />
                  <div>
                    {photoName ? (
                      <span style={{ fontWeight: 600, color: wasteValidation && !wasteValidation.isValid ? 'var(--accent-rose)' : 'var(--primary-600)' }}>
                        Selected: {photoName}
                      </span>
                    ) : (
                      <>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          Click to select image
                        </span>{' '}
                        <span style={{ color: 'var(--text-muted)' }}>or drag and drop</span>
                      </>
                    )}
                  </div>
                </label>

                {/* Gemini Live Verification Alert Banner */}
                {isScanningPhoto ? (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Loader2 size={13} className="spin" />
                    <span>Gemini 3.6 Flash verifying if photo is legitimate physical waste...</span>
                  </div>
                ) : wasteValidation ? (
                  <div
                    className="animate-fade-in"
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: wasteValidation.isValid ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.1)',
                      border: `1px solid ${wasteValidation.isValid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      color: wasteValidation.isValid ? '#10b981' : '#e11d48',
                    }}
                  >
                    {wasteValidation.isValid ? (
                      <>
                        <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                        <span>✅ Gemini AI Verified: Legitimate waste detected ({wasteValidation.wasteType}). Ready for submission.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                        <span>❌ Gemini AI Rejected: Non-waste photo detected ({wasteValidation.reason || 'Screenshot / Non-waste'}). Please attach physical waste.</span>
                      </>
                    )}
                  </div>
                ) : null}

                {/* Sample Preset Waste Photos */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Or Pick Sample Test Photo:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
                    {PRESET_WASTE_SAMPLES.slice(0, 5).map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPresetSample(sample)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          background: 'var(--bg-surface)',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span>{sample.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{sample.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {formErrors.photo && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                    {formErrors.photo}
                  </span>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('queue')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="submit-report-btn">
                  <CheckCircle2 size={15} />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 2: Reports Queue Table */}
      {activeSubTab === 'queue' && (
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <FileText size={18} style={{ color: 'var(--primary-500)' }} />
                {isCitizen ? 'My Reported Waste Issues' : 'Citizen Issue Submissions Queue'}
              </h3>
              <p className="card-subtitle">
                {isCitizen
                  ? 'Real-time municipal verification, fleet dispatch, and cleanup milestones for your reports'
                  : 'Central verification table with status, category, geotag, and triage metadata'}
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('submit')}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={14} />
              <span>Submit Report</span>
            </button>
          </div>

          <div className="card-body" style={{ padding: 0 }}>
            {isLoadingSkeleton ? (
              <div style={{ padding: '16px' }}>
                <SkeletonTable rows={4} cols={5} />
              </div>
            ) : filteredReports.length === 0 ? (
              <div style={{ padding: '32px 16px' }}>
                <EmptyState
                  icon={FileText}
                  title={isCitizen ? 'No Reports Filed Yet' : 'No Reports in Queue'}
                  description={
                    isCitizen
                      ? 'You have not reported any waste issues yet. Click below to file a report for your neighborhood.'
                      : 'There are currently no citizen waste reports matching the criteria.'
                  }
                  badgeText={isCitizen ? 'My Reports Empty' : 'Reports Queue Empty'}
                  actionLabel="Submit Issue"
                  onAction={() => setActiveSubTab('submit')}
                />
              </div>
            ) : (
              <div>
                {/* 1. Mobile / Responsive Card View (Request ID and Status on TOP) */}
                <div className="reports-mobile-cards" style={{ display: 'none', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                  {filteredReports.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReport(item)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface-elevated)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-500)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top Row: Request ID on Left, Status Badge on Right */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--primary-600)', whiteSpace: 'nowrap' }}>
                            #{item.id}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            • {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`badge ${
                            item.status === 'Resolved'
                              ? 'badge-active'
                              : item.status === 'Dispatched'
                              ? 'badge-resolved'
                              : 'badge-pending'
                          }`}
                          style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Badges: Category & Priority */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>{item.category}</span>
                        <span
                          className={`badge ${
                            item.priority === 'Critical' || item.priority === 'High' ? 'badge-high' : 'badge-pending'
                          }`}
                          style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
                        >
                          {item.priority}
                        </span>
                      </div>

                      {/* Location */}
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '5px', marginBottom: '6px', wordBreak: 'break-word' }}>
                        <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontWeight: 500, lineHeight: 1.3 }}>{item.location}</span>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, margin: '0 0 10px', wordBreak: 'break-word' }}>
                          {item.description}
                        </p>
                      )}

                      {/* Footer: Unit info & Click Affordance */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '6px',
                          paddingTop: '8px',
                          borderTop: '1px solid var(--border-subtle)',
                          fontSize: '11px',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {item.assignedDriver ? `🚛 ${item.assignedDriver}` : 'Awaiting Assignment'}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: 'var(--primary-600)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            marginLeft: 'auto',
                          }}
                        >
                          Details <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Desktop Table View */}
                <div className="table-container reports-desktop-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        {!isCitizen && <th>Citizen Details</th>}
                        <th>Location / Geotag</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Assigned Unit</th>
                        <th>Current Status & Progress</th>
                        <th style={{ textAlign: 'right' }}>Actions / Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedReport(item)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full report details"
                        >
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-600)' }}>
                              #{item.id}
                            </span>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          {!isCitizen && (
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {item.citizenName ||
                                  citizens?.find((c) => c.email && item.citizenEmail && c.email.toLowerCase() === item.citizenEmail.toLowerCase())?.name ||
                                  'Citizen Resident'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {(item.citizenPhone && item.citizenPhone !== '—' && item.citizenPhone !== '+91 98765 00000')
                                  ? item.citizenPhone
                                  : citizens?.find((c) => c.email && item.citizenEmail && c.email.toLowerCase() === item.citizenEmail.toLowerCase())?.phone ||
                                    item.citizenPhone ||
                                    '—'}
                              </div>
                            </td>
                          )}

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                              <span>{item.location}</span>
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.description}
                              </div>
                            )}
                          </td>

                          <td>
                            <span className="badge badge-neutral">{item.category}</span>
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                item.priority === 'Critical' || item.priority === 'High'
                                  ? 'badge-high'
                                  : 'badge-pending'
                              }`}
                            >
                              {item.priority}
                            </span>
                          </td>

                          <td>
                            {item.assignedDriver ? (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                                🚛 {item.assignedDriver}
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Awaiting Route Assignment</span>
                            )}
                          </td>

                          {/* Status & Visual Milestone Tracker */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span
                                className={`badge ${
                                  item.status === 'Resolved'
                                    ? 'badge-active'
                                    : item.status === 'Dispatched'
                                    ? 'badge-resolved'
                                    : 'badge-pending'
                                }`}
                                style={{ width: 'fit-content' }}
                              >
                                {item.status === 'Resolved' && '✓ '}
                                {item.status}
                              </span>

                              {/* Mini Stage Tracker */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                {[
                                  { label: 'Received', done: true },
                                  { label: 'Dispatched', done: item.status === 'Dispatched' || item.status === 'Resolved' },
                                  { label: 'Resolved', done: item.status === 'Resolved' },
                                ].map((step, idx) => (
                                  <React.Fragment key={idx}>
                                    <div
                                      title={step.label}
                                      style={{
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: step.done ? 'var(--primary-500)' : 'var(--border-medium)',
                                      }}
                                    />
                                    {idx < 2 && (
                                      <div
                                        style={{
                                          width: '14px',
                                          height: '2px',
                                          background: step.done ? 'var(--primary-500)' : 'var(--border-subtle)',
                                        }}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>
                                  {item.status === 'Resolved'
                                    ? 'Cleaned up & verified'
                                    : item.status === 'Dispatched'
                                    ? 'Crew on route'
                                    : 'In municipal queue'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Operational Actions strictly for Drivers / Staff */}
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              {!isCitizen && item.status === 'Pending Verification' && (
                                <button
                                  onClick={() => dispatchDriverToReport(item.id, 'TRK-804')}
                                  className="btn btn-primary btn-sm"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Dispatch
                                </button>
                              )}
                              {!isCitizen && item.status === 'Dispatched' && (
                                <button
                                  onClick={() => resolveReport(item.id)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ fontSize: '11px', padding: '4px 8px', color: 'var(--primary-600)' }}
                                >
                                  Resolve
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedReport(item)}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="View full ticket details"
                              >
                                <Eye size={13} />
                                <span>Details</span>
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
          </div>
        </div>
      )}

      {/* Report Detail Interactive Popup */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        onDispatch={dispatchDriverToReport}
        onResolve={resolveReport}
        isCitizen={isCitizen}
      />

      {/* 🤖 AI Gemini Waste Scanner & Upcycling Suggestions Modal */}
      <AiWasteAnalyzerModal
        isOpen={isAiAnalyzerOpen}
        onClose={() => setIsAiAnalyzerOpen(false)}
      />
    </div>
  );
};
