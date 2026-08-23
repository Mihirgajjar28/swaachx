/**
 * ==============================================================================
 * COMMUNITY CLEANLINESS QUESTS & PLOG DRIVES ENGINE (AHMEDABAD DISTRICT)
 * ==============================================================================
 * Enables civic-minded citizens to organize and join neighborhood cleanliness drives.
 * Only citizens with 100+ Karma Points are authorized to organize new quests.
 * All citizens can join, RSVP, and collaborate on cleanup events.
 * ==============================================================================
 */

export const DEFAULT_COMMUNITY_QUESTS = [
  {
    id: 'QUEST-AMD-101',
    title: 'Sabarmati Riverfront Sunday Plogathon',
    category: 'Riverfront & Waterbody Cleanup',
    categoryIcon: '🌊',
    date: '2026-08-30',
    time: '07:00 AM - 09:30 AM',
    location: 'Sabarmati Riverfront West Promenade, Near Subhash Bridge',
    ward: 'Riverfront West Ward',
    coordinates: { lat: 23.0560, lng: 72.5780 },
    targetGoal: 'Collect 250 kg single-use plastic & sweep 3 km promenade',
    volunteersTarget: 40,
    volunteersCount: 26,
    organizerName: 'Priya Joshi',
    organizerEmail: 'priya.joshi@gmail.com',
    organizerKarma: 140,
    organizerBadge: 'Eco Champion',
    karmaReward: 50,
    equipmentProvided: 'Bio-bags, safety rubber gloves, garbage pickers, and drinking water provided by AMC.',
    joinedUserEmails: ['citizen@swaachx.in', 'aniket.sharma@gmail.com', 'bhavin.patel@gmail.com'],
    status: 'Upcoming',
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'QUEST-AMD-102',
    title: 'Vastrapur Lakefront Sunday Morning Sweep',
    category: 'Park & Lake Revitalization',
    categoryIcon: '🌳',
    date: '2026-08-31',
    time: '06:30 AM - 08:30 AM',
    location: 'Vastrapur Lake Gate #2 Walking Track',
    ward: 'Sector 12 (Vastrapur)',
    coordinates: { lat: 23.0360, lng: 72.5285 },
    targetGoal: 'Clear 150 kg food wrappers, plastic bottles, and park litter',
    volunteersTarget: 30,
    volunteersCount: 19,
    organizerName: 'Bhavin Patel',
    organizerEmail: 'bhavin.patel@gmail.com',
    organizerKarma: 125,
    organizerBadge: 'Civic Guardian',
    karmaReward: 45,
    equipmentProvided: 'Biodegradable disposal bags, cotton gloves, and volunteer badges.',
    joinedUserEmails: ['divya.desai@gmail.com'],
    status: 'Upcoming',
    createdAt: '2026-08-21T14:30:00.000Z',
  },
  {
    id: 'QUEST-AMD-103',
    title: 'Chandlodiya Market Zero-Waste & Segregation Drive',
    category: 'Market & Commercial Segregation',
    categoryIcon: '🥦',
    date: '2026-09-02',
    time: '08:00 AM - 10:30 AM',
    location: 'Railway Crossing Market, Chandlodiya',
    ward: 'Ward 14 (Chandlodiya)',
    coordinates: { lat: 23.0812, lng: 72.5425 },
    targetGoal: 'Segregate organic vegetable residue from plastic crates & educate 40 vendors',
    volunteersTarget: 25,
    volunteersCount: 14,
    organizerName: 'Aniket Sharma',
    organizerEmail: 'aniket.sharma@gmail.com',
    organizerKarma: 110,
    organizerBadge: 'Cleanliness Leader',
    karmaReward: 50,
    equipmentProvided: 'Organic compost bags, segregation guides, and reflective safety jackets.',
    joinedUserEmails: ['citizen@swaachx.in'],
    status: 'Upcoming',
    createdAt: '2026-08-22T09:15:00.000Z',
  },
  {
    id: 'QUEST-AMD-104',
    title: 'Sindhu Bhavan Road Weekend Anti-Litter Plog Drive',
    category: 'Plogging & Roadside Clearance',
    categoryIcon: '🏃',
    date: '2026-09-05',
    time: '05:30 PM - 07:30 PM',
    location: 'Sindhu Bhavan Road Café Promenade, Bodakdev',
    ward: 'Bodakdev Ward',
    coordinates: { lat: 23.0465, lng: 72.5075 },
    targetGoal: 'Jog 2.5 km while collecting commercial café packaging & beverage cartons',
    volunteersTarget: 50,
    volunteersCount: 34,
    organizerName: 'Divya Desai',
    organizerEmail: 'divya.desai@gmail.com',
    organizerKarma: 165,
    organizerBadge: 'Eco Champion',
    karmaReward: 55,
    equipmentProvided: 'Plog running bags, lightweight gloves, and AMC refreshments at finish line.',
    joinedUserEmails: ['priya.joshi@gmail.com', 'bhavin.patel@gmail.com'],
    status: 'Upcoming',
    createdAt: '2026-08-22T16:45:00.000Z',
  },
  {
    id: 'QUEST-AMD-105',
    title: 'Kankaria Lakefront Green Tourist Cleanliness Drive',
    category: 'Heritage & Tourist Destination',
    categoryIcon: '🏛️',
    date: '2026-09-06',
    time: '07:00 AM - 09:00 AM',
    location: 'Kankaria Lake Gate No. 3 Promenade, Maninagar',
    ward: 'Maninagar Ward',
    coordinates: { lat: 23.0070, lng: 72.5995 },
    targetGoal: 'Clean promenade benches, public garden lawns & distribute eco-leaflets to 100 tourists',
    volunteersTarget: 35,
    volunteersCount: 21,
    organizerName: 'Jatin Trivedi',
    organizerEmail: 'jatin.trivedi@gmail.com',
    organizerKarma: 105,
    organizerBadge: 'Civic Guardian',
    karmaReward: 40,
    equipmentProvided: 'Garden rakes, bio-sacks, and AMC volunteer certificates.',
    joinedUserEmails: [],
    status: 'Upcoming',
    createdAt: '2026-08-23T11:20:00.000Z',
  },
];

/**
 * Retrieves all community quests (pre-seeded merged with custom user-created quests in localStorage)
 */
export const getStoredCommunityQuests = () => {
  try {
    const saved = localStorage.getItem('swaachx_community_quests');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored quests:', e);
  }
  return DEFAULT_COMMUNITY_QUESTS;
};

/**
 * Saves or updates quest list in localStorage
 */
export const saveCommunityQuestsList = (questsList) => {
  try {
    localStorage.setItem('swaachx_community_quests', JSON.stringify(questsList));
  } catch (e) {
    console.warn('Error saving quests list:', e);
  }
};

/**
 * Verifies if user has >= 100 Karma Points required to organize a quest
 */
export const canUserOrganizeQuest = (userKarmaPoints = 0) => {
  return Number(userKarmaPoints) >= 100;
};
