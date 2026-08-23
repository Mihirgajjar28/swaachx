import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { OrganizeQuestModal } from '../components/citizen/OrganizeQuestModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Plus,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Flame,
  Layers,
  Leaf,
  Target,
  ArrowRight,
} from 'lucide-react';

export const CommunityQuestsView = () => {
  const {
    currentUser,
    communityQuests = [],
    userKarmaPoints = 0,
    handleJoinQuest,
    handleLeaveQuest,
    handleCreateQuest,
    addToast,
  } = useDashboard();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);

  const isEligibleToOrganize = Number(userKarmaPoints) >= 100;
  const userEmail = currentUser?.email?.toLowerCase() || '';

  // Filter Quests
  const filteredQuests = useMemo(() => {
    return communityQuests.filter((quest) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (quest.title || '').toLowerCase().includes(q);
        const matchesLoc = (quest.location || '').toLowerCase().includes(q);
        const matchesWard = (quest.ward || '').toLowerCase().includes(q);
        const matchesCat = (quest.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesLoc && !matchesWard && !matchesCat) return false;
      }

      // Tab filter
      if (activeFilter === 'joined') {
        return (quest.joinedUserEmails || []).some(
          (e) => e.toLowerCase() === userEmail
        );
      }
      if (activeFilter === 'organized') {
        return (
          quest.organizerEmail &&
          quest.organizerEmail.toLowerCase() === userEmail
        );
      }
      if (activeFilter === 'upcoming') {
        return quest.status === 'Upcoming';
      }

      return true;
    });
  }, [communityQuests, activeFilter, searchQuery, userEmail]);

  const joinedQuestsCount = communityQuests.filter((q) =>
    (q.joinedUserEmails || []).some((e) => e.toLowerCase() === userEmail)
  ).length;

  const handleToggleJoin = (quest) => {
    const isJoined = (quest.joinedUserEmails || []).some(
      (e) => e.toLowerCase() === userEmail
    );
    if (isJoined) {
      handleLeaveQuest(quest.id);
    } else {
      handleJoinQuest(quest.id);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* 1. Community Quests Header & Karma Organizer Status Banner */}
      <div
        className="glass-card"
        style={{
          padding: '22px 24px',
          marginBottom: '20px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(14, 165, 233, 0.08) 50%, var(--bg-surface) 100%)',
          borderColor: 'rgba(5, 150, 105, 0.25)',
          boxShadow: '0 8px 30px rgba(5, 150, 105, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '620px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-cyan) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
                flexShrink: 0,
              }}
            >
              <Users size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Community Cleanliness Quests
                </h2>
                <span className="badge badge-active" style={{ fontSize: '11px', fontWeight: 700 }}>
                  Ahmedabad Civic Drives
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Meet with fellow residents, run weekend plogging drives, restore city lakefronts, and earn eco karma rewards together.
              </p>
            </div>
          </div>

          {/* Organizer CTA Button & Karma Tier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                My Eco Karma
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isEligibleToOrganize ? 'var(--primary-600)' : 'var(--accent-amber)' }}>
                ⭐ {userKarmaPoints} Pts
              </div>
              <div style={{ fontSize: '10px', color: isEligibleToOrganize ? 'var(--primary-600)' : 'var(--text-muted)', fontWeight: 600 }}>
                {isEligibleToOrganize ? '✓ Organizer Status Unlocked' : `${100 - userKarmaPoints} more for Organizer`}
              </div>
            </div>

            <button
              onClick={() => setIsOrganizeModalOpen(true)}
              className={`btn ${isEligibleToOrganize ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                padding: '11px 20px',
                fontWeight: 800,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isEligibleToOrganize ? '0 4px 16px var(--primary-glow)' : 'none',
              }}
            >
              <Sparkles size={16} />
              <span>{isEligibleToOrganize ? '✨ Organize Cleanliness Quest' : '🔒 Organize (100+ Karma)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Drives (${communityQuests.length})` },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'joined', label: `My Joined Drives (${joinedQuestsCount})` },
            { id: 'organized', label: 'Organized by Me' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontWeight: 700,
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px', maxWidth: '340px', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search drive by area, ward, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '12px', height: '36px' }}
          />
        </div>
      </div>

      {/* 3. Quests Cards Grid */}
      {filteredQuests.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <EmptyState
            icon={Users}
            title="No Community Quests Found"
            description={
              activeFilter === 'joined'
                ? "You haven't joined any community cleanliness drives yet. Browse upcoming drives and join to earn +50 Karma Points!"
                : activeFilter === 'organized'
                ? 'You have not organized any cleanliness quests yet. Reach 100+ Karma points to launch your neighborhood cleanup.'
                : 'No community cleanliness drives match your search criteria. Check back soon or organize one!'
            }
            badgeText="Civic Drives"
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredQuests.map((quest) => {
            const isJoined = (quest.joinedUserEmails || []).some(
              (e) => e.toLowerCase() === userEmail
            );
            const isMyOrganized = quest.organizerEmail && quest.organizerEmail.toLowerCase() === userEmail;
            const progressPercent = Math.min(100, Math.round(((quest.volunteersCount || 0) / (quest.volunteersTarget || 30)) * 100));

            return (
              <div
                key={quest.id}
                className="glass-card animate-scale-in"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  border: isJoined ? '2px solid var(--primary-500)' : '1px solid var(--border-subtle)',
                  boxShadow: isJoined ? '0 8px 25px rgba(5, 150, 105, 0.12)' : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top Status Bar & Category Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--primary-700)',
                        background: 'rgba(5, 150, 105, 0.1)',
                        padding: '3px 10px',
                        borderRadius: '99px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>{quest.categoryIcon || '🌿'}</span>
                      <span>{quest.category}</span>
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        color: '#0284c7',
                        background: 'rgba(2, 132, 199, 0.1)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      +{quest.karmaReward || 50} Karma
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, margin: '0 0 8px 0' }}>
                    {quest.title}
                  </h3>

                  {/* Target Objective */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface-elevated)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '12px',
                      border: '1px solid var(--border-subtle)',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                    }}
                  >
                    <Target size={14} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />
                    <span><strong>Goal:</strong> {quest.targetGoal}</span>
                  </div>

                  {/* Date, Time & Location Specs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} style={{ color: 'var(--primary-600)' }} />
                      <strong style={{ color: 'var(--text-primary)' }}>{quest.date}</strong>
                      <span>•</span>
                      <Clock size={13} style={{ color: 'var(--primary-600)' }} />
                      <span>{quest.time}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <MapPin size={13} style={{ color: 'var(--accent-rose)', flexShrink: 0, marginTop: '2px' }} />
                      <span>{quest.location}</span>
                    </div>
                  </div>

                  {/* Volunteer Headcount Progress */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '5px' }}>
                      <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} style={{ color: 'var(--primary-600)' }} />
                        <span>Volunteers Joined</span>
                      </span>
                      <span style={{ color: 'var(--primary-600)', fontFamily: 'var(--font-mono)' }}>
                        {quest.volunteersCount} / {quest.volunteersTarget} ({progressPercent}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary-500), var(--accent-cyan))',
                          borderRadius: '99px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Organizer Metadata */}
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '10px',
                    }}
                  >
                    <span>
                      Organized by <strong style={{ color: 'var(--text-primary)' }}>{quest.organizerName}</strong>
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      ⭐ {quest.organizerKarma || 100} Karma
                    </span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.location || 'Ahmedabad')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '11.5px',
                      padding: '8px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600,
                    }}
                    title="View meeting landmark on Google Maps"
                  >
                    <MapPin size={13} />
                    <span>Map</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleToggleJoin(quest)}
                    className={`btn btn-sm ${isJoined ? 'btn-secondary' : 'btn-primary'}`}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      fontWeight: 800,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: isJoined ? 'rgba(16, 185, 129, 0.12)' : undefined,
                      color: isJoined ? 'var(--primary-700)' : undefined,
                      borderColor: isJoined ? 'var(--primary-500)' : undefined,
                    }}
                  >
                    {isJoined ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>✓ Joined Drive (Click to Leave)</span>
                      </>
                    ) : (
                      <>
                        <Users size={14} />
                        <span>Join Cleanliness Quest</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Organize Quest Modal */}
      <OrganizeQuestModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
        onSubmitQuest={handleCreateQuest}
        userKarmaPoints={userKarmaPoints}
        currentUser={currentUser}
      />
    </div>
  );
};
