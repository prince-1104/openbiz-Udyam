'use client';

import { useState } from 'react';

type Field = {
  key: string;
  type: string;
  label: string;
  required?: boolean;
  pattern?: string;
  placeholder?: string;
  example?: string;
  options?: string[];
};

export default function DynamicForm({
  schema,
  onSubmit,
}: {
  schema: { title: string; fields: Field[] };
  onSubmit: (data: Record<string, string>) => void;
}) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">{schema.title}</h2>
      {schema.fields.map((field) => (
        <div key={field.key} className="mb-4">
          <label className="block font-medium mb-1">{field.label}</label>
          {field.type === 'select' && field.options ? (
            <select
              className="border p-2 w-full"
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              className="border p-2 w-full"
              placeholder={field.placeholder || ''}
              value={formData[field.key] || ''}
              onChange={(e) => handleChange(field.key, e.target.value)}
              required={field.required}
              pattern={field.pattern || undefined}
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
