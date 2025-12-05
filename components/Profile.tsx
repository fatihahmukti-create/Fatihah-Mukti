
import React, { useEffect, useState } from 'react';
import { getProfile, saveProfile, calculateTargets } from '../services/storageService';
import { UserProfile } from '../types';
import { Save, Calculator, Globe } from 'lucide-react';

const Profile: React.FC = () => {
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setFormData(getProfile());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value, type } = e.target;
    
    // Handle checkbox/toggle logic implicitly if needed, but here simple mapping
    const val = (type === 'number') ? Number(value) : value;

    setFormData({
        ...formData,
        [name]: val
    });
  };

  const toggleManual = () => {
      if (!formData) return;
      setFormData({ ...formData, useManualTargets: !formData.useManualTargets });
  }

  const handleSave = () => {
    if (!formData) return;
    // Auto-calculate targets based on new biometrics (this respects the useManualTargets flag inside calculateTargets)
    const updatedProfile = calculateTargets(formData);
    setFormData(updatedProfile);
    saveProfile(updatedProfile);
    setMsg('Profile updated & targets saved!');
    setTimeout(() => setMsg(''), 3000);
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
       <h2 className="text-2xl font-bold text-slate-800">Your Profile</h2>
       
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Language / Bahasa</label>
                    <select name="language" value={formData.language || 'id'} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg bg-blue-50/50">
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                    </select>
                </div>
            </div>

            <h3 className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Activity Level</label>
                    <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg">
                        <option value="sedentary">Sedentary (Office job)</option>
                        <option value="light">Light (1-2 days/week)</option>
                        <option value="moderate">Moderate (3-5 days/week)</option>
                        <option value="active">Active (6-7 days/week)</option>
                        <option value="very_active">Very Active (Physical job)</option>
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Goal</label>
                    <select name="goal" value={formData.goal} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg">
                        <option value="lose">Lose Weight (-500 cal)</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain">Gain Muscle (+500 cal)</option>
                    </select>
                </div>
            </div>
       </div>

       <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <Calculator size={18} /> Daily Targets
                </h3>
                <button 
                    onClick={toggleManual}
                    className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-200 hover:bg-blue-50"
                >
                    {formData.useManualTargets ? 'Switch to Auto' : 'Switch to Manual'}
                </button>
            </div>

            {formData.useManualTargets && (
                <div className="mb-4 bg-white/50 p-3 rounded-lg border border-blue-100">
                    <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">Manual Calorie Target</label>
                    <div className="flex items-center gap-2">
                         <input 
                            type="number" 
                            name="manualCalories" 
                            value={formData.manualCalories} 
                            onChange={handleChange} 
                            className="w-full p-2 border border-blue-200 rounded-lg text-lg font-bold text-blue-700"
                        />
                        <span className="text-sm text-blue-600 font-medium">kcal</span>
                    </div>
                </div>
            )}

            {!formData.useManualTargets && (
                 <div className="mb-4">
                    <p className="text-sm text-blue-700 mb-1">
                        Based on your stats, your BMR + Activity is approx <span className="font-bold">{formData.calculatedTdee} kcal</span>.
                    </p>
                    <p className="text-xs text-blue-500">
                        Adjusting for your goal ({formData.goal}), we target:
                    </p>
                 </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                    <span className="block text-xl font-bold text-blue-600">{formData.targetCalories}</span>
                    <span className="text-xs text-slate-500">Total Calories</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                    <span className="block text-xl font-bold text-slate-700">{formData.targetProtein}g</span>
                    <span className="text-xs text-slate-500">Protein</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                    <span className="block text-xl font-bold text-slate-700">{formData.targetCarbs}g</span>
                    <span className="text-xs text-slate-500">Carbs</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm text-center">
                    <span className="block text-xl font-bold text-slate-700">{formData.targetFat}g</span>
                    <span className="text-xs text-slate-500">Fat</span>
                </div>
            </div>
       </div>

       <div className="flex justify-end">
            <button 
                onClick={handleSave}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
                <Save size={18} /> Save Profile
            </button>
       </div>
       
       {msg && <p className="text-center text-green-600 font-medium animate-pulse">{msg}</p>}
    </div>
  );
};

export default Profile;
