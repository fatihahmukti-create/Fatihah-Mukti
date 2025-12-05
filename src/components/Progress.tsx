
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getWeightHistory, getLogs } from '../services/storageService';
import { WeightEntry } from '../types';

const Progress: React.FC = () => {
  const [weightData, setWeightData] = useState<WeightEntry[]>([]);
  // Mocking weekly calories for demo purposes, in real app, query last 7 days from storage
  const [weeklyData] = useState([
    { day: 'Mon', cal: 2100 },
    { day: 'Tue', cal: 2300 },
    { day: 'Wed', cal: 1950 },
    { day: 'Thu', cal: 2400 },
    { day: 'Fri', cal: 2200 },
    { day: 'Sat', cal: 2600 },
    { day: 'Sun', cal: 2150 },
  ]);

  useEffect(() => {
    setWeightData(getWeightHistory());
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Your Progress</h2>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Weight History</h3>
        <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
             </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Calorie Consistency (This Week)</h3>
        <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8'}} />
                  <Tooltip 
                    cursor={{fill: '#F1F5F9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="cal" fill="#46A7F2" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Progress;
