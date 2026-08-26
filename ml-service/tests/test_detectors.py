import pytest
import pandas as pd
from app.schemas.project import ProjectData
from app.services.pipeline import IntelligencePipeline
from app.services.validator import GroundTruthValidator

@pytest.fixture
def sample_projects():
    return [
        ProjectData(
            projectId="MPLAD-2024-MH-PUN-001",
            title="Construction of Community Hall in Pune Ward 12",
            description="RCC community multipurpose building with basic civic amenities",
            category="Community Assets",
            state="Maharashtra",
            district="Pune",
            allocatedAmount=2500000.0,
            utilizedAmount=2400000.0,
            progress=95.0,
            status="COMPLETED",
            contractorName="Shree Ganesh Enterprises",
            startDate="2023-04-10",
            expectedCompletionDate="2023-10-10",
            actualCompletionDate="2023-11-01",
            latitude=18.5204,
            longitude=73.8567,
            isGroundTruthAnomaly=False
        ),
        ProjectData(
            projectId="MPLAD-2024-MH-PUN-002",
            title="Construction of Community Hall in Pune Ward 12",
            description="RCC community multipurpose building with basic civic amenities duplicate",
            category="Community Assets",
            state="Maharashtra",
            district="Pune",
            allocatedAmount=9800000.0,  # ~4x cost outlier + duplicate description
            utilizedAmount=1500000.0,
            progress=15.0,
            status="IN_PROGRESS",
            contractorName="Shree Ganesh Enterprises",
            startDate="2023-01-15",
            expectedCompletionDate="2023-06-15",
            latitude=18.5205,
            longitude=73.8568,
            isGroundTruthAnomaly=True,
            groundTruthType="COST_AND_DUPLICATE_ANOMALY"
        )
    ]

def test_pipeline_execution(sample_projects):
    pipeline = IntelligencePipeline()
    response = pipeline.run_pipeline(sample_projects)
    
    assert response.totalProjects == 2
    assert len(response.results) == 2
    
    # Project 002 is designed to have higher risk
    p1 = response.results[0]
    p2 = response.results[1]
    
    assert p2.overallRiskScore > p1.overallRiskScore
    assert len(p2.signals) > 0
    assert p2.riskLevel in ["HIGH", "CRITICAL"]

def test_validator_metrics(sample_projects):
    pipeline = IntelligencePipeline()
    response = pipeline.run_pipeline(sample_projects)
    
    validator = GroundTruthValidator()
    metrics = validator.evaluate_performance(sample_projects, response.results)
    
    assert "metrics" in metrics
    assert metrics["totalSamples"] == 2
    assert metrics["groundTruthAnomalies"] == 1
