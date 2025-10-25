import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import RadioGroup, { RadioOption } from '../../ui/RadioGroup';
import MultiSelect, { MultiSelectOption } from '../../ui/MultiSelect';
import { StaticProfile, StaticInfoSectionProps } from '../../../types/profile';

const StaticInfoSection: React.FC<StaticInfoSectionProps> = ({
  data,
  isLoading = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();

  const [formData, setFormData] = useState<Partial<StaticProfile>>(
    data || {
      full_name: '',
      date_of_birth: '',
      gender: undefined,
      diet_type: undefined,
      has_food_allergies: false,
      food_allergies_details: '',
      medical_conditions: [],
      medical_conditions_other: '',
      on_regular_medication: false,
      medication_details: '',
    }
  );

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const genderOptions: RadioOption[] = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
    { value: 'Other', label: 'Other' },
  ];

  const dietOptions: RadioOption[] = [
    { value: 'Vegetarian', label: '🥬 Vegetarian' },
    { value: 'Non-Vegetarian', label: '🍗 Non-Vegetarian' },
    { value: 'Vegan', label: '🌱 Vegan' },
    { value: 'Jain', label: '🙏 Jain' },
    { value: 'Eggetarian', label: '🥚 Eggetarian' },
  ];

  const medicalConditionOptions: MultiSelectOption[] = [
    { value: 'Diabetes', label: '🩺 Diabetes' },
    { value: 'Thyroid', label: '🧬 Thyroid' },
    { value: 'PCOS', label: '⚕️ PCOS' },
    { value: 'Asthma', label: '💨 Asthma' },
    { value: 'None', label: '✅ None' },
    { value: 'Other', label: '📝 Other' },
  ];

  const handleSave = async () => {
    try {
      setError(undefined);
      setIsSaving(true);

      if (!formData.full_name || !formData.date_of_birth || !formData.gender || !formData.diet_type) {
        setError('Please fill in all required fields');
        return;
      }

      await onSave?.(formData);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(data || {});
    setIsEditing(false);
    setError(undefined);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span> Static Information
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
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name || ''}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
              placeholder="Enter your full name"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Gender *
            </label>
            <RadioGroup
              name="gender"
              options={genderOptions}
              value={formData.gender || ''}
              onChange={(value) => setFormData({ ...formData, gender: value as StaticProfile['gender'] })}
              direction="horizontal"
            />
          </div>

          {/* Diet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Diet Type *
            </label>
            <RadioGroup
              name="diet_type"
              options={dietOptions}
              value={formData.diet_type || ''}
              onChange={(value) => setFormData({ ...formData, diet_type: value as StaticProfile['diet_type'] })}
            />
          </div>

          {/* Food Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Do you have any food allergies?
            </label>
            <RadioGroup
              name="has_food_allergies"
              options={[
                { value: 'true', label: '✅ Yes' },
                { value: 'false', label: '❌ No' },
              ]}
              value={formData.has_food_allergies ? 'true' : 'false'}
              onChange={(value) =>
                setFormData({ ...formData, has_food_allergies: value === 'true' })
              }
              direction="horizontal"
            />

            {formData.has_food_allergies && (
              <input
                type="text"
                value={formData.food_allergies_details || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    food_allergies_details: e.target.value,
                  })
                }
                placeholder="Specify your allergies..."
                className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
              />
            )}
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Existing Medical Conditions
            </label>
            <MultiSelect
              name="medical_conditions"
              options={medicalConditionOptions}
              values={formData.medical_conditions || []}
              onChange={(values) =>
                setFormData({ ...formData, medical_conditions: values })
              }
              showSelectedTags
            />

            {formData.medical_conditions?.includes('Other') && (
              <input
                type="text"
                value={formData.medical_conditions_other || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medical_conditions_other: e.target.value,
                  })
                }
                placeholder="Specify other medical conditions..."
                className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
              />
            )}
          </div>

          {/* Regular Medication */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Are you on any regular medication?
            </label>
            <RadioGroup
              name="on_regular_medication"
              options={[
                { value: 'true', label: '✅ Yes' },
                { value: 'false', label: '❌ No' },
              ]}
              value={formData.on_regular_medication ? 'true' : 'false'}
              onChange={(value) =>
                setFormData({ ...formData, on_regular_medication: value === 'true' })
              }
              direction="horizontal"
            />

            {formData.on_regular_medication && (
              <input
                type="text"
                value={formData.medication_details || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    medication_details: e.target.value,
                  })
                }
                placeholder="Specify medications..."
                className="w-full mt-3 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#2D3643] transition-colors"
              />
            )}
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
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.full_name}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(data.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.gender}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Diet Type</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {data.diet_type}
                  </p>
                </div>
              </div>

              {data.has_food_allergies && (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Food Allergies</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.food_allergies_details}
                    </p>
                  </div>
                </div>
              )}

              {data.medical_conditions && data.medical_conditions.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600">Medical Conditions</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.medical_conditions.map((condition) => (
                      <span
                        key={condition}
                        className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.on_regular_medication && (
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Medications</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {data.medication_details}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StaticInfoSection;
