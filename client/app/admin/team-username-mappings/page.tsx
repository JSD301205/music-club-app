'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase-client';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch } from 'react-icons/fa';

interface UsernameMapping {
  id: number;
  team_member_name: string;
  username: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Type for insert/update operations
type MappingInsert = {
  team_member_name: string;
  username: string;
  notes: string | null;
};

export default function TeamUsernameMappingsAdmin() {
  const [mappings, setMappings] = useState<UsernameMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    team_member_name: '',
    username: '',
    notes: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchMappings();
  }, []);

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await (supabase
        .from('team_member_username_mappings')
        .select('*') as any)
        .order('team_member_name', { ascending: true });

      if (fetchError) throw fetchError;
      setMappings(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching mappings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.team_member_name || !formData.username) {
        alert('Team member name and username are required');
        return;
      }

      const insertData: MappingInsert = {
        team_member_name: formData.team_member_name,
        username: formData.username,
        notes: formData.notes || null,
      };

      const { error: insertError } = await supabase
        .from('team_member_username_mappings')
        .insert(insertData as any);

      if (insertError) throw insertError;

      setIsCreating(false);
      setFormData({ team_member_name: '', username: '', notes: '' });
      fetchMappings();
    } catch (err: any) {
      alert(`Error creating mapping: ${err.message}`);
      console.error('Error creating mapping:', err);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const mapping = mappings.find(m => m.id === id);
      if (!mapping) return;

      const updateData: Partial<MappingInsert> = {
        team_member_name: formData.team_member_name || mapping.team_member_name,
        username: formData.username || mapping.username,
        notes: formData.notes || mapping.notes,
      };

      // Type assertion for the entire query chain
      const query: any = supabase.from('team_member_username_mappings');
      const { error: updateError } = await query.update(updateData).eq('id', id);

      if (updateError) throw updateError;

      setEditingId(null);
      setFormData({ team_member_name: '', username: '', notes: '' });
      fetchMappings();
    } catch (err: any) {
      alert(`Error updating mapping: ${err.message}`);
      console.error('Error updating mapping:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    try {
      const { error: deleteError } = await (supabase
        .from('team_member_username_mappings')
        .delete() as any)
        .eq('id', id);

      if (deleteError) throw deleteError;
      fetchMappings();
    } catch (err: any) {
      alert(`Error deleting mapping: ${err.message}`);
      console.error('Error deleting mapping:', err);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const query: any = supabase.from('team_member_username_mappings');
      const { error: updateError } = await query
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      fetchMappings();
    } catch (err: any) {
      alert(`Error toggling status: ${err.message}`);
      console.error('Error toggling status:', err);
    }
  };

  const startEdit = (mapping: UsernameMapping) => {
    setEditingId(mapping.id);
    setFormData({
      team_member_name: mapping.team_member_name,
      username: mapping.username,
      notes: mapping.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ team_member_name: '', username: '', notes: '' });
  };

  const filteredMappings = mappings.filter(m =>
    m.team_member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Team Member Username Mappings
            </h1>
            <p className="text-gray-400">
              Manage how team member names link to community profiles
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FaPlus /> Add Mapping
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by team member name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-gray-800 rounded-lg border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Add New Mapping</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Member Name *
                </label>
                <input
                  type="text"
                  value={formData.team_member_name}
                  onChange={(e) => setFormData({ ...formData, team_member_name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="e.g., Harith Y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="e.g., Harith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  placeholder="e.g., Admin, Multiple variations"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave /> Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Mappings Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Team Member Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-gray-700/50 transition-colors">
                    {editingId === mapping.id ? (
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.team_member_name}
                            onChange={(e) => setFormData({ ...formData, team_member_name: e.target.value })}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            mapping.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}>
                            {mapping.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(mapping.id)}
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-white">
                          {mapping.team_member_name}
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-primary-400 bg-gray-900/50 px-2 py-1 rounded text-sm">
                            {mapping.username}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {mapping.notes || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(mapping.id, mapping.is_active)}
                            className={`px-2 py-1 text-xs rounded-full cursor-pointer transition-colors ${
                              mapping.is_active 
                                ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                                : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            }`}
                          >
                            {mapping.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(mapping)}
                              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(mapping.id)}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMappings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              {searchTerm ? 'No mappings found matching your search' : 'No mappings yet. Click "Add Mapping" to create one.'}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-400 font-semibold mb-2">How it works:</h4>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>Add mappings to link team member display names to their community usernames</li>
            <li>Multiple name variations can map to the same username (e.g., "Harith Y" and "Harith Yerragolam" → "Harith")</li>
            <li>Only active mappings are used for linking team cards</li>
            <li>Inactive mappings are preserved but not used in the application</li>
            <li>Changes take effect immediately on team pages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
