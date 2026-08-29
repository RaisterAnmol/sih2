import mongoose from 'mongoose';
import { RiskCase } from '../models/RiskCase';

async function updateDistribution() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mplad_insight');
  console.log('Connected to MongoDB');

  const cases = await RiskCase.find().sort({ createdAt: 1 });
  console.log(`Found ${cases.length} cases`);

  const statuses: Array<'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'VERIFIED' | 'DISMISSED'> = [
    'OPEN',
    'UNDER_REVIEW',
    'ESCALATED',
    'VERIFIED',
    'DISMISSED',
  ];

  for (let i = 0; i < cases.length; i++) {
    const assignedStatus = statuses[i % statuses.length];
    await RiskCase.updateOne({ _id: cases[i]._id }, { $set: { status: assignedStatus } });
  }

  const counts = await RiskCase.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  console.log('Updated risk case counts by status:', counts);

  await mongoose.disconnect();
}

updateDistribution().catch(console.error);

