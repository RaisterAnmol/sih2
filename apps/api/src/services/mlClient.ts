import axios from 'axios';
import { FallbackRuleEngine, AnalysisOutput } from './fallbackEngine.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export class MLServiceClient {
  static async isHealthy(): Promise<boolean> {
    try {
      const resp = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
      return resp.status === 200 && resp.data?.status === 'healthy';
    } catch {
      return false;
    }
  }

  static async analyzeProjects(projects: any[], customWeights?: Record<string, number>): Promise<{ results: AnalysisOutput[]; metrics?: any }> {
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/analyze/batch`,
        {
          projects: projects.map((p) => ({
            projectId: p.projectId,
            title: p.title,
            description: p.description || '',
            category: p.category,
            state: p.state,
            district: p.district,
            constituency: p.constituency || '',
            allocatedAmount: p.allocatedAmount || 0,
            utilizedAmount: p.utilizedAmount || 0,
            progress: p.progress || 0,
            status: p.status || 'IN_PROGRESS',
            contractorName: p.contractorName || '',
            startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : undefined,
            expectedCompletionDate: p.expectedCompletionDate ? new Date(p.expectedCompletionDate).toISOString().split('T')[0] : undefined,
            actualCompletionDate: p.actualCompletionDate ? new Date(p.actualCompletionDate).toISOString().split('T')[0] : undefined,
            latitude: p.latitude,
            longitude: p.longitude,
            isGroundTruthAnomaly: p.isGroundTruthAnomaly,
          })),
          weights: customWeights,
        },
        { timeout: 30000 }
      );

      return {
        results: response.data.results,
        metrics: response.data.metrics,
      };
    } catch (err: any) {
      console.warn(`[ML Service] FastAPI connection unavailable (${err.message}). Using resilient local statistical engine.`);
      const fallbackResults = FallbackRuleEngine.analyzeProjects(projects, customWeights);
      return { results: fallbackResults };
    }
  }
}
