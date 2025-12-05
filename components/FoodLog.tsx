import React, { useEffect, useState } from 'react';
import { getLogs, deleteLog } from '../services/storageService';
import { FoodLogEntry, MealType } from '../types';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FoodLog: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);

  useEffect(() => {
    setLogs(getLogs(date));
  }, [date]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
        deleteLog(id);
        setLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const groupedLogs = {
    [MealType.BREAKFAST]: logs.filter(l => l.mealType === MealType.BREAKFAST),
    [MealType.LUNCH]: logs.filter(l => l.mealType === MealType.LUNCH),
    [MealType.DINNER]: logs.filter(l => l.mealType === MealType.DINNER),
    [MealType.SNACK]: logs.filter(l => l.mealType === MealType.SNACK),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
         <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <ChevronLeft size={20} />
         </button>
         <h2 className="font-bold text-slate-800">
            {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
         </h2>
         <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-500">
            <ChevronRight size={20} />
         </button>
      </div>

      {Object.entries(groupedLogs).map(([meal, items]) => (
        <div key={meal} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
                <h3 className="font-semibold text-slate-700">{meal}</h3>
                <span className="text-xs font-medium text-slate-400">
                    {items.reduce((sum, i) => sum + i.food.calories, 0)} kcal
                </span>
            </div>
            
            {items.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                    No items logged. 
                    <Link to="/scan" className="text-blue-500 ml-1 hover:underline">Add one?</Link>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {items.map(log => (
                        <div key={log.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden">
                                     {log.food.image ? (
                                        <img src={`data:image/jpeg;base64,${log.food.image}`} alt="" className="w-full h-full object-cover" />
                                     ) : (
                                        <div className="flex items-center justify-center h-full text-xs">🍎</div>
                                     )}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">{log.food.name}</p>
                                    <p className="text-xs text-slate-500">
                                        P: {log.food.protein}g • C: {log.food.carbs}g • F: {log.food.fat}g
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-bold text-slate-700">{log.food.calories}</span>
                                <button 
                                    onClick={() => handleDelete(log.id)}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      ))}
    </div>
  );
};

export default FoodLog;
