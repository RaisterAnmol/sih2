from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProjectData(BaseModel):
    projectId: str
    title: str
    description: Optional[str] = ""
    category: str
    state: str
    district: str
    constituency: Optional[str] = ""
    allocatedAmount: float
    utilizedAmount: float
    progress: float = 0.0
    status: str = "IN_PROGRESS"
    contractorId: Optional[str] = ""
    contractorName: Optional[str] = ""
    approvalDate: Optional[str] = None
    startDate: Optional[str] = None
    expectedCompletionDate: Optional[str] = None
    actualCompletionDate: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    isGroundTruthAnomaly: Optional[bool] = False
    groundTruthType: Optional[str] = None

class DetectionSignal(BaseModel):
    ruleId: str
    dimension: str  # FINANCIAL, CONTRACTOR, DUPLICATE, GEOGRAPHIC, TEMPORAL, EFFICIENCY, DATA_QUALITY
    signal: str
    severity: str   # LOW, MEDIUM, HIGH, CRITICAL
    explanation: str
    supportingValue: Optional[Dict[str, Any]] = None
    weight: float = 1.0

class SimilarProjectMatch(BaseModel):
    projectId: str
    title: str
    similarityScore: float
    reasons: List[str]

class ProjectAnalysisResponse(BaseModel):
    projectId: str
    overallRiskScore: float
    riskLevel: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidenceScore: float
    signals: List[DetectionSignal]
    similarProjects: List[SimilarProjectMatch]
    dimensionScores: Dict[str, float]
    recommendation: str
    modelMetadata: Dict[str, Any]

class BatchAnalysisRequest(BaseModel):
    projects: List[ProjectData]
    weights: Optional[Dict[str, float]] = None

class BatchAnalysisResponse(BaseModel):
    totalProjects: int
    anomaliesDetected: int
    results: List[ProjectAnalysisResponse]
    metrics: Optional[Dict[str, Any]] = None
