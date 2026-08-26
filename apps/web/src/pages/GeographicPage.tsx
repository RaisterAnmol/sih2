import React, { useState, useEffect } from 'react';
import { MapPin, Layers, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import api from '../services/api';
import { District } from '../types';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const GeographicPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('ALL');

  const fetchDistricts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedState !== 'ALL') params.append('state', selectedState);
      const res = await api.get(`/districts?${params.toString()}`);
      setDistricts(res.data.data.districts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, [selectedState]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-400" />
            <span>Geographic & Spatial Intelligence (GIS)</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive district risk mapping, spatial clustering detection, and regional capital distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 cursor-pointer"
          >
            <option value="ALL">All States (Pan-India)</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Bihar">Bihar</option>
          </select>
        </div>
      </div>

      {/* Main Full-Screen Map Container */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-400" />
            <span>Pan-India District Anomaly Distribution</span>
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Critical/High Risk District</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal District</span>
            </span>
          </div>
        </div>

        <div className="h-[480px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-10">
          {loading ? (
            <div className="p-6 h-full flex items-center justify-center">
              <LoadingSkeleton count={1} className="h-full" />
            </div>
          ) : (
            <MapContainer
              center={[20.5937, 78.9629]} // Center of India
              zoom={5}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {districts.map((d) => {
                const isHighRisk = d.averageRiskScore >= 50 || d.highRiskProjectsCount > 15;
                const radius = Math.min(24, Math.max(8, Math.sqrt(d.totalProjects) * 2));
                const color = isHighRisk ? '#ef4444' : '#10b981';

                return (
                  <CircleMarker
                    key={d._id}
                    center={[d.latitude, d.longitude]}
                    radius={radius}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.6,
                      color: color,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1 text-slate-900 text-xs">
                        <div className="font-bold text-sm text-slate-950">
                          {d.district}, {d.state}
                        </div>
                        <div>Total Works: <strong>{d.totalProjects}</strong></div>
                        <div>Sanctioned: <strong>₹{(d.totalAllocated / 10000000).toFixed(2)} Cr</strong></div>
                        <div>Average Risk Score: <strong>{d.averageRiskScore}/100</strong></div>
                        <div>High Risk Works: <strong className="text-red-600">{d.highRiskProjectsCount}</strong></div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>

      {/* District Risk Summary Table */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white">District Risk Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/60">
              <tr>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">State</th>
                <th className="py-3 px-3">Total Works</th>
                <th className="py-3 px-3">Sanctioned Value</th>
                <th className="py-3 px-3">Average Project Cost</th>
                <th className="py-3 px-3">Avg Risk Score</th>
                <th className="py-3 px-3">High Risk Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {districts.slice(0, 15).map((d) => (
                <tr key={d._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">{d.district}</td>
                  <td className="py-3 px-3 text-slate-300">{d.state}</td>
                  <td className="py-3 px-3 font-mono text-slate-200">{d.totalProjects}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400 font-medium">
                    ₹{(d.totalAllocated / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    ₹{(d.averageProjectCost / 100000).toFixed(1)} Lakh
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={d.averageRiskScore >= 50 ? 'text-amber-400' : 'text-slate-300'}>
                      {d.averageRiskScore}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className={d.highRiskProjectsCount > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                      {d.highRiskProjectsCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
