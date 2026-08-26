import axios from 'axios';
import {
  MOCK_DASHBOARD_SUMMARY,
  MOCK_PROJECTS,
  MOCK_ANOMALIES,
  MOCK_RISK_CASES,
  MOCK_CONTRACTORS,
  MOCK_DISTRICTS,
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
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html')) {
      return getMockFallback(response.config.url || '');
    }
    return response;
  },
  (error) => {
    const url = error.config?.url || '';
    if (!error.response || error.response.status === 404 || error.response.status === 405 || error.code === 'ERR_NETWORK') {
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

  if (url.includes('/dashboard/summary')) {
    return {
      data: { success: true, data: MOCK_DASHBOARD_SUMMARY },
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
            total: 5200,
            page: 1,
            limit: 15,
            totalPages: 347,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

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

  if (url.includes('/risk-cases')) {
    return {
      data: {
        success: true,
        data: {
          cases: MOCK_RISK_CASES,
          statusSummary: {
            OPEN: 12,
            UNDER_REVIEW: 6,
            VERIFIED: 2,
            DISMISSED: 1,
            ESCALATED: 0,
          },
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    };
  }

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

  return {
    data: { success: true, data: {} },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  };
}

export default api;
