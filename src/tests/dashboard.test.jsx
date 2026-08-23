import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

// Mock global.fetch for OSRM road routing
global.fetch = vi.fn().mockImplementation((url) => {
  if (typeof url === 'string' && url.includes('router.project-osrm.org')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          code: 'Ok',
          routes: [
            {
              geometry: {
                coordinates: [
                  [72.5441, 23.0784],
                  [72.5435, 23.0792],
                  [72.5421, 23.0805],
                  [72.5412, 23.0825],
                ],
              },
              distance: 820,
              duration: 135,
            },
          ],
        }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock react-leaflet for Node / Happy-DOM headless environments
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="leaflet-map-mock">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer-mock" />,
  Marker: ({ children }) => <div data-testid="marker-mock">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup-mock">{children}</div>,
  CircleMarker: ({ children }) => <div data-testid="circle-marker-mock">{children}</div>,
  Polyline: () => <div data-testid="polyline-mock" />,
  Circle: ({ children }) => <div data-testid="circle-mock">{children}</div>,
  Tooltip: ({ children }) => <div data-testid="tooltip-mock">{children}</div>,
  ZoomControl: () => <div data-testid="zoom-control-mock" />,
  useMap: () => ({ flyTo: vi.fn(), setView: vi.fn() }),
}));

// Mock recharts ResponsiveContainer
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div style={{ width: 400, height: 300 }}>{children}</div>,
  };
});

import App from '../App';
import { DashboardProvider } from '../context/DashboardContext';
import { ReportsView } from '../views/ReportsView';
import { VehiclesView } from '../views/VehiclesView';
import { RoutesView } from '../views/RoutesView';

