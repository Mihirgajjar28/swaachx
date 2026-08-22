# 🌿 swaach.x — Smart Urban Waste Management & Logistics Platform (SIH PS 8)

---

## 📌 Part 1: Master Prompt Template
Copy and use the prompt below in any AI tool or document generator to retrieve comprehensive technical, operational, and architectural documentation for **swaach.x**:

```markdown
Act as a Principal Solution Architect and Technical Hackathon Lead. Provide an exhaustive, end-to-end technical overview and architectural design for "swaach.x", an AI-powered smart urban waste management and dynamic fleet logistics platform built for Smart India Hackathon (SIH PS 8).

Please cover:
1. Executive Summary & Problem Statement (Urban waste management bottlenecks in municipal corporations like Ahmedabad AMC).
2. Complete Tech Stack (React 18, Vite, Supabase PostgreSQL, OSRM Road Routing, Leaflet GIS, WebSockets).
3. System Architecture & Component Interactions (Frontend views, Context API state layer, Cloud database, Real-time channels).
4. Multi-Role User Workflows:
   - Municipal Admin/Officer (Fleet Telemetry, Hotspot AI Anomaly Detection, Route Generation, Report Redressal).
   - Municipal Fleet Driver (Shift Lifecycle, Road-Snapped Turn-by-Turn Waypoints, Smart Bin Collection, Sector Report Resolution).
   - Citizen Resident (GPS-enabled Issue Reporting, Smart Dustbin Locator, Eco-Karma Points).
5. Technical Algorithms & Logic:
   - Dynamic road routing via OSRM API with live distance decrement upon collection.
   - Shift completion guards (mandatory clearance of all assigned bins & citizen reports).
   - Database-backed authentication and fleet driver badge verification.
6. Mermaid Diagrams for:
   - High-Level System Architecture
   - Driver Shift Lifecycle & Route Execution State Machine
   - Citizen Grievance Redressal Flow
   - Database Entity-Relationship (ER) Schema
   - Turn-by-Turn Waypoint GIS Map Data Flow
```

---

## 🏛️ Part 2: Required System Diagrams

### 1. High-Level System Architecture Diagram
```mermaid
graph TB
    subgraph Client_Layer ["Client Layer (React 18 + Vite)"]
        AdminView["Municipal Admin Dashboard<br/>(Fleet GIS, Hotspots, Reports)"]
        DriverCockpit["Driver Field Cockpit<br/>(Shift Lifecycle & Road Navigation)"]
        CitizenPortal["Citizen Portal<br/>(GPS Reporting & Smart Bin Finder)"]
    end

    subgraph Logic_Layer ["State & Logistics Engine"]
        Context["DashboardContext (Central State)"]
        OSRM["OSRM Routing Engine<br/>(Road-snapped GeoJSON Polylines)"]
        Geo["Geolocation & Distance Engine"]
        Auth["Driver Registry & Verification Service"]
    end

    subgraph Backend_Layer ["Supabase Cloud Backend"]
        DB[(PostgreSQL Database)]
        Realtime["Realtime Engine (WebSockets)"]
        Storage["Storage Buckets (Issue Photos)"]
        AuthSvc["Auth & Security Engine"]
    end

    AdminView --> Context
    DriverCockpit --> Context
    CitizenPortal --> Context

    Context <--> OSRM
    Context <--> Geo
    Context <--> Auth

    Context <-->|REST API / SQL| DB
    Context <-->|Live Events| Realtime
    Context <-->|Uploads| Storage
    Context <-->|Session| AuthSvc
```

---

