import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Target } from 'lucide-react';
import { FaHeart, FaRulerVertical, FaWeight, FaRunning, FaSmoking, FaWineGlass } from 'react-icons/fa';
import RadioGroup, { RadioOption } from '../../ui/RadioGroup';
import { HealthMetrics, HealthMetricsSectionProps } from '../../../types/profile';

const HealthMetricsSection: React.FC<HealthMetricsSectionProps> = ({
  data,
  isLoading = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');

  const [formData, setFormData] = useState<Partial<HealthMetrics>>(
    data || {
      height_cm: 0,
      current_weight_kg: 0,
      goal: undefined,
      physical_activity_level: undefined,
      smoking_habits: undefined,
      alcohol_consumption: undefined,
    }
  );

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // Conversion functions
  const cmToFeetInches = (cm: number) => {
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { feet, inches };
  };

  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.round((feet * 12 + inches) * 2.54);
  };

  const goalOptions: RadioOption[] = [
    { value: 'Weight Loss', label: 'Weight Loss' },
    { value: 'Weight Gain', label: 'Weight Gain' },
    { value: 'Maintain', label: 'Maintain' },
    { value: 'Boost Immunity', label: 'Boost Immunity' },
  ];

  const activityOptions: RadioOption[] = [
    {
      value: 'Sedentary',
      label: 'Sedentary',
      description: 'Office job, minimal movement',
    },
    {
      value: 'Light',
      label: 'Light',
      description: '1-2 workouts/week',
    },
    {
      value: 'Moderate',
      label: 'Moderate',
      description: '3-4 workouts/week',
    },
    {
      value: 'High',
      label: 'High',
      description: '5+ workouts/week',
    },
  ];

  const smokingOptions: RadioOption[] = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
    { value: 'Sometimes', label: 'Sometimes' },
  ];

  const alcoholOptions: RadioOption[] = [
    { value: 'Never', label: 'Never' },
    { value: 'Occasionally', label: 'Occasionally' },
    { value: 'Often', label: 'Often' },
  ];

  const handleSave = async () => {
    try {
      setError(undefined);
      setIsSaving(true);

      // Validation
      if (!formData.height_cm || formData.height_cm <= 0) {
        setError('Please enter a valid height');
        return;
      }
      if (formData.height_cm < 50 || formData.height_cm > 250) {
        setError('Height must be between 50cm and 250cm');
        return;
      }
      if (!formData.current_weight_kg || formData.current_weight_kg <= 0) {
        setError('Please enter a valid weight');
        return;
      }
      if (formData.current_weight_kg < 20 || formData.current_weight_kg > 500) {
        setError('Weight must be between 20kg and 500kg');
        return;
      }
      if (!formData.goal) {
        setError('Please select a goal');
        return;
      }
      if (!formData.physical_activity_level) {
        setError('Please select activity level');
        return;
      }
      if (!formData.smoking_habits) {
        setError('Please select smoking habits');
        return;
      }
      if (!formData.alcohol_consumption) {
        setError('Please select alcohol consumption');
        return;
      }

      await onSave?.(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save metrics');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(data || {});
    setIsEditing(false);
    setError(undefined);
  };

  const heightData = data ? cmToFeetInches(data.height_cm) : { feet: 0, inches: 0 };
  const [feet, setFeet] = useState(heightData.feet);
  const [inches, setInches] = useState(heightData.inches);

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaHeart className="w-6 h-6 text-red-600" />
          Health Metrics
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
          {/* Height */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FaRulerVertical className="w-4 h-4 text-gray-600" />
              Height *
            </label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setHeightUnit('cm')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors font-medium ${heightUnit === 'cm'
                  ? 'border-[#2D3643] bg-blue-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-600'
                  }`}
              >
                CM
              </button>
              <button
                onClick={() => setHeightUnit('ft')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors font-medium ${heightUnit === 'ft'
                  ? 'border-[#2D3643] bg-blue-50 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-600'
                  }`}
              >
                FT+IN
              </button>
            </div>

            {heightUnit === 'cm' ? (
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={formData.height_cm || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0) {
                      setFormData({ ...formData, height_cm: value });
                    }
                  }}
                  placeholder="Enter height in cm"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">cm</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Feet</label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={feet}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0) {
                        setFeet(value);
                        setFormData({
                          ...formData,
                          height_cm: feetInchesToCm(value, inches),
                        });
                      }
                    }}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 mb-1 block">Inches</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={inches}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0 && value < 12) {
                        setInches(value);
                        setFormData({
                          ...formData,
                          height_cm: feetInchesToCm(feet, value),
                        });
                      }
                    }}
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FaWeight className="w-4 h-4 text-gray-600" />
              Current Weight *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="20"
                max="500"
                value={formData.current_weight_kg || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0) {
                    setFormData({ ...formData, current_weight_kg: value });
                  }
                }}
                placeholder="Enter weight"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">kg</span>
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              Goal *
            </label>
            <RadioGroup
              name="goal"
              options={goalOptions}
              value={formData.goal || ''}
              onChange={(value) => setFormData({ ...formData, goal: value as HealthMetrics['goal'] })}
            />
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FaRunning className="w-4 h-4 text-gray-600" />
              Physical Activity Level *
            </label>
            <RadioGroup
              name="physical_activity_level"
              options={activityOptions}
              value={formData.physical_activity_level || ''}
              onChange={(value) => setFormData({ ...formData, physical_activity_level: value as HealthMetrics['physical_activity_level'] })}
            />
          </div>

          {/* Smoking */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-3 items-center gap-2">
              <FaSmoking className="w-4 h-4 text-gray-600" />
              Smoking Habits *
            </label>
            <RadioGroup
              name="smoking_habits"
              options={smokingOptions}
              value={formData.smoking_habits || ''}
              onChange={(value) => setFormData({ ...formData, smoking_habits: value as HealthMetrics['smoking_habits'] })}
              direction="horizontal"
            />
          </div>

          {/* Alcohol */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FaWineGlass className="w-4 h-4 text-gray-600" />
              Alcohol Consumption *
            </label>
            <RadioGroup
              name="alcohol_consumption"
              options={alcoholOptions}
              value={formData.alcohol_consumption || ''}
              onChange={(value) => setFormData({ ...formData, alcohol_consumption: value as HealthMetrics['alcohol_consumption'] })}
              direction="horizontal"
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
              {isSaving ? 'Saving...' : 'Save Changes'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.height_cm} cm
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.current_weight_kg} kg
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.goal}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Activity Level</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.physical_activity_level}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Smoking</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.smoking_habits}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alcohol</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.alcohol_consumption}
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

export default HealthMetricsSection;