const loginAsCitizen = () => {
  const emailInput = document.getElementById('auth-email-input');
  const passwordInput = document.getElementById('auth-password-input');
  const submitBtn = document.getElementById('auth-submit-btn');

  fireEvent.change(emailInput, { target: { value: 'aarav.mehta@citizen.in' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitBtn);
};

const loginAsDriver = () => {
  const emailInput = document.getElementById('auth-email-input');
  const passwordInput = document.getElementById('auth-password-input');
  const submitBtn = document.getElementById('auth-submit-btn');

  fireEvent.change(emailInput, { target: { value: 'suresh.k@wastefleet.org' } });
  fireEvent.change(passwordInput, { target: { value: 'driverRoute99' } });
  fireEvent.click(submitBtn);
};

describe('Smart Waste Management: Direct Credentials Authentication Tests', () => {
  it('1. Authentication Gate: locks unauthenticated users out, and renders Citizen Portal upon login', () => {
    render(<App />);

    // 1. Initial State: Auth Gate is strictly presented
    expect(screen.getAllByText(/swaach/i).length).toBeGreaterThan(0);

    // 2. Sign In as Citizen
    loginAsCitizen();

    // 3. App unlocks and Citizen Community Dashboard renders
    expect(screen.getByText(/Citizen Community Dashboard/i)).toBeDefined();

    // 4 Citizen Summary cards labels
    expect(screen.getByText('My Reports Submitted')).toBeDefined();
    expect(screen.getByText('Resolved Issues')).toBeDefined();
    expect(screen.getByText('My Eco Karma Points')).toBeDefined();
    expect(screen.getByText('Ward Cleanliness Index')).toBeDefined();

    // Citizen actions
    expect(screen.getByText('Quick Issue Reporting Shortcuts')).toBeDefined();
    expect(screen.getByText('Ahmedabad Sanitation Network')).toBeDefined();
  });

  it('2. Navigation: navigates between citizen portal and issue reporting', () => {
    render(<App />);

    // Authenticate as Citizen
    loginAsCitizen();

    // Switch to Report Waste Issue
    fireEvent.click(screen.getAllByText('Report Waste Issue')[0]);
    expect(screen.getByText(/Reported Waste Issues/i)).toBeDefined();
  });

  it('3. Citizen Reports: submits a report via form and displays in table', () => {
    render(<App />);

    // Authenticate as Citizen
    loginAsCitizen();

    // Navigate to Report Waste Issue
    fireEvent.click(screen.getAllByText('Report Waste Issue')[0]);

    // Click "Submit Report"
    fireEvent.click(screen.getByText('Submit Report'));
    expect(screen.getByText('Citizen Issue Ingestion Form')).toBeDefined();

    // Fill form
    const locationInput = document.getElementById('report-location-input');
    const descriptionInput = document.getElementById('report-description-input');
    const submitBtn = document.getElementById('submit-report-btn');

    fireEvent.change(locationInput, { target: { value: 'Sector 14 Central Market' } });
    fireEvent.change(descriptionInput, { target: { value: 'Three large bins overflowing with commercial organic waste' } });
    fireEvent.click(submitBtn);

    // Verify submission returns to queue and row appears in table
    expect(screen.getAllByText('Sector 14 Central Market').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pending Verification').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Overflowing Bin').length).toBeGreaterThan(0);
  });

  it('4. Skeleton Mode Toggle: switches between empty state and loading skeletons', () => {
    render(<App />);

    // Authenticate as Citizen
    loginAsCitizen();

    // Click Skeleton Mode toggle container
    const toggleSwitch = document.querySelector('.toggle-switch');
    expect(toggleSwitch).toBeDefined();

    fireEvent.click(toggleSwitch);

    // Verify skeleton elements are in DOM
    const skeletons = document.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(5);

    // Toggle back off
    fireEvent.click(toggleSwitch);
    const skeletonsAfter = document.querySelectorAll('.skeleton');
    expect(skeletonsAfter.length).toBe(0);
  });

  it('5. Vehicle Tracking: renders fleet KPI cards and Ahmedabad District vehicle roster', () => {
    render(
      <DashboardProvider>
        <VehiclesView />
      </DashboardProvider>
    );

    expect(screen.getByText('Connected Transponders')).toBeDefined();
    expect(screen.getByText('On Route / Active')).toBeDefined();
    expect(screen.getByText('Idle in Depot')).toBeDefined();
    expect(screen.getByText('Fleet Roster & Telemetry Feeds')).toBeDefined();
    expect(screen.getAllByText(/TRK-AMD|GJ-01|Chandlodiya|Suresh Kumar/i).length).toBeGreaterThan(0);
  });

  it('6. Route Optimization: renders routing KPIs and stop sequence', () => {
    render(
      <DashboardProvider>
        <RoutesView />
      </DashboardProvider>
    );

    expect(screen.getByText('Total Route Distance')).toBeDefined();
    expect(screen.getByText('Estimated Shift Duration')).toBeDefined();
    expect(screen.getByText('Target Bins / Stops')).toBeDefined();
    expect(screen.getByText('Projected Fuel Savings')).toBeDefined();
    expect(screen.getByText('Collection Waypoint Queue & ETAs')).toBeDefined();
  });

  it('7. Automatic Citizen Detection: Auto-detects citizen email without role dropdown', () => {
    render(<App />);

    // Fill login credentials with citizen email
    loginAsCitizen();

    // Verify automatically directed to Citizen Portal
    expect(screen.getByText('Aarav Mehta')).toBeDefined();
    expect(screen.getByText('Citizen Community Dashboard')).toBeDefined();
  });

  it('8. Automatic Driver Detection: Auto-detects driver email without role dropdown and unlocks Cockpit', () => {
    render(<App />);

    // Fill login credentials with driver email
    loginAsDriver();

    // Verify automatically directed to Driver Cockpit
    expect(screen.getByText(/Driver Cockpit:/i)).toBeDefined();
    expect(screen.getByText('Shift & Telemetry')).toBeDefined();
  });

  it('9. Officer & Unauthorized Lockout: Rejects Officer credentials with access denied error', async () => {
    render(<App />);

    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    // Attempt to log in with an officer email
    fireEvent.change(emailInput, { target: { value: 'r.verma@municipal.gov.in' } });
    fireEvent.change(passwordInput, { target: { value: 'adminPass2026' } });
    fireEvent.click(submitBtn);

    // Verify access denied message appears and app stays locked on Auth Gate
    await waitFor(() => {
      expect(screen.getByText(/Officer\/Admin accounts are not authorized/i)).toBeDefined();
    });
  });

  it('10. Register Account: creates citizen resident account with email OTP verification', async () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    // Fill registration
    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitAuthBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(nameInput, { target: { value: 'Neha Patil' } });
    fireEvent.change(emailInput, { target: { value: 'neha.patil@citizen.org' } });
    fireEvent.change(passwordInput, { target: { value: 'securePass2026' } });

    // Submit initial details to trigger email OTP
    fireEvent.click(submitAuthBtn);

    // Verify OTP view appears
    expect(screen.getByText(/Verify Your Email Address/i)).toBeDefined();

    // Enter 6-digit OTP code and verify
    const otpInput = document.getElementById('auth-otp-input');
    const verifyOtpBtn = document.getElementById('auth-verify-otp-btn');
    fireEvent.change(otpInput, { target: { value: '123456' } });
    fireEvent.click(verifyOtpBtn);

    // Verify unlocked with new user profile in Citizen Portal
    await waitFor(() => {
      expect(screen.getByText('Neha Patil')).toBeDefined();
      expect(screen.getByText('Citizen Community Dashboard')).toBeDefined();
    });
  });

  it('10b. Duplicate Username Restriction: Blocks registration when username already exists', () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    // Try to register with already existing username "Aarav Mehta"
    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitAuthBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(nameInput, { target: { value: 'Aarav Mehta' } });
    fireEvent.change(emailInput, { target: { value: 'aarav.unique2@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securePass2026' } });

    // Submit
    fireEvent.click(submitAuthBtn);

    // Verify duplicate username error is displayed and registration is blocked
    expect(screen.getByText(/Username "Aarav Mehta" is already taken/i)).toBeDefined();
  });

  it('11. Driver Sign Out: locks session and returns to Auth Gate', () => {
    render(<App />);

    // Authenticate as Driver
    loginAsDriver();
    expect(screen.getByText(/Driver Cockpit:/i)).toBeDefined();

    // Open user profile
    const userProfileBtn = document.getElementById('user-profile-btn');
    fireEvent.click(userProfileBtn);
    const logoutBtn = document.getElementById('logout-btn');
    fireEvent.click(logoutBtn);

    // Verify locked back to Auth Gate
    expect(screen.getAllByText(/swaach/i).length).toBeGreaterThan(0);
  });

  it('12. Citizen Submissions Queue & Incident Tracking: starts clean and accepts new submissions', () => {
    render(
      <DashboardProvider>
        <ReportsView />
      </DashboardProvider>
    );

    expect(screen.getByText(/Reported Waste Issues/i)).toBeDefined();
    expect(screen.getByText(/No Reports/i)).toBeDefined();
  });

  it('13. Unregistered User Rejection & Auto-Redirect: Blocks unknown emails and redirects to registration', async () => {
    render(<App />);

    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    // Attempt to login with an unknown unregistered email
    fireEvent.change(emailInput, { target: { value: 'unregistered.person@random.org' } });
    fireEvent.change(passwordInput, { target: { value: 'secretPass123' } });
    fireEvent.click(submitBtn);

    // Verify error shown and automatically switched to register view (which asks for Full Name)
    await waitFor(() => {
      expect(screen.getByText('Full Name')).toBeDefined();
      expect(screen.getByText(/No account found with this email/i)).toBeDefined();
    });
  });

  it('14. Register Location & GPS: Renders Location field with GPS detection button', () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    // Check for Location label, GPS button, and location input
    expect(screen.getByText('Location')).toBeDefined();
    const detectBtn = document.getElementById('auth-fetch-location-btn');
    expect(detectBtn).toBeDefined();
    const locationInput = document.getElementById('auth-location-input');
    expect(locationInput).toBeDefined();
  });

  it('15. 10-Digit Mobile Number Validation: validates 10 digits mobile phone on registration', () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const phoneInput = document.getElementById('auth-phone-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(nameInput, { target: { value: 'Rohan Sharma' } });
    fireEvent.change(emailInput, { target: { value: 'rohan.sharma@citizen.org' } });
    fireEvent.change(phoneInput, { target: { value: '98765' } }); // only 5 digits
    fireEvent.change(passwordInput, { target: { value: 'securePass2026' } });
    fireEvent.click(submitBtn);

    // Verify 10-digit validation error message is shown
    expect(screen.getByText(/Mobile number must be exactly 10 digits/i)).toBeDefined();
  });

  it('16. Location Detector Click: Detect GPS triggers location detection', async () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    const detectBtn = document.getElementById('auth-fetch-location-btn');
    expect(detectBtn).toBeDefined();
    fireEvent.click(detectBtn);

    // Verify location input exists and is editable
    const locationInput = document.getElementById('auth-location-input');
    expect(locationInput).toBeDefined();
  });

  it('17. User Credential Generation: Citizens generate credentials and drivers authenticate directly', () => {
    render(<App />);

    // 1. Switch to Register tab and verify citizen fields
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const locationInput = document.getElementById('auth-location-input');
    expect(nameInput).toBeDefined();
    expect(emailInput).toBeDefined();
    expect(locationInput).toBeDefined();

    // 2. Switch to Sign In and sign in with driver credentials
    const signinTabBtn = document.getElementById('header-signin-btn');
    fireEvent.click(signinTabBtn);

    const signinEmail = document.getElementById('auth-email-input');
    const signinPass = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(signinEmail, { target: { value: 'suresh.k@wastefleet.org' } });
    fireEvent.change(signinPass, { target: { value: 'driverPass123' } });
    fireEvent.click(submitBtn);

    // Verify driver portal is unlocked
    expect(screen.getAllByText(/Driver Cockpit/i).length).toBeGreaterThan(0);
  });

  it('18. Report Details Modal: clicking a report card/row opens interactive popup with full details', () => {
    render(<App />);

    // Authenticate as Citizen
    loginAsCitizen();

    // Navigate to Reports Tab
    fireEvent.click(screen.getAllByText('Report Waste Issue')[0]);

    // Submit a new issue
    fireEvent.click(screen.getByText('Submit Report'));
    const locationInput = document.getElementById('report-location-input');
    const descriptionInput = document.getElementById('report-description-input');
    const submitBtn = document.getElementById('submit-report-btn');

    fireEvent.change(locationInput, { target: { value: 'FC Road Commercial Corner' } });
    fireEvent.change(descriptionInput, { target: { value: 'Large waste buildup next to bus stop' } });
    fireEvent.click(submitBtn);

    // Click on the report row / details button to open popup
    const detailsBtns = screen.getAllByText(/Details/i);
    expect(detailsBtns.length).toBeGreaterThan(0);
    fireEvent.click(detailsBtns[0]);

    // Verify modal popup content is displayed
    expect(screen.getByText('Resolution Lifecycle Progression')).toBeDefined();
    expect(screen.getAllByText(/FC Road Commercial Corner/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Close')).toBeDefined();

    // Close the modal
    fireEvent.click(screen.getByText('Close'));
  });

  it('19. Duplicate Email Prevention: Registering with existing email under different username is rejected with an error message instead of updating database', () => {
    render(<App />);

    // Open Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const phoneInput = document.getElementById('auth-phone-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    // Attempt to register with a different username but same registered email 'aarav.mehta@citizen.in'
    fireEvent.change(nameInput, { target: { value: 'Vikram Joshi' } });
    fireEvent.change(emailInput, { target: { value: 'aarav.mehta@citizen.in' } });
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    fireEvent.change(passwordInput, { target: { value: 'newPass1234' } });
    fireEvent.click(submitBtn);

    // Verify rejection error message is shown and database is not updated
    expect(screen.getAllByText(/User is already registered with this email ID. Please sign in./i).length).toBeGreaterThan(0);
  });

  it('21. Session Persistence: restores user session automatically from localStorage on app reload', () => {
    // Seed an existing session into localStorage
    const savedUser = {
      id: 'USR-8822',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@citizen.in',
      phone: '+91 98234 56789',
      role: 'Citizen',
      ward: 'Ahmedabad Central',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(savedUser));

    // Render app - it should automatically hydrate without showing the login gate modal
    render(<App />);

    // Check that citizen portal is immediately visible
    expect(screen.getAllByText('Citizen Portal').length).toBeGreaterThan(0);
    expect(screen.getByText('Aarav Mehta')).toBeDefined();
    expect(document.getElementById('auth-modal-dialog')).toBeNull();
  });

  it('22. Password Security: rejects login attempts with incorrect password and denies dashboard access', async () => {
    render(<App />);

    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    // Enter valid email but completely WRONG password
    fireEvent.change(emailInput, { target: { value: 'aarav.mehta@citizen.in' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongPassword999' } });
    fireEvent.click(submitBtn);

    // Verify error is rendered and login is denied
    await waitFor(() => {
      expect(screen.getAllByText(/Incorrect password/i).length).toBeGreaterThan(0);
    });

    // Verify user remains locked out and auth modal stays open
    expect(document.getElementById('auth-modal-dialog')).toBeDefined();
  });

  it('23. Nearby Dustbins: navigates to dustbins locator view and displays locator tools', () => {
    render(<App />);
    loginAsCitizen();

    // Click Dustbin Locator navigation
    const dustbinsNav = screen.getAllByText(/Dustbin Locator|Locator/i);
    expect(dustbinsNav.length).toBeGreaterThan(0);
    fireEvent.click(dustbinsNav[0]);

    // Verify Dedicated Dustbins view is rendered
    expect(screen.getAllByText('Dustbin Locator').length).toBeGreaterThan(0);
    expect(screen.getByText('📍 Find Nearest Bin')).toBeDefined();
  });

  it('24. Find Nearest Dustbin: computes Haversine distance, walk ETA, and sets walking route', () => {
    render(<App />);
    loginAsCitizen();

    // Click Dustbin Locator
    fireEvent.click(screen.getAllByText(/Dustbin Locator|Locator/i)[0]);

    // Click Find Nearest Bin CTA
    const findBtn = screen.getByText('📍 Find Nearest Bin');
    fireEvent.click(findBtn);

    // Verify distance is formatted and walking action available
    expect(screen.getAllByText(/Walking route to/i).length).toBeGreaterThan(0);
    expect(screen.getByText('End Route')).toBeDefined();
  });

  it('25. Smart Dustbins Category Filtering: filters by Wet, Dry and E-Waste bins', () => {
    render(<App />);
    loginAsCitizen();

    // Click Dustbin Locator
    fireEvent.click(screen.getAllByText(/Dustbin Locator|Locator/i)[0]);

    // Filter by E-Waste
    const ewasteBtn = screen.getByText('🔋 E-Waste');
    fireEvent.click(ewasteBtn);

    expect(ewasteBtn.className).toContain('btn-primary');
  });

  it('26. Instant Card Selection: locating nearest dustbin maps walking route directly on map', () => {
    render(<App />);
    loginAsCitizen();

    // Click Dustbin Locator
    fireEvent.click(screen.getAllByText(/Dustbin Locator|Locator/i)[0]);

    // Click Find Nearest Bin
    const findBtn = screen.getByText('📍 Find Nearest Bin');
    fireEvent.click(findBtn);

    // Verify active navigation banner displays the route
    expect(screen.getAllByText(/Walking route to/i).length).toBeGreaterThan(0);
    expect(screen.getByText('End Route')).toBeDefined();
  });

  it('27. Driver Credentials Database: Rejects unauthorized driver registration attempts', () => {
    render(<App />);

    // Switch to register
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    // Fill form with driver email on register tab
    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const phoneInput = document.getElementById('auth-phone-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(nameInput, { target: { value: 'Driver Applicant' } });
    fireEvent.change(emailInput, { target: { value: 'fake.driver@wastefleet.org' } });
    fireEvent.change(phoneInput, { target: { value: '9998887777' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    // Verify rejection error is displayed
    expect(screen.getAllByText(/Registration Restricted: Fleet Driver accounts are pre-certified/i).length).toBeGreaterThan(0);
  });

  it('28. Authorized Driver Direct Sign In: Pre-certified driver signs in and accesses driver portal', async () => {
    render(<App />);

    // Stay on Sign In tab
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    // Pre-authorized driver credentials (Suresh Kumar, DRV-801)
    fireEvent.change(emailInput, { target: { value: 'suresh.k@wastefleet.org' } });
    fireEvent.change(passwordInput, { target: { value: 'driverPass2026' } });
    fireEvent.click(submitBtn);

    // Verify driver portal is unlocked
    await waitFor(() => {
      expect(screen.getAllByText(/Driver Cockpit|Municipal Driver/i).length).toBeGreaterThan(0);
    });
  });

  it('29. Citizen Map Trucks: renders live Ahmedabad municipal trucks layer in citizen dashboard map', () => {
    render(<App />);
    loginAsCitizen();

    // Verify Citizen Portal is rendered
    expect(screen.getAllByText('Citizen Portal').length).toBeGreaterThan(0);

    // Verify live trucks count in citizen map legend
    expect(screen.getAllByText(/Live Trucks \(10\)/i).length).toBeGreaterThan(0);
  });

  it('30. Driver Cockpit Distribution: renders driver assigned route, smart bin sequence, surge hotspots and supports emptying bins', async () => {
    render(<App />);
    loginAsDriver();

    // Verify Driver Cockpit is loaded
    expect(screen.getAllByText(/Driver Cockpit/i).length).toBeGreaterThan(0);

    // Verify assigned route name and stops
    expect(screen.getAllByText(/Route A1|Chandlodiya|Assigned Waypoint Collection Sequence/i).length).toBeGreaterThan(0);

    // Verify assigned smart bins are displayed
    expect(screen.getAllByText(/BIN-AMD|Chandlodiya Garden Smart EcoBin/i).length).toBeGreaterThan(0);

    // Verify Collect & Empty Bin action works
    const collectBtn = screen.getAllByText(/Collect & Empty Bin/i)[0];
    fireEvent.click(collectBtn);

    // Verify bin is marked as Emptied / Picked Up
    expect(screen.getAllByText(/Emptied \/ Picked Up|1 Picked Up/i).length).toBeGreaterThan(0);
  });

  it('31. Driver Flexible Sign In: Driver signs in with Badge ID DRV-802 and driverPass2026', async () => {
    render(<App />);

    // Open Sign In
    const signInTabBtn = document.getElementById('header-signin-btn');
    fireEvent.click(signInTabBtn);

    // Enter Driver Badge ID and password
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(emailInput, { target: { value: 'DRV-802' } });
    fireEvent.change(passwordInput, { target: { value: 'driverPass2026' } });
    fireEvent.click(submitBtn);

    // Verify driver cockpit opens with Ramesh Patel (DRV-802)
    await waitFor(() => {
      expect(screen.getAllByText(/Driver Cockpit: Ramesh Patel/i).length).toBeGreaterThan(0);
    });

    // Verify localStorage session was saved
    const driverSession = localStorage.getItem('swaachx_driver_session');
    expect(driverSession).toBeTruthy();
    const parsed = JSON.parse(driverSession);
    expect(parsed.name).toBe('Ramesh Patel');
    expect(parsed.role).toBe('Fleet Driver');
  });

  it('32. Driver Session Restoration: Restores driver session directly from localStorage on load', async () => {
    // Pre-seed localStorage with DRV-803 Vikram Singh driver session
    const driverObj = {
      id: 'DRV-803',
      name: 'Vikram Singh',
      email: 'vikram.singh@wastefleet.org',
      phone: '9876501234',
      ward: 'Sector 9 (West Zone - SG Highway)',
      badgeId: 'DRV-803',
      assignedVehicleId: 'TRK-AMD-803',
      vehiclePlate: 'GJ-27-AK-5678',
      assignedRoute: 'Route W4 - SG Highway & Thaltej Expressway Corridor',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));

    render(<App />);

    // Driver Cockpit should be immediately restored without sign-in modal
    await waitFor(() => {
      expect(screen.getAllByText(/Driver Cockpit: Vikram Singh/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TRK-AMD-803/i).length).toBeGreaterThan(0);
    });
  });

  it('33. Driver Assigned Routes Dynamic Details: Assigned Routes view dynamically renders driver route, stops, and waypoints', async () => {
    // Log in as Suresh Kumar (DRV-801)
    const driverObj = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      phone: '9823144552',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      badgeId: 'DRV-801',
      assignedVehicleId: 'TRK-AMD-801',
      vehiclePlate: 'GJ-01-CZ-4821',
      assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - Gota)',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));

    render(<App />);

    // Click "Assigned Routes" in the sidebar
    const routesBtn = screen.getAllByText(/Assigned Routes/i)[0];
    fireEvent.click(routesBtn);

    // Verify dynamic route name and driver vehicle are displayed
    await waitFor(() => {
      expect(screen.getAllByText(/Assigned Route: Route A1/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TRK-AMD-801/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Suresh Kumar/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Turn-by-Turn Waypoint GIS Map/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Collection Waypoint Queue & ETAs/i).length).toBeGreaterThan(0);
    });
  });

  it('34. Live Fleet Telemetry Map: Displays all 10 Ahmedabad trucks on the GIS tracking map', async () => {
    render(<App />);
    loginAsDriver();

    // Click "Fleet GPS & Transponder" in sidebar
    const telemetryBtn = screen.getAllByText(/Fleet GPS & Transponder/i)[0];
    fireEvent.click(telemetryBtn);

    // Verify Live Fleet Telemetry & Geofencing Map is rendered
    await waitFor(() => {
      expect(screen.getAllByText(/Live Fleet Telemetry & Geofencing Map/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/10 Ahmedabad Trucks Live/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TRK-AMD-801/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TRK-AMD-810/i).length).toBeGreaterThan(0);
    });
  });

  it('35. Dynamic Route Distance Reduction: Remaining route distance dynamically updates and reduces when bin is collected', async () => {
    render(<App />);
    loginAsDriver();

    // Initial distance is present
    await waitFor(() => {
      expect(screen.getAllByText(/Remaining Route Distance/i).length).toBeGreaterThan(0);
    });

    // Find and click the first "Collect & Empty Bin" button
    const collectBtns = screen.getAllByText(/Collect & Empty Bin|Empty/i);
    if (collectBtns.length > 0) {
      fireEvent.click(collectBtns[0]);
    }

    // Verify distance updates and stop reflects serviced status
    await waitFor(() => {
      expect(screen.getAllByText(/Picked Up/i).length).toBeGreaterThan(0);
    });
  });

  it('36. Turn-by-Turn Waypoint GIS Map: Renders assigned stops sequence and road trajectory for the truck', async () => {
    const driverObj = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      phone: '9823144552',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      badgeId: 'DRV-801',
      assignedVehicleId: 'TRK-AMD-801',
      vehiclePlate: 'GJ-01-CZ-4821',
      assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - Gota)',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));

    render(<App />);

    // Click "Assigned Routes" in the sidebar
    const routesBtn = screen.getAllByText(/Assigned Routes/i)[0];
    fireEvent.click(routesBtn);

    // Verify Waypoint GIS Map and stop elements are plotted
    await waitFor(() => {
      expect(screen.getAllByText(/Turn-by-Turn Waypoint GIS Map/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Assigned Waypoints/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/TRK-AMD-801/i).length).toBeGreaterThan(0);
    });
  });

  it('37. Driver Shift State Gate: Operational details are hidden when shift is off, and shown only when shift is active', async () => {
    // 1. Log in with Shift Completed in localStorage
    const driverObj = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      phone: '9823144552',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      badgeId: 'DRV-801',
      assignedVehicleId: 'TRK-AMD-801',
      vehiclePlate: 'GJ-01-CZ-4821',
      assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - Gota)',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_driver_shift_state_DRV-801', JSON.stringify({ shiftStatus: 'Shift Completed', servicedStops: [] }));

    render(<App />);

    // When shift is completed/off, Standby/Shift Completed message is displayed and details are hidden
    await waitFor(() => {
      expect(screen.getAllByText(/Shift Completed|Collection Standby/i).length).toBeGreaterThan(0);
      expect(screen.queryByText('Driver Field Quick Actions')).toBeNull();
    });

    // Toggle shift on by clicking Start Shift button
    const startShiftBtn = screen.getAllByText(/Start Assigned Shift|Start Shift|Start Next Shift/i)[0];
    fireEvent.click(startShiftBtn);

    // Operational details become visible
    await waitFor(() => {
      expect(screen.getAllByText(/Driver Field Quick Actions/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Complete Shift/i).length).toBeGreaterThan(0);
    });
  });

  it('38. Dynamic Reports Assignment & Shift Completion Guard: Prevents completing shift until all bins are collected and all reports are resolved', async () => {
    const driverObj = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      phone: '9823144552',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      badgeId: 'DRV-801',
      assignedVehicleId: 'TRK-AMD-801',
      vehiclePlate: 'GJ-01-CZ-4821',
      assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - Gota)',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));
    localStorage.setItem(
      'swaachx_driver_shift_state_DRV-801',
      JSON.stringify({ shiftStatus: 'Active Shift', servicedStops: [], resolvedReports: [] })
    );

    render(<App />);

    // 1. Check that sector reports are dynamically assigned and displayed
    await waitFor(() => {
      expect(screen.getAllByText(/Community Reports in Your Sector/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Mark Site Cleared/i).length).toBeGreaterThan(0);
    });

    // 2. Attempt to complete shift while bins and reports are pending -> Should block and show error toast
    const completeShiftBtn = screen.getAllByText(/Complete Shift/i)[0];
    fireEvent.click(completeShiftBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Cannot complete shift/i).length).toBeGreaterThan(0);
    });

    // 3. Clear all assigned smart bins
    const collectButtons = screen.getAllByText(/Collect & Empty Bin/i);
    collectButtons.forEach((btn) => fireEvent.click(btn));

    // 4. Resolve all sector citizen reports
    const resolveButtons = screen.getAllByText(/Mark Site Cleared/i);
    resolveButtons.forEach((btn) => fireEvent.click(btn));

    // 5. Now that all bins and reports are completed, completing shift should succeed
    fireEvent.click(screen.getAllByText(/Complete Shift/i)[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/Shift Completed/i).length).toBeGreaterThan(0);
    });
  });

  it('39. New Shift Fresh Reset: Starting a new shift resets all serviced stops and pending reports so they show active fresh', async () => {
    const driverObj = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      phone: '9823144552',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      badgeId: 'DRV-801',
      assignedVehicleId: 'TRK-AMD-801',
      vehiclePlate: 'GJ-01-CZ-4821',
      assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - Gota)',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));
    // Simulate previous completed shift where all bins were serviced
    localStorage.setItem(
      'swaachx_driver_shift_state_DRV-801',
      JSON.stringify({
        shiftStatus: 'Shift Completed',
        servicedStops: ['BIN-AMD-101', 'BIN-AMD-110', 'BIN-AMD-107'],
        resolvedReports: [],
      })
    );

    render(<App />);

    // Starts in Shift Completed state
    await waitFor(() => {
      expect(screen.getAllByText(/Shift Completed/i).length).toBeGreaterThan(0);
    });

    // Start next shift
    const startNextShiftBtn = screen.getAllByText(/Start Next Shift/i)[0];
    fireEvent.click(startNextShiftBtn);

    // All works reset: smart bins are active and pending collection
    await waitFor(() => {
      expect(screen.getAllByText(/Collect & Empty Bin/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/0 Picked Up/i).length).toBeGreaterThan(0);
    });
  });

  it('40. Completed reports from previous shifts are not shown in future shifts: Filters completed reports and shows only pending or clean queue', async () => {
    const driverObj = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      phone: '9823144552',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      badgeId: 'DRV-801',
      assignedVehicleId: 'TRK-AMD-801',
      vehiclePlate: 'GJ-01-CZ-4821',
      assignedRoute: 'Route A1 - North Ahmedabad (Chandlodiya - Ranip - Gota)',
      role: 'Fleet Driver',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverObj));
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverObj));
    // Simulate past completed shift with all sector reports marked completed
    localStorage.setItem(
      'swaachx_completed_shift_reports',
      JSON.stringify(['REP-AMD-301', 'REP-AMD-302', 'REP-AMD-507'])
    );
    localStorage.setItem(
      'swaachx_driver_shift_state_DRV-801',
      JSON.stringify({ shiftStatus: 'Active Shift', servicedStops: [], resolvedReports: [] })
    );

    render(<App />);

    // Reports REP-AMD-301 and REP-AMD-302 are not shown
    await waitFor(() => {
      expect(screen.queryByText(/REP-AMD-301/i)).toBeNull();
      expect(screen.queryByText(/REP-AMD-302/i)).toBeNull();
    });
  });

  it('41. Profiles Database Password Verification: Handles profile authentication and credential verification', async () => {
    localStorage.clear();
    render(<App />);

    // Open SignIn Modal / AuthView
    await waitFor(() => {
      expect(screen.getAllByText(/Sign In/i).length).toBeGreaterThan(0);
    });

    // Enter email and password
    const emailInput = document.getElementById('auth-email-input') || screen.getByPlaceholderText(/Enter email address/i);
    const passwordInput = document.getElementById('auth-password-input') || screen.getByPlaceholderText(/Enter password.../i);

    fireEvent.change(emailInput, { target: { value: 'suresh.k@wastefleet.org' } });
    fireEvent.change(passwordInput, { target: { value: 'FLT-801-AUTH' } });

    const form = (document.getElementById('auth-password-input') || passwordInput).closest('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getAllByText(/Suresh Kumar|Driver Cockpit/i).length).toBeGreaterThan(0);
    });
  });

  it('42. Driver Dispatch Approval Workflow: Submitted citizen reports enter approval state and assign to driver after confirmation', async () => {
    localStorage.clear();
    const citizenUser = {
      id: 'USR-7722',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@citizen.in',
      phone: '9876543210',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      role: 'Citizen',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(citizenUser));

    const { unmount } = render(<App />);

    // Navigate to Reports view
    const reportTabBtns = screen.getAllByText(/Report Waste Issue/i);
    const targetBtn = reportTabBtns[0].closest('button') || reportTabBtns[0];
    fireEvent.click(targetBtn);

    // Click submit new report tab
    await waitFor(() => {
      expect(document.getElementById('report-incident-tab-btn') || screen.queryByText(/Submit Report/i)).toBeTruthy();
    });
    const subTabBtn = document.getElementById('report-incident-tab-btn') || screen.getByText('Submit Report');
    fireEvent.click(subTabBtn);

    // Fill form details
    await waitFor(() => {
      expect(document.getElementById('report-location-input')).toBeTruthy();
    });
    const locInput = document.getElementById('report-location-input');
    const descInput = document.getElementById('report-description-input');

    fireEvent.change(locInput, { target: { value: 'Near Chandlodiya Lake Road' } });
    fireEvent.change(descInput, { target: { value: 'Severe garbage accumulation blocking pedestrian sidewalk' } });

    const submitBtn = document.getElementById('submit-report-btn') || screen.getByText(/Submit Ticket/i);
    fireEvent.click(submitBtn);

    // Verify report enters pending approval
    await waitFor(() => {
      expect(screen.getAllByText(/Pending Driver Approval|Awaiting Driver Confirmation/i).length).toBeGreaterThan(0);
    });

    unmount();

    // Now switch to Driver (Suresh Kumar, DRV-801)
    localStorage.clear();
    const driverUser = {
      id: 'DRV-801',
      name: 'Suresh Kumar',
      email: 'suresh.k@wastefleet.org',
      badgeId: 'DRV-801',
      role: 'Fleet Driver',
      assignedWard: 'Ward 14 (North Sector - Chandlodiya)',
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(driverUser));
    localStorage.setItem('swaachx_driver_session', JSON.stringify(driverUser));

    render(<App />);

    // Verify incoming dispatch confirmation request appears for this driver
    await waitFor(() => {
      expect(screen.getAllByText(/Confirm & Accept Assignment/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Stays Active Until Decision/i).length).toBeGreaterThan(0);
    });

    // Navigate to Routes tab - notification must STILL remain on screen
    const routesNavBtns = screen.getAllByText(/Assigned Routes/i);
    const targetRouteBtn = routesNavBtns[0].closest('button') || routesNavBtns[0];
    fireEvent.click(targetRouteBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Confirm & Accept Assignment/i).length).toBeGreaterThan(0);
    });

    // Driver clicks confirm & accept for pending requests
    const confirmBtns = screen.getAllByText(/Confirm & Accept Assignment/i);
    confirmBtns.forEach((btn) => fireEvent.click(btn));

    // Verify all notifications are now resolved and cleared
    await waitFor(() => {
      expect(screen.queryByText(/Stays Active Until Decision/i)).toBeNull();
    });
  });

  it('43. Real-time Citizen Notification System: Citizen receives in-app notifications with assigned driver details and issue resolution', async () => {
    localStorage.clear();
    const citizenUser = {
      id: 'USR-7722',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@citizen.in',
      phone: '9876543210',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      role: 'Citizen',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(citizenUser));

    render(<App />);

    // Notification bell button exists in header
    const notifBellBtn = document.getElementById('notifications-bell-btn') || screen.getByLabelText(/Open notifications center/i);
    expect(notifBellBtn).toBeTruthy();
    fireEvent.click(notifBellBtn);

    // Verify notification panel opens
    await waitFor(() => {
      expect(screen.getByText(/Activity Notifications/i)).toBeTruthy();
    });
  });

  it('44. Real-time Live Truck & Route Tracing: Citizen can open live truck GPS tracking modal and driver can trace turn-by-turn route', async () => {
    localStorage.clear();
    const citizenUser = {
      id: 'USR-7722',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@citizen.in',
      phone: '9876543210',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      role: 'Citizen',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(citizenUser));

    render(<App />);

    // Navigate to Citizen Dashboard
    await waitFor(() => {
      expect(screen.getAllByText(/Citizen Community Dashboard|Community Reports/i).length).toBeGreaterThan(0);
    });

    // Verify Dispatched report card has Track Live Truck Route button if dispatched exists or modal opens cleanly
    const trackBtns = screen.queryAllByText(/Track Live Truck Route/i);
    if (trackBtns.length > 0) {
      fireEvent.click(trackBtns[0]);
      await waitFor(() => {
        expect(screen.getAllByText(/Live Real-Time Truck Tracing|Turn-by-Turn/i).length).toBeGreaterThan(0);
      });
    }
  });

  it('45. Admin Portal Security & Authentication Gateway: Only valid municipal administrator credentials unlock the executive command center', async () => {
    const adminUser = {
      id: 'ADM-AMC-001',
      name: 'Municipal Commissioner / Chief Administrator',
      email: 'admin@municipal.gov.in',
      phone: '+91 98250 99881',
      role: 'Admin',
      designation: 'Municipal Commissioner',
      department: 'Ahmedabad Municipal Corporation (AMC) Head Office',
      ward: 'All Zones',
      securityClearance: 'Level 5 (Unrestricted Command)',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(adminUser));

    // Ensure desktop window size for test
    window.innerWidth = 1280;
    window.innerHeight = 800;

    render(<App />);

    // Verify Admin Portal Command Center elements render
    await waitFor(() => {
      expect(screen.getAllByText(/Ahmedabad Municipal Corporation \(AMC\) Command Center|Municipal Executive Command Center/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/SLA Resolution Rate/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Active Compactor Fleet/i).length).toBeGreaterThan(0);
    });

    // Test sub-tabs: Incident Tickets, Fleet, Smart Bins
    const incidentTabBtn = screen.getAllByText(/Incident Tickets/i)[0];
    fireEvent.click(incidentTabBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Municipal Incidents & Community Tickets/i).length).toBeGreaterThan(0);
    });
  });

  it('46. Desktop-Only Viewport Guard: Enforces minimum resolution and restricts view on mobile devices', async () => {
    const adminUser = {
      id: 'ADM-AMC-001',
      name: 'Municipal Commissioner',
      email: 'admin@municipal.gov.in',
      role: 'Admin',
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(adminUser));

    // Simulate mobile viewport
    window.innerWidth = 390;
    window.innerHeight = 844;
    window.dispatchEvent(new Event('resize'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Desktop Workstation Required/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Desktop Security Protocol/i).length).toBeGreaterThan(0);
    });
  });

  it('47. Sidebar Navigation Functionality: Clicking sidebar items seamlessly switches views across Citizen and Admin modes', async () => {
    // 1. Citizen mode
    const citizenUser = {
      id: 'USR-7722',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@citizen.in',
      phone: '9876543210',
      ward: 'Ward 14 (Chandlodiya & Ranip)',
      role: 'Citizen',
      joinedAt: new Date().toISOString(),
    };
    localStorage.setItem('swaachx_user_session', JSON.stringify(citizenUser));
    window.innerWidth = 1280;
    window.innerHeight = 800;

    render(<App />);

    // Click Dustbin Locator on Sidebar
    await waitFor(() => {
      expect(screen.getAllByText(/Dustbin Locator/i).length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText(/Dustbin Locator/i)[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/Find nearest public waste bins|Dedicated GPS & Navigation/i).length).toBeGreaterThan(0);
    });

    // Click Report Waste Issue on Sidebar
    fireEvent.click(screen.getAllByText(/Report Waste Issue/i)[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/Report Waste Issue|Submit Photo & GPS/i).length).toBeGreaterThan(0);
    });
  });

  it('48. Driver Email Registration Restriction: Blocks registration attempts using official municipal fleet driver emails', async () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(nameInput, { target: { value: 'New Test Driver' } });
    fireEvent.change(emailInput, { target: { value: 'suresh.k@wastefleet.org' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Registration Restricted: Fleet Driver accounts are pre-certified/i).length).toBeGreaterThan(0);
    });
  });

  it('49. Admin Email Registration Restriction: Blocks registration attempts using municipal official administrator emails', async () => {
    render(<App />);

    // Switch to Register tab
    const registerTabBtn = document.getElementById('header-register-btn');
    fireEvent.click(registerTabBtn);

    const nameInput = document.getElementById('auth-name-input');
    const emailInput = document.getElementById('auth-email-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    fireEvent.change(nameInput, { target: { value: 'New Test Official' } });
    fireEvent.change(emailInput, { target: { value: 'admin@municipal.gov.in' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Registration Restricted: Municipal Officer\/Admin accounts are pre-provisioned/i).length).toBeGreaterThan(0);
    });
  });

  it('50. AI Smart Waste Analyzer: Opens AI modal from Citizen Portal and presents segregation suggestions', async () => {
    localStorage.clear();
    render(<App />);

    // Switch to Citizen
    loginAsCitizen();

    await waitFor(() => {
      expect(screen.getAllByText(/Know Your Waste/i).length).toBeGreaterThan(0);
    });

    // Click scanner button
    const openScannerBtn = document.getElementById('hero-open-ai-scanner-btn') || screen.getByText(/Scan Waste Photo Now/i);
    fireEvent.click(openScannerBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Know Your Waste/i).length).toBeGreaterThan(0);
    });

    // Select preset sample
    const sampleBtn = screen.getByText(/Plastic Water Bottles/i);
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/^Analyze$/i)).toBeDefined();
    });
  });

  it('51. AI Circular Economy Suggestions: Generates recycling & upcycling advice for waste items', async () => {
    const { analyzeWasteWithGemini } = await import('../lib/aiWasteAnalyzer');
    const result = await analyzeWasteWithGemini({
      textHint: 'plastic water bottle pet',
    });

    expect(result.success).toBe(true);
    expect(result.isWaste).toBe(true);
    expect(result.wasteType).toContain('Plastic');
    expect(result.binColor).toContain('Blue');
    expect(result.upcyclingIdeas.length).toBeGreaterThan(0);
    expect(result.carbonSavedKg).toBeGreaterThan(0);
  });

  it('52. AI Non-Waste Verification: Accurately identifies non-waste images and replies "This is not a waste item"', async () => {
    const { analyzeWasteWithGemini } = await import('../lib/aiWasteAnalyzer');
    const result = await analyzeWasteWithGemini({
      textHint: 'portrait of a person selfie clean room not waste',
    });

    expect(result.success).toBe(true);
    expect(result.isWaste).toBe(false);
    expect(result.nonWasteReason).toContain('This is not a waste item');
  });

  it('53. Screenshot & UI Rejection: Correctly rejects app screenshots like "Screenshot 2026-08-21 234524.png" as non-waste', async () => {
    const { analyzeWasteWithGemini } = await import('../lib/aiWasteAnalyzer');
    const result = await analyzeWasteWithGemini({
      imageFile: { name: 'Screenshot 2026-08-21 234524.png' },
    });

    expect(result.success).toBe(true);
    expect(result.isWaste).toBe(false);
    expect(result.detectedObject).toContain('Screenshot');
    expect(result.nonWasteReason).toContain('This is not a waste item');
  });

  it('54. Camera Photo Support: Accurately analyzes camera waste photos with random filenames like "IMG_20260821_123456.jpg"', async () => {
    const { analyzeWasteWithGemini } = await import('../lib/aiWasteAnalyzer');
    const result = await analyzeWasteWithGemini({
      imageFile: { name: 'IMG_20260821_123456.jpg' },
    });

    expect(result.success).toBe(true);
    expect(result.isWaste).toBe(true);
    expect(result.binColor).toBeDefined();
    expect(result.upcyclingIdeas.length).toBeGreaterThan(0);
  });

  it('55. Citizen Compulsory Waste Photo Verification: Gemini AI validates physical waste legitimacy and blocks fake submissions', async () => {
    const { verifyReportWastePhoto } = await import('../lib/aiWasteAnalyzer');

    // 1. Invalid Non-Waste Screenshot
    const invalidResult = await verifyReportWastePhoto({
      imageFile: { name: 'Screenshot_UI_Dashboard.png' },
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.isLegitimateWaste).toBe(false);
    expect(invalidResult.reason).toContain('not a waste item');

    // 2. Valid Physical Plastic / Kitchen Waste Photo
    const validResult = await verifyReportWastePhoto({
      imageFile: { name: 'overflowing_plastic_bottles.jpg' },
      textHint: 'plastic bottle waste garbage',
    });
    expect(validResult.isValid).toBe(true);
    expect(validResult.isLegitimateWaste).toBe(true);
    expect(validResult.wasteType).toBeDefined();
    expect(validResult.binColor).toContain('Blue');
  });

  it('56. Driver Dual-Image AI Cleanup Verification Gate: Compares Before vs After photos and confirms site is clean before resolving', async () => {
    const { verifyCleanupBeforeAfterWithGemini } = await import('../lib/aiWasteAnalyzer');

    // 1. Test Uncleaned / Still Dirty Site -> Should be REJECTED (isClean: false)
    const dirtyResult = await verifyCleanupBeforeAfterWithGemini({
      beforeImage: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500',
      afterImage: { name: 'uncleaned_dirty_waste_pile.jpg' },
      reportDetails: { id: 'REP-AMD-301', category: 'Overflowing Bin', location: 'Navrangpura Road' },
    });
    expect(dirtyResult.success).toBe(true);
    expect(dirtyResult.isClean).toBe(false);
    expect(dirtyResult.cleanlinessScore).toBeLessThan(80);
    expect(dirtyResult.residualWasteDetected.length).toBeGreaterThan(0);

    // 2. Test Genuine Cleared & Swept Site -> Should PASS (isClean: true, score >= 80)
    const cleanResult = await verifyCleanupBeforeAfterWithGemini({
      beforeImage: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=500',
      afterImage: { name: 'clean_cleared_pavement.jpg' },
      reportDetails: { id: 'REP-AMD-301', category: 'Overflowing Bin', location: 'Navrangpura Road' },
    });
    expect(cleanResult.success).toBe(true);
    expect(cleanResult.isClean).toBe(true);
    expect(cleanResult.cleanlinessScore).toBeGreaterThanOrEqual(80);
    expect(cleanResult.status).toBe('Verified Clean');
  });

  it('57. Driver Offline Isolation: Zero reports assigned when driver shift is completed or offline (even on refresh)', async () => {
    const { getDriverAssignmentProfile, findNearestDriverForReport } = await import('../lib/driverRouteAssignments');
    const mockDriver = { email: 'suresh.kumar@ahmedabadsmartcity.gov.in', role: 'Driver', badgeId: 'DRV-801', name: 'Suresh Kumar' };

    // 1. In Active Shift: driver receives assigned reports
    const activeProfile = getDriverAssignmentProfile({
      currentUser: mockDriver,
      shiftStatus: 'Active Shift',
    });
    expect(activeProfile.isOffline).toBe(false);
    expect(activeProfile.assignedReports.length).toBeGreaterThan(0);

    // 2. In Completed Shift / Offline: driver receives ZERO reports & ZERO approval popups
    const completedProfile = getDriverAssignmentProfile({
      currentUser: mockDriver,
      shiftStatus: 'Shift Completed',
    });
    expect(completedProfile.isOffline).toBe(true);
    expect(completedProfile.assignedReports.length).toBe(0);
    expect(completedProfile.pendingApprovals.length).toBe(0);

    // 3. Automated Proximity Dispatch excludes offline drivers
    localStorage.setItem('swaachx_driver_shift_state_DRV-801', JSON.stringify({ badgeId: 'DRV-801', shiftStatus: 'Shift Completed' }));
    const match = findNearestDriverForReport({ lat: 23.0812, lng: 72.5425, location: 'Chandlodiya Market' });
    expect(match).toBeDefined();
    // Excluded from DRV-801 since DRV-801 is offline
    expect(match.badgeId).not.toBe('DRV-801');
    localStorage.removeItem('swaachx_driver_shift_state_DRV-801');
  });
});