### 2. Driver Shift & Waypoint Execution State Machine
```mermaid
stateDiagram-v2
    [*] --> Standby: Driver Logs In (Badge / PIN)
    Standby --> ActiveShift: Click "Start Assigned Shift"
    
    state ActiveShift {
        [*] --> NavigateWaypoints: Load OSRM Road Route
        NavigateWaypoints --> CollectBin: Arrive at Smart Dustbin
        CollectBin --> UpdateDistance: Mark "Collect & Empty Bin"
        UpdateDistance --> CheckReports: Recalculate Remaining Route KM
        
        CheckReports --> ResolveReport: Resident Grievance in Sector
        ResolveReport --> SiteCleared: Click "Mark Site Cleared"
        SiteCleared --> CheckReports: Archive Report Permanently
    }

    ActiveShift --> ValidateCompletion: Click "Complete Shift"
    ValidateCompletion --> ShiftBlocked: Pending Bins > 0 OR Unresolved Reports > 0
    ShiftBlocked --> ActiveShift: Resolve Remaining Tasks
    ValidateCompletion --> ShiftDone: All Bins Collected & Reports Cleared (0 Pending)
    ShiftDone --> Standby: Shift Archived & Work State Reset for Next Cycle
```

---

### 3. Citizen Issue Redressal & Field Dispatch Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen Resident
    participant App as swaach.x App
    participant DB as Supabase Database
    participant Admin as Municipal Admin
    actor Driver as Fleet Driver

    Citizen->>App: Submits report (GPS, Photo, Category)
    App->>DB: INSERT into `reports` (Status: Pending Verification)
    DB-->>Admin: Realtime WebSocket Alert
    Admin->>App: Evaluates & Dispatches Route
    App->>DB: UPDATE `reports` (Status: Dispatched, assigned_driver: DRV-801)
    DB-->>Driver: Live Sync to Driver Cockpit
    Driver->>App: Arrives on site & clicks "Mark Site Cleared"
    App->>DB: UPDATE `reports` (Status: Resolved)
    DB-->>Citizen: Issue Resolved Notification + Eco Karma Points (+15)
```

---

### 4. Database Entity-Relationship (ER) Schema
```mermaid
erDiagram
    PROFILES {
        uuid id PK
        string email UK
        string name
        string phone
        string ward
        string role
        string password
        int karma_points
        int reports_count
        timestamp created_at
    }

    REPORTS {
        string id PK
        string citizen_name
        string citizen_phone
        string citizen_email
        string ward
        string category
        string location
        float latitude
        float longitude
        string description
        string photo_url
        string priority
        string status
        string assigned_driver
        timestamp created_at
    }

    VEHICLES {
        string id PK
        string plate_number
        string driver_name
        string driver_badge
        string driver_phone
        string status
        int fuel_percent
        int battery_percent
        float load_capacity_tons
        float current_load_tons
        float latitude
        float longitude
        string current_ward
    }

    DUSTBINS {
        string id PK
        string name
        string ward
        string category
        int fill_level
        int capacity_liters
        int battery_level
        string odour_level
        string status
        float latitude
        float longitude
        string qr_code
    }

    HOTSPOTS {
        string id PK
        string zone_name
        string ward
        string risk_level
        int confidence_score
        string predicted_volume
        string primary_anomaly
        float latitude
        float longitude
    }

    PROFILES ||--o{ REPORTS : "files"
    VEHICLES ||--o{ REPORTS : "services"
    VEHICLES ||--o{ DUSTBINS : "collects"
```

---

## 💻 Part 3: System Module Summary

| Module | Purpose | Key Technologies |
| :--- | :--- | :--- |
| **Driver Cockpit** | Shift management, turn-by-turn OSRM waypoint navigation, smart bin collection, real-time sector report clearing. | React 18, OSRM API, Geolocation, Leaflet |
| **Admin Operations** | Fleet tracking, ML waste hotspot prediction, AI route optimization, citizen ticket dispatch. | React-Leaflet, Supabase Realtime WebSockets |
| **Citizen Portal** | GPS camera reporting, smart bin navigation, eco-karma points, grievance resolution tracking. | HTML5 Geolocation API, Supabase Storage |
| **Authentication** | Dual-mode login (Citizen / Driver Badge), database password verification in `profiles` table, 6-digit Email OTP. | Supabase Auth, PostgreSQL RLS |
