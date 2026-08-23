import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { detectCurrentLocation } from '../../lib/geolocation';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Users,
  Target,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Plus,
} from 'lucide-react';

export const OrganizeQuestModal = ({
  isOpen,
  onClose,
  onSubmitQuest,
  userKarmaPoints = 0,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Riverfront & Waterbody Cleanup');
  const [date, setDate] = useState(() => {
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + ((7 - nextSunday.getDay()) % 7 || 7));
    return nextSunday.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('07:00 AM - 09:30 AM');
  const [location, setLocation] = useState('');
  const [ward, setWard] = useState('Central Ward');
  const [targetGoal, setTargetGoal] = useState('');
  const [volunteersTarget, setVolunteersTarget] = useState(30);
  const [equipmentProvided, setEquipmentProvided] = useState(
    'Biodegradable garbage bags, safety rubber gloves, and volunteer badges provided by AMC.'
  );
  const [isLocating, setIsLocating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const isEligible = Number(userKarmaPoints) >= 100;

  const categoryOptions = [
    { label: 'Riverfront & Waterbody Cleanup', icon: '🌊' },
    { label: 'Park & Lake Revitalization', icon: '🌳' },
    { label: 'Market & Commercial Segregation', icon: '🥦' },
    { label: 'Plogging & Roadside Clearance', icon: '🏃' },
    { label: 'Heritage & Tourist Destination', icon: '🏛️' },
    { label: 'Residential Alleyway Zero-Waste', icon: '🏡' },
  ];

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const result = await detectCurrentLocation();
      if (result && result.address) {
        setLocation(result.address);
        if (result.ward) setWard(result.ward);
      }
    } catch (e) {
      console.warn('Geolocation error:', e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEligible) {
      return;
    }

    const errors = {};
    if (!title.trim()) errors.title = 'Please specify an event title';
    if (!location.trim()) errors.location = 'Please specify the meeting location/landmark';
    if (!targetGoal.trim()) errors.targetGoal = 'Please specify the cleanliness objective';
    if (!date) errors.date = 'Please select an event date';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const selectedCat = categoryOptions.find((c) => c.label === category) || categoryOptions[0];

    const newQuest = {
      id: `QUEST-AMD-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      category,
      categoryIcon: selectedCat.icon,
      date,
      time,
      location: location.trim(),
      ward,
      targetGoal: targetGoal.trim(),
      volunteersTarget: Number(volunteersTarget) || 30,
      volunteersCount: 1, // Organizer automatically counted
      organizerName: currentUser?.name || 'Citizen Organizer',
      organizerEmail: currentUser?.email || 'organizer@swaachx.in',
      organizerKarma: userKarmaPoints,
      organizerBadge: 'Community Organizer',
      karmaReward: 50,
      equipmentProvided: equipmentProvided.trim(),
      joinedUserEmails: [currentUser?.email || 'organizer@swaachx.in'],
      status: 'Upcoming',
      createdAt: new Date().toISOString(),
    };

    onSubmitQuest(newQuest);
    onClose();
  };

  const modalContent = (
    <div
      className="modal-backdrop animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 10px',
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.12) 0%, rgba(2, 132, 199, 0.08) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-cyan) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Organize Community Cleanliness Quest
                </h3>
                <span className="badge badge-active" style={{ fontSize: '10px' }}>
                  100+ Karma
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Rally neighborhood volunteers for a municipal cleanup or plog drive
              </p>
            </div>
          </div>

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
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '18px 20px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {/* Karma Eligibility Banner */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              background: isEligible ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1.5px solid ${isEligible ? '#10b981' : '#e11d48'}`,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isEligible ? (
                <ShieldCheck size={20} color="#10b981" />
              ) : (
                <AlertTriangle size={20} color="#e11d48" />
              )}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isEligible ? '#10b981' : '#e11d48' }}>
                  {isEligible ? '⭐ Community Organizer Tier Active' : '🔒 Organizer Tier Locked (Requires 100 Karma)'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Your Current Balance: <strong>{userKarmaPoints} Karma Points</strong>
                  {!isEligible && ` • Need ${100 - userKarmaPoints} more to organize events.`}
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                borderRadius: '99px',
                background: isEligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: isEligible ? '#10b981' : '#e11d48',
              }}
            >
              {userKarmaPoints} / 100 Pts
            </span>
          </div>

          {!isEligible ? (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(244, 63, 94, 0.1)',
                  color: 'var(--accent-rose)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Award size={28} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                How to Unlock Quest Organizer Status
              </h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5, maxWidth: '440px', margin: '0 auto 16px' }}>
                To ensure high quality and verified community safety, only citizens who have earned at least <strong>100 Eco Karma Points</strong> can organize new cleanliness programs.
              </p>

              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  textAlign: 'left',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={14} color="var(--primary-600)" />
                  <span><strong>Report Waste Anomalies:</strong> Earn <strong>+15 Karma</strong> per verified citizen report.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={14} color="var(--primary-600)" />
                  <span><strong>Join Existing Community Quests:</strong> Earn <strong>+40 to +55 Karma</strong> by attending neighborhood drives.</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Event Title */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <span>Quest Title</span>
                  <span style={{ color: 'var(--accent-rose)' }}> *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sabarmati Riverfront Plastic Cleanup & Plogathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
                {formErrors.title && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '3px', display: 'block' }}>
                    {formErrors.title}
                  </span>
                )}
              </div>

              {/* Program Category */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Program Type / Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                >
                  {categoryOptions.map((cat, idx) => (
                    <option key={idx} value={cat.label}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <span>Event Date</span>
                    <span style={{ color: 'var(--accent-rose)' }}> *</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                  {formErrors.date && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '3px', display: 'block' }}>
                      {formErrors.date}
                    </span>
                  )}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Meeting Time Window</label>
                  <input
                    type="text"
                    placeholder="e.g. 07:00 AM - 09:30 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Meeting Point & Landmark */}
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    <span>Meeting Location & Landmark</span>
                    <span style={{ color: 'var(--accent-rose)' }}> *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    style={{
                      background: 'rgba(5, 150, 105, 0.1)',
                      color: 'var(--primary-700)',
                      border: '1px solid rgba(5, 150, 105, 0.25)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isLocating ? <Loader2 size={11} className="spin" /> : <MapPin size={11} />}
                    <span>Use Current Location</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Vastrapur Lake Gate #2 Walking Track Promenade"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                />
                {formErrors.location && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '3px', display: 'block' }}>
                    {formErrors.location}
                  </span>
                )}
              </div>

              {/* Target Cleanliness Goal */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  <span>Cleanliness Target & Objective</span>
                  <span style={{ color: 'var(--accent-rose)' }}> *</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Collect 200 kg plastic bottles and food packaging, sweep 2 km walkway, and segregate dry vs wet waste."
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="form-textarea"
                />
                {formErrors.targetGoal && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '3px', display: 'block' }}>
                    {formErrors.targetGoal}
                  </span>
                )}
              </div>

              {/* Capacity & Equipment */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Max Volunteers Needed</label>
                  <input
                    type="number"
                    min={5}
                    max={150}
                    value={volunteersTarget}
                    onChange={(e) => setVolunteersTarget(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Volunteer Karma Reward</label>
                  <input
                    type="text"
                    value="+50 Karma Points + AMC Certificate"
                    disabled
                    className="form-input"
                    style={{ background: 'var(--bg-surface-elevated)', opacity: 0.8 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Equipment / What to Bring</label>
                <input
                  type="text"
                  value={equipmentProvided}
                  onChange={(e) => setEquipmentProvided(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Modal Footer Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Publish Community Quest</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
