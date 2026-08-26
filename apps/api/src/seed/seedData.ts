import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Contractor } from '../models/Contractor.js';
import { District } from '../models/District.js';
import { Anomaly } from '../models/Anomaly.js';
import { RiskCase } from '../models/RiskCase.js';
import { Alert } from '../models/Alert.js';
import { SystemConfiguration } from '../models/SystemConfiguration.js';
import { FallbackRuleEngine } from '../services/fallbackEngine.js';

export const INDIAN_STATES_DISTRICTS = [
  {
    state: 'Maharashtra',
    districts: [
      { name: 'Pune', lat: 18.5204, lon: 73.8567 },
      { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
      { name: 'Nashik', lat: 19.9975, lon: 73.7898 },
      { name: 'Aurangabad', lat: 19.8762, lon: 75.3433 },
      { name: 'Thane', lat: 19.2183, lon: 72.9781 },
      { name: 'Kolhapur', lat: 16.7050, lon: 74.2433 },
    ],
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
      { name: 'Varanasi', lat: 25.3176, lon: 82.9739 },
      { name: 'Kanpur Nagar', lat: 26.4499, lon: 80.3319 },
      { name: 'Prayagraj', lat: 25.4358, lon: 81.8463 },
      { name: 'Gorakhpur', lat: 26.7606, lon: 83.3732 },
      { name: 'Agra', lat: 27.1767, lon: 78.0081 },
    ],
  },
  {
    state: 'Tamil Nadu',
    districts: [
      { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
      { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
      { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
      { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047 },
      { name: 'Salem', lat: 11.6643, lon: 78.1460 },
    ],
  },
  {
    state: 'Karnataka',
    districts: [
      { name: 'Bengaluru Urban', lat: 12.9716, lon: 77.5946 },
      { name: 'Mysuru', lat: 12.2958, lon: 76.6394 },
      { name: 'Belagavi', lat: 15.8497, lon: 74.4977 },
      { name: 'Dharwad', lat: 15.4589, lon: 75.0078 },
      { name: 'Mangaluru', lat: 12.9141, lon: 74.8560 },
    ],
  },
  {
    state: 'Gujarat',
    districts: [
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
      { name: 'Surat', lat: 21.1702, lon: 72.8311 },
      { name: 'Vadodara', lat: 22.3072, lon: 73.1812 },
      { name: 'Rajkot', lat: 22.3039, lon: 70.8022 },
    ],
  },
  {
    state: 'Rajasthan',
    districts: [
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
      { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
      { name: 'Kota', lat: 25.2138, lon: 75.8648 },
      { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
    ],
  },
  {
    state: 'West Bengal',
    districts: [
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
      { name: 'North 24 Parganas', lat: 22.7210, lon: 88.4819 },
      { name: 'Howrah', lat: 22.5958, lon: 88.2636 },
      { name: 'Darjeeling', lat: 27.0410, lon: 88.2663 },
    ],
  },
  {
    state: 'Bihar',
    districts: [
      { name: 'Patna', lat: 25.5941, lon: 85.1376 },
      { name: 'Gaya', lat: 24.7914, lon: 85.0002 },
      { name: 'Muzaffarpur', lat: 26.1209, lon: 85.3647 },
      { name: 'Bhagalpur', lat: 25.2425, lon: 86.9842 },
    ],
  },
];

export const CATEGORIES = [
  'Drinking Water & Sanitation',
  'Education Infrastructure',
  'Public Health & Wellness',
  'Roads, Pathways & Bridges',
  'Community Asset & Halls',
  'Irrigation & Rural Electrification',
  'Sports & Youth Facilities',
  'Skill Development Centers',
];

export const CONTRACTOR_NAMES = [
  'Shree Ganesh Infraprojects Pvt Ltd',
  'Bharat Vikas Construction Co',
  'National Civil Engineers & Builders',
  'Apex Urban Infratech',
  'Maruti Infrastructure Consortium',
  'Hindustan Building Solutions',
  'Vanguard Engineering Works',
  'Sunrise Rural Infra Developers',
  'Pragati Civil Works Ltd',
  'Kaveri Constructions',
  'Ganga Infratech Projects',
  'Deccan Infrastructure & Roads',
  'Om Sai Buildcon Pvt Ltd',
  'Shakti Engineering Corp',
  'Surya Dev Realcon',
  'Modern Civic Developers',
  'Royal Infratech India',
  'Zenith Engineering Works',
  'Pioneer Infrastructure Ltd',
  'Eagle Eye Contractors',
];

export async function seedDemoAccounts(): Promise<void> {
  const defaultPassword = 'Demo@12345';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const demoUsers = [
    {
      email: 'admin@mplad-insight.demo',
      name: 'Dr. Rajesh Sharma (Director General)',
      role: 'ADMIN',
      department: 'Ministry of Statistics and Programme Implementation',
      designation: 'Director General (MoSPI)',
    },
    {
      email: 'auditor@mplad-insight.demo',
      name: 'Priya Iyer (Senior Audit Officer)',
      role: 'AUDITOR',
      department: 'Principal Directorate of Audit (Central)',
      designation: 'Senior Audit Officer (CAG Nominee)',
    },
    {
      email: 'analyst@mplad-insight.demo',
      name: 'Vikram Singh (Data Science Lead)',
      role: 'ANALYST',
      department: 'National Informatics Centre / MoSPI Analytics',
      designation: 'Lead Statistical Analyst',
    },
    {
      email: 'viewer@mplad-insight.demo',
      name: 'Ananya Deshmukh (Public Observer)',
      role: 'VIEWER',
      department: 'Citizen & Parliamentary Oversight Cell',
      designation: 'Oversight Officer',
    },
  ];

  for (const u of demoUsers) {
    await User.updateOne(
      { email: u.email },
      { $set: { ...u, passwordHash, isActive: true } },
      { upsert: true }
    );
  }
  console.log('[Seed] Demo user accounts verified.');
}

export async function seedFullDatabase(targetCount = 5200): Promise<{ projectsCount: number; anomaliesCount: number }> {
  console.log(`[Seed] Generating deterministic ${targetCount} synthetic MPLAD projects dataset...`);

  await seedDemoAccounts();

  // Reset collections
  await Project.deleteMany({});
  await Contractor.deleteMany({});
  await District.deleteMany({});
  await Anomaly.deleteMany({});
  await RiskCase.deleteMany({});
  await Alert.deleteMany({});

  // Seed System Configuration
  await SystemConfiguration.updateOne(
    { configKey: 'DEFAULT' },
    { $set: { configKey: 'DEFAULT' } },
    { upsert: true }
  );

  // Seed District Master Records
  const allDistrictsList: Array<{ state: string; district: string; lat: number; lon: number }> = [];
  for (const s of INDIAN_STATES_DISTRICTS) {
    for (const d of s.districts) {
      allDistrictsList.push({ state: s.state, district: d.name, lat: d.lat, lon: d.lon });
      await District.create({
        state: s.state,
        district: d.name,
        latitude: d.lat,
        longitude: d.lon,
        headquarters: `${d.name} HQ`,
        totalProjects: 0,
        totalAllocated: 0,
        totalUtilized: 0,
      });
    }
  }

  // Pre-seed Contractors
  for (let c = 0; c < CONTRACTOR_NAMES.length; c++) {
    const cName = CONTRACTOR_NAMES[c];
    await Contractor.create({
      contractorId: `CONT-IND-${String(c + 1).padStart(3, '0')}`,
      name: cName,
      registrationNumber: `REG-PWD-${2020 + (c % 4)}-${1000 + c}`,
      contactPerson: `Authorized Signatory ${c + 1}`,
      phone: `+91 98${String(10000000 + c * 4321).substring(0, 8)}`,
      email: `contact@${cName.toLowerCase().replace(/[^a-z]/g, '')}.in`,
      statesOperating: ['Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Tamil Nadu'],
      districtsOperating: ['Pune', 'Lucknow', 'Bengaluru Urban', 'Chennai'],
      totalProjects: 0,
      totalAllocatedValue: 0,
      totalUtilizedValue: 0,
      averageProjectValue: 0,
      highRiskProjectCount: 0,
      riskRate: 0,
    });
  }

  const rawProjects: any[] = [];
  const years = ['2021-2022', '2022-2023', '2023-2024', '2024-2025'];
  const statuses: Array<'SANCTIONED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED'> = [
    'IN_PROGRESS',
    'COMPLETED',
    'COMPLETED',
    'DELAYED',
    'SANCTIONED',
  ];

  // Specific Ground Truth Injected Anomaly Indices
  // 1. Cost Outliers (40 cases)
  // 2. Duplicate / Similar Project Pairs (30 pairs = 60 cases)
  // 3. Contractor Monopolies (Shree Ganesh in Pune, Bharat Vikas in Varanasi)
  // 4. March Fiscal Rush Spikes (100 cases)
  // 5. Stalled Projects (60 cases)

  for (let i = 1; i <= targetCount; i++) {
    const distInfo = allDistrictsList[(i * 7) % allDistrictsList.length];
    const category = CATEGORIES[(i * 3) % CATEGORIES.length];
    const finYear = years[i % years.length];
    const status = statuses[i % statuses.length];

    // Contractor selection: Inject monopoly concentration for Pune and Varanasi
    let contractorName = CONTRACTOR_NAMES[i % CONTRACTOR_NAMES.length];
    if (distInfo.district === 'Pune' && i % 3 === 0) {
      contractorName = 'Shree Ganesh Infraprojects Pvt Ltd'; // ~33% Pune share
    } else if (distInfo.district === 'Varanasi' && i % 3 === 0) {
      contractorName = 'Bharat Vikas Construction Co'; // ~33% Varanasi share
    }

    const baseCostLakhs = 10 + ((i * 13) % 25); // 10L to 35L normal
    let allocatedAmount = baseCostLakhs * 100000;
    let utilizedAmount = Math.round(allocatedAmount * (status === 'COMPLETED' ? 0.98 : (0.3 + ((i % 6) * 0.1))));
    let progress = status === 'COMPLETED' ? 100 : (status === 'SANCTIONED' ? 5 : (20 + (i % 65)));

    let isGroundTruth = false;
    let groundTruthType: string | undefined = undefined;

    // Inject Calibrated Cost Outlier (~3.2x peer median)
    if (i % 85 === 0) {
      allocatedAmount = Math.round(baseCostLakhs * 3.4 * 100000);
      utilizedAmount = Math.round(allocatedAmount * 0.85);
      isGroundTruth = true;
      groundTruthType = 'COST_ANOMALY_OUTLIER';
    }

    // Inject Stalled Execution Anomaly
    if (i % 95 === 0) {
      progress = 12;
      utilizedAmount = Math.round(allocatedAmount * 0.15);
      isGroundTruth = true;
      groundTruthType = 'EFFICIENCY_STALLED_ANOMALY';
    }

    // Inject March Rush Temporal Spikes
    let approvalMonth = 1 + (i % 12);
    let approvalDay = 1 + (i % 28);
    if (i % 30 === 0) {
      approvalMonth = 3;
      approvalDay = 24 + (i % 7); // March 24-30
      isGroundTruth = true;
      groundTruthType = 'TEMPORAL_MARCH_RUSH_ANOMALY';
    }

    const approvalDate = new Date(2023, approvalMonth - 1, approvalDay);
    const startDate = new Date(approvalDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    const expectedEnd = new Date(startDate.getTime() + 180 * 24 * 60 * 60 * 1000);
    const actualEnd = status === 'COMPLETED' ? new Date(expectedEnd.getTime() + 20 * 24 * 60 * 60 * 1000) : undefined;

    // Geographic jitter around district center
    const lat = distInfo.lat + (((i % 100) - 50) * 0.003);
    const lon = distInfo.lon + ((((i * 3) % 100) - 50) * 0.003);

    // Title generation
    let title = `Installation and Development of ${category} at Ward ${1 + (i % 40)}, ${distInfo.district}`;
    if (i % 120 === 0) {
      // Injected duplicate match with neighboring project
      title = `Construction of Multi-Purpose Community Asset Hall in Sector ${(i % 10) + 1}, ${distInfo.district}`;
    }

    const pid = `MPLAD-${finYear.substring(0, 4)}-${distInfo.state.substring(0, 2).toUpperCase()}-${distInfo.district.substring(0, 3).toUpperCase()}-${String(i).padStart(5, '0')}`;

    rawProjects.push({
      projectId: pid,
      title,
      description: `Comprehensive execution of ${category} infrastructure including civil, electrical, and boundary works under MPLADS guidelines.`,
      category,
      state: distInfo.state,
      district: distInfo.district,
      constituency: `${distInfo.district} Parliamentary Constituency`,
      financialYear: finYear,
      allocatedAmount,
      utilizedAmount,
      progress,
      status,
      contractorName,
      approvalDate,
      startDate,
      expectedCompletionDate: expectedEnd,
      actualCompletionDate: actualEnd,
      latitude: lat,
      longitude: lon,
      isGroundTruthAnomaly: isGroundTruth,
      groundTruthType,
    });
  }

  // 2. Run analysis using Fallback Engine on batch
  console.log('[Seed] Executing AI intelligence and anomaly detection pipeline on 5,000+ projects...');
  const analyzedOutputs = FallbackRuleEngine.analyzeProjects(rawProjects);
  const analyzedMap = new Map(analyzedOutputs.map((a) => [a.projectId, a]));

  const projectsToInsert = rawProjects.map((p) => {
    const analysis = analyzedMap.get(p.projectId);
    return {
      ...p,
      riskScore: analysis?.overallRiskScore || 0,
      riskLevel: analysis?.riskLevel || 'LOW',
      confidenceScore: analysis?.confidenceScore || 75,
      signals: analysis?.signals || [],
      similarProjects: analysis?.similarProjects || [],
      dimensionScores: analysis?.dimensionScores || {
        financial: 0,
        contractor: 0,
        duplicate: 0,
        geographic: 0,
        temporal: 0,
        efficiency: 0,
        dataQuality: 0,
      },
      recommendation: analysis?.recommendation || 'Standard audit review.',
      lastAnalyzedAt: new Date(),
    };
  });

  // Bulk Insert Projects in Chunks
  console.log('[Seed] Inserting project records into MongoDB...');
  const chunkSize = 1000;
  for (let i = 0; i < projectsToInsert.length; i += chunkSize) {
    await Project.insertMany(projectsToInsert.slice(i, i + chunkSize));
  }

  // Populate Anomaly Catalog & Open Sample Risk Cases
  console.log('[Seed] Generating Anomaly Catalog and Sample Auditor Risk Cases...');
  const highRiskProjects = projectsToInsert.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL');
  const anomalyDocs: any[] = [];
  const riskCaseDocs: any[] = [];
  const alertDocs: any[] = [];

  let caseCount = 0;
  for (const hr of highRiskProjects) {
    for (const sig of hr.signals) {
      anomalyDocs.push({
        anomalyId: `ANOM-${hr.projectId}-${sig.ruleId}`,
        projectId: hr.projectId,
        projectTitle: hr.title,
        state: hr.state,
        district: hr.district,
        category: hr.category,
        contractorName: hr.contractorName,
        dimension: sig.dimension,
        ruleId: sig.ruleId,
        signal: sig.signal,
        severity: sig.severity,
        score: hr.riskScore,
        explanation: sig.explanation,
        supportingValue: sig.supportingValue,
      });
    }

    if (caseCount < 25) {
      caseCount++;
      const caseId = `CASE-2024-${hr.state.substring(0, 2).toUpperCase()}-${String(caseCount).padStart(4, '0')}`;
      riskCaseDocs.push({
        caseId,
        projectId: hr.projectId,
        projectTitle: hr.title,
        category: hr.category,
        state: hr.state,
        district: hr.district,
        contractorName: hr.contractorName,
        allocatedAmount: hr.allocatedAmount,
        riskScore: hr.riskScore,
        priority: hr.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        status: caseCount % 3 === 0 ? 'UNDER_REVIEW' : (caseCount % 5 === 0 ? 'VERIFIED' : 'OPEN'),
        assignedToEmail: 'auditor@mplad-insight.demo',
        assignedToName: 'Priya Iyer (Senior Audit Officer)',
        initialFlagReasons: hr.signals.map((s: any) => s.signal),
        findingsSummary: 'Desk review initiated on preliminary cost deviation and contractor monopoly signals.',
        notes: [
          {
            noteId: `NOTE-${Date.now()}-${caseCount}`,
            authorEmail: 'auditor@mplad-insight.demo',
            authorName: 'Priya Iyer',
            authorRole: 'AUDITOR',
            content: 'Noticed significant cost outlier compared to district peer median. Requested measurement book from District Planning Office.',
            createdAt: new Date(),
          },
        ],
      });
    }

    if (alertDocs.length < 15) {
      alertDocs.push({
        alertId: `ALERT-${Date.now()}-${alertDocs.length}`,
        type: hr.signals[0]?.dimension === 'CONTRACTOR' ? 'CONTRACTOR_CONCENTRATION' : 'HIGH_RISK_PROJECT',
        priority: hr.riskLevel,
        title: `High Risk Flag: ${hr.projectId}`,
        message: `${hr.signals[0]?.signal || 'Anomalous execution pattern'} in ${hr.district}, ${hr.state}.`,
        projectId: hr.projectId,
        contractorName: hr.contractorName,
        district: hr.district,
        state: hr.state,
        isRead: false,
      });
    }
  }

  if (anomalyDocs.length > 0) {
    for (let i = 0; i < anomalyDocs.length; i += chunkSize) {
      await Anomaly.insertMany(anomalyDocs.slice(i, i + chunkSize));
    }
  }

  if (riskCaseDocs.length > 0) {
    await RiskCase.insertMany(riskCaseDocs);
  }

  if (alertDocs.length > 0) {
    await Alert.insertMany(alertDocs);
  }

  // Update Contractor & District Aggregates
  console.log('[Seed] Updating Contractor and District summary metrics...');
  const contractors = await Contractor.find();
  for (const c of contractors) {
    const cProjects = await Project.find({ contractorName: c.name });
    const totalVal = cProjects.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
    const utilizedVal = cProjects.reduce((acc, curr) => acc + curr.utilizedAmount, 0);
    const hrCount = cProjects.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;
    const riskRate = cProjects.length > 0 ? Math.round((hrCount / cProjects.length) * 100) : 0;

    await Contractor.updateOne(
      { _id: c._id },
      {
        $set: {
          totalProjects: cProjects.length,
          totalAllocatedValue: totalVal,
          totalUtilizedValue: utilizedVal,
          averageProjectValue: cProjects.length > 0 ? Math.round(totalVal / cProjects.length) : 0,
          highRiskProjectCount: hrCount,
          riskRate,
          isFlaggedConcentration: riskRate > 20 || cProjects.length > 250,
        },
      }
    );
  }

  const districts = await District.find();
  for (const d of districts) {
    const dProjects = await Project.find({ district: d.district });
    const totalAlloc = dProjects.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
    const totalUtil = dProjects.reduce((acc, curr) => acc + curr.utilizedAmount, 0);
    const hrCount = dProjects.filter((p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length;
    const avgScore = dProjects.length > 0 ? Math.round((dProjects.reduce((a, b) => a + b.riskScore, 0) / dProjects.length) * 10) / 10 : 0;

    await District.updateOne(
      { _id: d._id },
      {
        $set: {
          totalProjects: dProjects.length,
          totalAllocated: totalAlloc,
          totalUtilized: totalUtil,
          averageProjectCost: dProjects.length > 0 ? Math.round(totalAlloc / dProjects.length) : 0,
          highRiskProjectsCount: hrCount,
          averageRiskScore: avgScore,
        },
      }
    );
  }

  console.log(`[Seed] Seed completed successfully. Seeded ${projectsToInsert.length} projects, ${anomalyDocs.length} anomalies, and ${riskCaseDocs.length} risk cases.`);
  return { projectsCount: projectsToInsert.length, anomaliesCount: anomalyDocs.length };
}
