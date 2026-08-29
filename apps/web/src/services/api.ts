import axios from 'axios';
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_PROJECTS,
  MOCK_ANOMALIES,
  MOCK_RISK_CASES,
  MOCK_CONTRACTORS,
  MOCK_DISTRICTS,
  financialFallbackData,
  temporalFallbackData,
  efficiencyFallbackData,
} from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mplad_auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // If response is HTML text instead of JSON (e.g. index.html returned by Vercel SPA rewrite)
    if (
      typeof response.data === 'string' &&
      (response.data.trim().toLowerCase().startsWith('<!doctype html') || response.data.trim().toLowerCase().startsWith('<html'))
    ) {
      if (import.meta.env.VITE_DEMO_MODE === 'true' || window.location.hostname.includes('vercel.app')) {
        return getMockFallback(response.config.url || '');
      }
      return Promise.reject(new Error(`API returned HTML page for ${response.config.url}. Check backend connection at http://localhost:5000`));
    }
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || window.location.hostname.includes('vercel.app');

    if (isDemoMode && (!error.response || error.response.status === 404 || error.response.status === 405 || error.code === 'ERR_NETWORK')) {
      console.warn(`[API Fallback] Serving mock fallback for ${url} (VITE_DEMO_MODE=true / Standalone)`);
      return Promise.resolve(getMockFallback(url, error.config?.data));
    }

    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('mplad_auth_token');
      localStorage.removeItem('mplad_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function getMockFallback(url: string, requestBody?: any) {
  let postData: any = {};
  if (typeof requestBody === 'string') {
    try { postData = JSON.parse(requestBody); } catch {}
  } else if (requestBody) {
    postData = requestBody;
  }

  // 1. Auth routes
  if (url.includes('/auth/login')) {
    const email = postData.email || 'auditor@mplad-insight.demo';
    const rolePrefix = email.split('@')[0]?.toUpperCase() || 'AUDITOR';
    const role = ['ADMIN', 'AUDITOR', 'ANALYST', 'VIEWER'].includes(rolePrefix) ? rolePrefix : 'AUDITOR';

    return {
      data: {
        success: true,
        data: {
          token: `demo_jwt_token_${role.toLowerCase()}`,
          user: {
            id: `usr-${role.toLowerCase()}`,
            name: `${role.charAt(0) + role.slice(1).toLowerCase()} Officer`,
            email: email,
            role: role,
            department: 'MoSPI Audit Wing',
            designation: 'Senior Inspector',
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  if (url.includes('/auth/me')) {
    const storedUser = localStorage.getItem('mplad_user');
    const user = storedUser ? JSON.parse(storedUser) : {
      id: 'usr-auditor',
      name: 'Priya Iyer (Senior Auditor)',
      email: 'auditor@mplad-insight.demo',
      role: 'AUDITOR',
      department: 'MoSPI Audit Wing',
      designation: 'Senior Inspector',
    };
    return {
      data: { success: true, data: { user } },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 2. Executive Dashboard (/dashboard/summary)
  if (url.includes('/dashboard/summary')) {
    return {
      data: {
        success: true,
        data: MOCK_DASHBOARD_SUMMARY,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 3. Risk Score Matrix (/dashboard/risk-matrix)
  if (url.includes('/dashboard/risk-matrix')) {
    return {
      data: {
        success: true,
        data: {
          matrix: [
            { category: 'Drinking Water & Sanitation', low: 450, medium: 180, high: 45, critical: 12 },
            { category: 'Education Infrastructure', low: 380, medium: 140, high: 28, critical: 8 },
            { category: 'Public Health & Wellness', low: 290, medium: 110, high: 32, critical: 15 },
            { category: 'Roads, Pathways & Bridges', low: 520, medium: 210, high: 58, critical: 18 },
            { category: 'Community Asset & Halls', low: 310, medium: 95, high: 18, critical: 4 },
          ],
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 4. District Heatmap (/dashboard/district-heatmap)
  if (url.includes('/dashboard/district-heatmap')) {
    return {
      data: {
        success: true,
        data: {
          districts: MOCK_DISTRICTS,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 5. Projects list & detail (/projects)
  if (url.includes('/projects/')) {
    const parts = url.split('/');
    const pid = parts[parts.length - 1];
    const project = MOCK_PROJECTS.find(p => p._id === pid || p.projectId === pid) || MOCK_PROJECTS[0];

    return {
      data: {
        success: true,
        data: { project },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  if (url.includes('/projects')) {
    return {
      data: {
        success: true,
        data: {
          projects: MOCK_PROJECTS,
          pagination: {
            total: MOCK_PROJECTS.length,
            page: 1,
            limit: 10,
            totalPages: Math.ceil(MOCK_PROJECTS.length / 10),
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 6. Contractors (/contractors)
  if (url.includes('/contractors')) {
    return {
      data: {
        success: true,
        data: {
          contractors: MOCK_CONTRACTORS,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 7. Anomalies (/anomalies)
  if (url.includes('/anomalies')) {
    return {
      data: {
        success: true,
        data: {
          anomalies: MOCK_ANOMALIES,
          dimensionCounts: {
            FINANCIAL: 140,
            CONTRACTOR: 65,
            DUPLICATE: 32,
            TEMPORAL: 18,
            EFFICIENCY: 14,
          },
          pagination: {
            total: 269,
            page: 1,
            totalPages: 6,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 8. Risk Cases (/risk-cases)
  if (url.includes('/risk-cases')) {
    const openCount = MOCK_RISK_CASES.filter(c => c.status === 'OPEN').length;
    const reviewCount = MOCK_RISK_CASES.filter(c => c.status === 'UNDER_REVIEW').length;
    const verifiedCount = MOCK_RISK_CASES.filter(c => c.status === 'VERIFIED').length;
    const dismissedCount = MOCK_RISK_CASES.filter(c => c.status === 'DISMISSED').length;
    const escalatedCount = MOCK_RISK_CASES.filter(c => c.status === 'ESCALATED').length;

    return {
      data: {
        success: true,
        data: {
          cases: MOCK_RISK_CASES,
          statusSummary: {
            OPEN: openCount,
            UNDER_REVIEW: reviewCount,
            VERIFIED: verifiedCount,
            DISMISSED: dismissedCount,
            ESCALATED: escalatedCount,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 9. GIS Districts (/districts)
  if (url.includes('/districts')) {
    return {
      data: {
        success: true,
        data: {
          districts: MOCK_DISTRICTS,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 10. Analytics (/analytics/financial, /analytics/temporal, /analytics/efficiency)
  if (url.includes('/analytics/financial')) {
    return {
      data: { success: true, data: financialFallbackData },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  if (url.includes('/analytics/temporal')) {
    return {
      data: { success: true, data: temporalFallbackData },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  if (url.includes('/analytics/efficiency')) {
    return {
      data: { success: true, data: efficiencyFallbackData },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 11. Data Quality (/data-quality)
  if (url.includes('/data-quality')) {
    return {
      data: {
        success: true,
        data: {
          overallScore: 94.2,
          pillars: {
            completeness: 95.1,
            validity: 98.4,
            uniqueness: 91.2,
            consistency: 96.0,
            timeliness: 89.5,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 12. Alerts (/alerts)
  if (url.includes('/alerts')) {
    return {
      data: {
        success: true,
        data: {
          alerts: [
            {
              _id: 'alt-1',
              alertId: 'ALT-2025-001',
              type: 'HIGH_RISK_WORK_SANCTIONED',
              priority: 'HIGH',
              title: 'March Rush Pattern Detected in Belagavi',
              message: 'Project MPLAD-2024-KA-BEL-01615 sanctioned on March 28 with 100% voucher release.',
              isRead: false,
              createdAt: '2024-11-21T08:00:00Z',
            },
          ],
          unreadCount: 1,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 13. Audit Logs (/audit-log)
  if (url.includes('/audit-log')) {
    return {
      data: {
        success: true,
        data: {
          logs: [
            {
              _id: 'log-1',
              action: 'RISK_CASE_UPDATE',
              userEmail: 'auditor@mplad-insight.demo',
              resourceType: 'RiskCase',
              resourceId: 'CASE-2024-KA-001',
              details: 'Status updated to UNDER_REVIEW by Auditor Officer',
              timestamp: new Date().toISOString(),
            },
            {
              _id: 'log-2',
              action: 'DATA_IMPORT',
              userEmail: 'admin@mplad-insight.demo',
              resourceType: 'ImportJob',
              resourceId: 'IMPORT-5200',
              details: 'Successfully ingested 5,200 MPLAD work records across 12 States',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
          pagination: {
            total: 2,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  // 14. Settings (/settings)
  if (url.includes('/settings')) {
    return {
      data: {
        success: true,
        data: {
          configuration: {
            weights: {
              financial: 0.25,
              contractor: 0.20,
              duplicate: 0.15,
              geographic: 0.10,
              temporal: 0.10,
              efficiency: 0.10,
              dataQuality: 0.10,
            },
            peerCostOutlierMultiplier: 2.2,
            contractorMonopolyPercent: 30,
            similarityThreshold: 0.68,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

  return {
    data: { success: true, data: {} },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

export default api;
