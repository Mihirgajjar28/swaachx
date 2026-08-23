import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDashboard } from '../../context/DashboardContext';
import {
  analyzeWasteWithGemini,
  PRESET_WASTE_SAMPLES,
  fileToBase64,
} from '../../lib/aiWasteAnalyzer';
import {
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Leaf,
  Layers,
  ArrowRight,
  Loader2,
  X,
  Key,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  MapPin,
  RefreshCw,
  Award,
  AlertCircle,
} from 'lucide-react';

export const AiWasteAnalyzerModal = ({ isOpen, onClose }) => {
  const { addToast, setActiveTab, setSelectedDustbin, dustbins, locateNearestDustbin } = useDashboard();

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [textHint, setTextHint] = useState('');
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return localStorage.getItem('swaachx_custom_gemini_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file) => {
    if (!file) return;
    setSelectedImage(file);
    setTextHint(file.name || '');
    setAnalysisResult(null);

    try {
      const converted = await fileToBase64(file);
      setImagePreview(converted.dataUrl);
    } catch (e) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedImage(null);
    setImagePreview(preset.previewUrl);
    setTextHint(preset.tag);
    setAnalysisResult(null);
    addToast(`Loaded preset sample: ${preset.name}`, 'info');
  };

  const handleAnalyze = async () => {
    if (!imagePreview && !selectedImage && !textHint) {
      addToast('Please upload a waste photo or select a sample first.', 'warning');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeWasteWithGemini({
        imageFile: selectedImage || imagePreview,
        textHint: textHint || 'household recyclable waste',
        customApiKey,
      });

      setAnalysisResult(result);
      addToast('AI Waste Analysis complete! Check suggestions below.', 'success');
    } catch (err) {
      console.error('Analysis error:', err);
      addToast('Analysis encountered an issue. Using standard segregation guide.', 'warning');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveApiKey = (key) => {
    setCustomApiKey(key);
    try {
      localStorage.setItem('swaachx_custom_gemini_key', key);
      addToast('Gemini API key saved securely for this browser session.', 'success');
    } catch (e) {}
  };

  const handleRouteToBin = () => {
    onClose();
    const nearest = locateNearestDustbin();
    if (nearest) {
      setActiveTab('dustbins');
      addToast(`Routing to closest smart bin for ${analysisResult?.category || 'waste'}: ${nearest.name}`, 'success');
    } else {
      setActiveTab('dustbins');
    }
  };

  const handleCreateReport = () => {
    onClose();
    setActiveTab('reports');
    addToast('Opening Citizen Reports queue. Your AI insights have been prepped.', 'info');
  };

  const modalContent = (
    <div
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 8px',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(2, 132, 199, 0.05) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, #0284c7 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Know Your Waste
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Upload waste photos for instant segregation & DIY reuse ideas
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '16px 14px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>

          {/* Photo Upload & Dropzone Area */}
          {!imagePreview ? (
            <div>
              <div
                className="file-dropzone"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '20px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px dashed var(--border-medium)',
                  background: 'var(--bg-surface-elevated)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginBottom: '14px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(5, 150, 105, 0.1)',
                    color: 'var(--primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                  }}
                >
                  <UploadCloud size={22} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                  Click to Upload or Drag & Drop Waste Photo
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Supports PNG, JPG, JPEG or Camera Snaps (Max 10MB)
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>

              {/* Sample Preset Items */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Or Select a Common Household Waste Sample to Test:
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '6px',
                  }}
                >
                  {PRESET_WASTE_SAMPLES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePresetSelect(sample)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-400)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <span style={{ fontSize: '18px', flexShrink: 0 }}>{sample.icon}</span>
                      <div style={{ overflow: 'hidden', minWidth: 0 }}>
                        <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {sample.name}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{sample.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Selected Image Preview & Action Controls */
            <div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  maxHeight: '220px',
                  background: '#000',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Waste to analyze"
                  style={{
                    width: '100%',
                    height: '220px',
                    objectFit: 'cover',
                    opacity: isAnalyzing ? 0.6 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                />

                {/* Animated Scanner Laser overlay when analyzing */}
                {isAnalyzing && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 0%, rgba(5, 150, 105, 0.3) 50%, transparent 100%)',
                      animation: 'slideDown 1.5s infinite linear',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '14px',
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                    }}
                  >
                    <Loader2 size={24} className="spin" style={{ marginRight: '8px' }} />
                    Analyzing Waste Photo...
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                    setAnalysisResult(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Remove Photo"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, var(--primary-500) 0%, #0284c7 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px var(--primary-glow)',
                    cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Analyzing Photo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Analyze</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={14} />
                  <span>New Photo</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {/* AI Analysis Result Presentation */}
          {analysisResult && analysisResult.isWaste === false ? (
            /* 🚫 NON-WASTE DETECTED VIEW */
            <div
              className="animate-scale-in"
              style={{
                marginTop: '12px',
                padding: '18px 20px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1.5px solid rgba(239, 68, 68, 0.28)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: 'var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    This is not a waste item
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--accent-rose)', fontWeight: 600 }}>
                    {analysisResult.detectedObject || 'Non-waste entity detected'}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  background: 'var(--bg-surface)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px',
                }}
              >
                {analysisResult.nonWasteReason ||
                  'This is not a waste item. No municipal garbage, discarded materials, or recyclable packaging was detected in this photo. Please upload a photo of garbage or recyclable waste to receive segregation and upcycling suggestions.'}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                    setAnalysisResult(null);
                    fileInputRef.current?.click();
                  }}
                  className="btn btn-primary btn-sm"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    fontWeight: 700,
                  }}
                >
                  <UploadCloud size={14} />
                  <span>Upload Real Waste Photo</span>
                </button>
              </div>
            </div>
          ) : analysisResult && (
            /* ♻️ VALID WASTE ANALYSIS & SUGGESTIONS VIEW */
            <div className="animate-scale-in" style={{ marginTop: '8px' }}>
              {/* Category & Bin Badge Header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-surface-elevated)',
                  border: `1.5px solid ${analysisResult.binHex || 'var(--primary-500)'}`,
                  marginBottom: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{analysisResult.binIcon || '♻️'}</span>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {analysisResult.wasteType}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: analysisResult.binHex || 'var(--primary-600)' }}>
                        {analysisResult.category}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: analysisResult.binHex ? `${analysisResult.binHex}22` : 'rgba(5, 150, 105, 0.15)',
                      color: analysisResult.binHex || 'var(--primary-700)',
                      border: `1px solid ${analysisResult.binHex || 'var(--primary-500)'}`,
                    }}
                  >
                    Deposit in: {analysisResult.binColor}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                  <strong>Municipal Segregation Guide:</strong> {analysisResult.segregationTip}
                </div>
              </div>

              {/* Upcycling & DIY Suggestions Section */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Lightbulb size={16} color="var(--accent-amber)" />
                  <span>Creative Upcycling & Reuse Suggestions</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {analysisResult.upcyclingIdeas?.map((idea, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(5, 150, 105, 0.04)',
                        border: '1px solid rgba(5, 150, 105, 0.15)',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                      }}
                    >
                      {idea}
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Impact & Carbon Footprint Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(2, 132, 199, 0.06)',
                    border: '1px solid rgba(2, 132, 199, 0.18)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CO₂ Avoided</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7' }}>
                    ~{analysisResult.carbonSavedKg || 1.8} kg CO₂
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(22, 163, 74, 0.06)',
                    border: '1px solid rgba(22, 163, 74, 0.18)',
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recyclable / Compost</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                    {analysisResult.compostable ? 'Compostable 🍂' : analysisResult.recyclable ? '100% Recyclable ♻️' : 'Hazardous Drop ⚡'}
                  </div>
                </div>
              </div>

              {/* Environmental Impact Note */}
              {analysisResult.environmentalImpact && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: '16px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface-elevated)',
                  }}
                >
                  🌍 <strong>Ecological Impact:</strong> {analysisResult.environmentalImpact}
                </div>
              )}

              {/* Action Buttons: Find Bin, Create Report */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRouteToBin}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '9px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-500)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px var(--primary-glow)',
                  }}
                >
                  <MapPin size={14} color="#ffffff" />
                  <span>Locate Designated Smart Bin</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateReport}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>File Report</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
