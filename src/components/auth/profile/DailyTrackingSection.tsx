import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import RadioGroup, { RadioOption } from '../../ui/RadioGroup';
import MultiSelect, { MultiSelectOption } from '../../ui/MultiSelect';
import Slider from '../../ui/Slider';
import { DailyTracking, DailyTrackingSectionProps } from '../../../types/profile';

const DailyTrackingSection: React.FC<DailyTrackingSectionProps> = ({
  data,
  isLoading = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const [formData, setFormData] = useState<Partial<DailyTracking>>(
    data || {
      breakfast_logged: false,
      lunch_logged: false,
      dinner_logged: false,
      water_glasses: 0,
      sleep_hours: 0,
      exercise_logged: false,
      exercise_type: undefined,
      exercise_duration_minutes: 0,
      symptoms: [],
      stress_mood_level: 3,
    }
  );

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const exerciseOptions: RadioOption[] = [
    { value: 'Running', label: '🏃 Running' },
    { value: 'Walking', label: '🚶 Walking' },
    { value: 'Yoga', label: '🧘 Yoga' },
    { value: 'Strength Training', label: '🏋️ Strength Training' },
    { value: 'Cycling', label: '🚴 Cycling' },
    { value: 'Sports', label: '⚽ Sports' },
    { value: 'Other', label: '📝 Other' },
  ];

  const symptomOptions: MultiSelectOption[] = [
    { value: 'Cold', label: '🤧 Cold' },
    { value: 'Cough', label: '🤐 Cough' },
    { value: 'Headache', label: '🤕 Headache' },
    { value: 'Fatigue', label: '😴 Fatigue' },
    { value: 'None', label: '✅ None' },
  ];

  const moodLabels = [
    { value: 1, label: 'Very Low', emoji: '😢' },
    { value: 2, label: 'Low', emoji: '😞' },
    { value: 3, label: 'Normal', emoji: '😊' },
    { value: 4, label: 'High', emoji: '😄' },
    { value: 5, label: 'Very High', emoji: '🤩' },
  ];

  const handleSave = async () => {
    try {
      setError(undefined);
      setIsSaving(true);

      await onSave?.(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tracking data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(data || {});
    setIsEditing(false);
    setError(undefined);
  };

  const mealLogCount = (formData.breakfast_logged ? 1 : 0) + (formData.lunch_logged ? 1 : 0) + (formData.dinner_logged ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📊</span> Daily Tracking
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      {isEditing ? (
        // Edit Mode
        <div className="space-y-6">
          {/* Meals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🍽️</span> Meals ({mealLogCount}/3)
            </h3>

            <div className="space-y-3">
              {/* Breakfast */}
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.breakfast_logged || false}
                  onChange={(e) =>
                    setFormData({ ...formData, breakfast_logged: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-[#2D3643]"
                />
                <span className="font-medium text-gray-900">🥐 Breakfast</span>
              </label>

              {/* Lunch */}
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.lunch_logged || false}
                  onChange={(e) =>
                    setFormData({ ...formData, lunch_logged: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-[#2D3643]"
                />
                <span className="font-medium text-gray-900">🍜 Lunch</span>
              </label>

              {/* Dinner */}
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={formData.dinner_logged || false}
                  onChange={(e) =>
                    setFormData({ ...formData, dinner_logged: e.target.checked })
                  }
                  className="w-4 h-4 cursor-pointer accent-[#2D3643]"
                />
                <span className="font-medium text-gray-900">🍽️ Dinner</span>
              </label>
            </div>
          </div>

          {/* Water Intake */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              💧 Water Intake (glasses)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={formData.water_glasses || 0}
                onChange={(e) =>
                  setFormData({ ...formData, water_glasses: Number(e.target.value) })
                }
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
              />
              <span className="text-xl">💧</span>
            </div>
          </div>

          {/* Sleep */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              😴 Sleep Duration (hours)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.sleep_hours || 0}
              onChange={(e) =>
                setFormData({ ...formData, sleep_hours: Number(e.target.value) })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
            />
          </div>

          {/* Exercise */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.exercise_logged || false}
                onChange={(e) =>
                  setFormData({ ...formData, exercise_logged: e.target.checked })
                }
                className="w-4 h-4 cursor-pointer accent-[#2D3643]"
              />
              <span className="font-medium text-gray-900">Did you exercise today?</span>
            </label>

            {formData.exercise_logged && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Exercise Type
                  </label>
                  <RadioGroup
                    name="exercise_type"
                    options={exerciseOptions}
                    value={formData.exercise_type || ''}
                    onChange={(value) =>
                      setFormData({ ...formData, exercise_type: value as any })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.exercise_duration_minutes || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        exercise_duration_minutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              🤒 Any Symptoms Today?
            </label>
            <MultiSelect
              name="symptoms"
              options={symptomOptions}
              values={formData.symptoms || []}
              onChange={(values) => setFormData({ ...formData, symptoms: values })}
              showSelectedTags
            />
          </div>

          {/* Mood/Stress */}
          <div>
            <Slider
              min={1}
              max={5}
              value={formData.stress_mood_level || 3}
              onChange={(value) =>
                setFormData({ ...formData, stress_mood_level: value as any })
              }
              label="😊 Stress/Mood Level"
              labels={moodLabels}
              showLabels
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2D3643] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Today\'s Log'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="space-y-4">
          {data && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">🍽️ Meals ({mealLogCount}/3)</h3>
                <div className="flex flex-wrap gap-2">
                  {data.breakfast_logged && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium">
                      🥐 Breakfast
                    </span>
                  )}
                  {data.lunch_logged && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium">
                      🍜 Lunch
                    </span>
                  )}
                  {data.dinner_logged && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium">
                      🍽️ Dinner
                    </span>
                  )}
                  {!data.breakfast_logged && !data.lunch_logged && !data.dinner_logged && (
                    <span className="text-gray-500 text-sm">No meals logged yet</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">💧 Water Intake</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.water_glasses} glasses
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">😴 Sleep</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.sleep_hours} hours
                  </p>
                </div>
              </div>

              {data.exercise_logged && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
                  <p className="text-sm text-gray-600">🏃 Exercise</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.exercise_type} - {data.exercise_duration_minutes} minutes
                  </p>
                </div>
              )}

              {data.symptoms && data.symptoms.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">🤒 Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {data.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="px-3 py-1 bg-orange-100 text-orange-900 rounded-full text-sm font-medium"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">😊 Mood/Stress</p>
                <div className="flex items-center gap-2">
                  {moodLabels.find((m) => m.value === data.stress_mood_level)?.emoji && (
                    <span className="text-2xl">
                      {moodLabels.find((m) => m.value === data.stress_mood_level)?.emoji}
                    </span>
                  )}
                  <p className="text-lg font-semibold text-gray-900">
                    {moodLabels.find((m) => m.value === data.stress_mood_level)?.label}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyTrackingSection;
