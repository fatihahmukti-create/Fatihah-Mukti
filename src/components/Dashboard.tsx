
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getLogs, getProfile } from '../services/storageService';
import { UserProfile, FoodLogEntry } from '../types';
import { Plus, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  
  useEffect(() => {
    setProfile(getProfile());
    setLogs(getLogs(new Date().toISOString().split('T')[0]));
  }, []);

  if (!profile) return <div>Loading...</div>;

  const totalCalories = logs.reduce((acc, log) => acc + log.food.calories, 0);
  const totalProtein = logs.reduce((acc, log) => acc + log.food.protein, 0);
  const totalCarbs = logs.reduce((acc, log) => acc + log.food.carbs, 0);
  const totalFat = logs.reduce((acc, log) => acc + log.food.fat, 0);

  const remainingCalories = Math.max(0, profile.targetCalories - totalCalories);

  // Suggestion Logic
  const getSuggestion = () => {
    if (remainingCalories < 200) return "You've hit your goal! Maybe a light tea or water?";
    
    const pRatio = totalProtein / profile.targetProtein;
    const cRatio = totalCarbs / profile.targetCarbs;
    const fRatio = totalFat / profile.targetFat;

    if (pRatio < cRatio && pRatio < fRatio) return "Try a high-protein snack like Greek Yogurt or Grilled Chicken.";
    if (cRatio < pRatio && cRatio < fRatio) return "You need some energy. How about some fruit or oatmeal?";
    if (fRatio < pRatio && fRatio < cRatio) return "A bit of healthy fats like nuts or avocado would be good.";
    return "You're balanced! A regular mixed meal fits perfectly.";
  };

  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#3B82F6' }, // blue-500
    { name: 'Carbs', value: totalCarbs, color: '#22C55E' },   // green-500
    { name: 'Fat', value: totalFat, color: '#EAB308' },       // yellow-500
  ];

  // If no data, show gray ring
  const chartData = totalCalories === 0 
    ? [{ name: 'Empty', value: 1, color: '#E2E8F0' }] 
    : macroData;

  const MacroCard = ({ label, current, target, colorClass }: any) => {
    const percent = Math.min(100, (current / target) * 100);
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex-1">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-500 font-medium">{label}</span>
                <span className="text-xs text-slate-400">{current}/{target}g</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${colorClass}`} 
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Hello, {profile.name.split(' ')[0]} 👋</h1>
            <p className="text-slate-500 text-sm">Target: <span className="font-semibold text-blue-600">{profile.targetCalories} kcal</span></p>
        </div>
        <Link to="/chat" className="md:hidden bg-blue-50 text-blue-600 p-2 rounded-lg">
            <Plus size={20} />
        </Link>
      </header>

      {/* Main Stats Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-48 h-48 flex-shrink-0">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-800">{remainingCalories}</span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Left</span>
             </div>
        </div>
        
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MacroCard label="Protein" current={totalProtein} target={profile.targetProtein} colorClass="bg-blue-500" />
            <MacroCard label="Carbs" current={totalCarbs} target={profile.targetCarbs} colorClass="bg-green-500" />
            <MacroCard label="Fat" current={totalFat} target={profile.targetFat} colorClass="bg-yellow-500" />
        </div>
      </div>

      {/* Next Meal Suggestion */}
      <div className="bg-gradient-to-r from-violet-500 to-fuchsia-600 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <ChefHat size={24} className="text-white" />
              </div>
              <div>
                  <h3 className="font-bold text-lg mb-1">Next Meal Tip</h3>
                  <p className="text-violet-100 text-sm leading-relaxed">{getSuggestion()}</p>
              </div>
          </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Recent Meals</h3>
            <Link to="/history" className="text-sm text-blue-600 font-medium hover:underline">View History</Link>
        </div>
        <div className="space-y-3">
            {logs.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400">No meals logged today yet.</p>
                    <Link to="/chat" className="mt-3 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Chat to Log</Link>
                </div>
            ) : (
                logs.slice().reverse().slice(0, 3).map((log) => (
                    <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                {log.food.image ? (
                                    <img src={`data:image/jpeg;base64,${log.food.image}`} className="w-full h-full object-cover" alt="food" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">🍽️</div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800">{log.food.name}</h4>
                                <p className="text-xs text-slate-500">{log.mealType} • {log.food.portion}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-slate-800">{log.food.calories}</span>
                            <span className="text-xs text-slate-400">kcal</span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
