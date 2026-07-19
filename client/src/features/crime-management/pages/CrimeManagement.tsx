import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Modal, ConfirmDialog, Badge, DataTable, AlertBanner } from 'shared/components';
import type { DataTableColumn } from 'shared/components';
import { districtsApi } from 'shared/api';
import { useCrimes, useCreateCrime, useUpdateCrime, useDeleteCrime } from 'features/crime-management/hooks/useCrimes';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
] as const;

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'secondary' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  ARCHIVED: 'warning',
};

interface CrimeRow {
  ROWID: string;
  title: string;
  description: string;
  crime_type: string;
  location: string;
  district_id: string;
  station_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  CREATEDTIME: string;
}

interface CrimeFormData {
  title: string;
  description: string;
  crime_type: string;
  location: string;
  district_id: string;
  station_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

const emptyForm: CrimeFormData = {
  title: '',
  description: '',
  crime_type: '',
  location: '',
  district_id: '',
  station_id: '',
  status: 'ACTIVE',
};

const CrimeManagement: React.FC = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    district_id: '',
    station_id: '',
    crime_type: '',
    status: '',
    date_from: '',
    date_to: '',
  });
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCrime, setEditingCrime] = useState<CrimeRow | null>(null);
  const [viewingCrime, setViewingCrime] = useState<CrimeRow | null>(null);
  const [deletingCrime, setDeletingCrime] = useState<CrimeRow | null>(null);
  const [formData, setFormData] = useState<CrimeFormData>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);

  const { data: crimes, isLoading, error, refetch } = useCrimes({
    ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
    ...(filters.district_id ? { district_id: filters.district_id } : {}),
    ...(filters.station_id ? { station_id: filters.station_id } : {}),
    ...(filters.crime_type ? { crime_type: filters.crime_type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.date_from ? { date_from: filters.date_from } : {}),
    ...(filters.date_to ? { date_to: filters.date_to } : {}),
    limit: 100,
    offset: 0,
  });

  const createMutation = useCreateCrime();
  const updateMutation = useUpdateCrime();
  const deleteMutation = useDeleteCrime();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(filters.keyword), 300);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await districtsApi.list();
        setDistricts(res.data.map((d) => ({ id: d.id, name: d.name })));
      } catch {
        // silent
      } finally {
        setDistrictsLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  const districtName = useMemo(() => {
    const map = new Map(districts.map((d) => [d.id, d.name]));
    return (id: string) => map.get(id) ?? id;
  }, [districts]);

  const columns: DataTableColumn<CrimeRow>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      sortValue: (r) => r.title,
      render: (r) => (
        <button
          type="button"
          onClick={() => setViewingCrime(r)}
          className="text-left font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {r.title}
        </button>
      ),
    },
    { key: 'crime_type', header: 'Crime Type', render: (r) => r.crime_type },
    { key: 'location', header: 'Location', render: (r) => r.location },
    { key: 'district_id', header: 'District', render: (r) => districtName(r.district_id) },
    { key: 'station_id', header: 'Station', render: (r) => r.station_id },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge variant={STATUS_BADGE_VARIANT[r.status] ?? 'secondary'}>{r.status}</Badge>
      ),
    },
    {
      key: 'CREATEDTIME',
      header: 'Created',
      sortable: true,
      sortValue: (r) => r.CREATEDTIME,
      render: (r) => new Date(r.CREATEDTIME).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(r)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingCrime(r)} className="text-alert-red">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const openCreate = () => {
    setEditingCrime(null);
    setFormData(emptyForm);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEdit = (crime: CrimeRow) => {
    setEditingCrime(crime);
    setFormData({
      title: crime.title,
      description: crime.description,
      crime_type: crime.crime_type,
      location: crime.location,
      district_id: crime.district_id,
      station_id: crime.station_id,
      status: crime.status,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCrime(null);
    setFormData(emptyForm);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setFormError('Description is required');
      return false;
    }
    if (!formData.crime_type.trim()) {
      setFormError('Crime type is required');
      return false;
    }
    if (!formData.location.trim()) {
      setFormError('Location is required');
      return false;
    }
    if (!formData.district_id) {
      setFormError('District is required');
      return false;
    }
    if (!formData.station_id.trim()) {
      setFormError('Police station is required');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingCrime) {
        await updateMutation.mutateAsync({
          id: editingCrime.ROWID,
          data: {
            title: formData.title,
            description: formData.description,
            crime_type: formData.crime_type,
            location: formData.location,
            district_id: formData.district_id,
            station_id: formData.station_id,
            status: formData.status,
          },
        });
        toast.success('Crime updated successfully');
      } else {
        await createMutation.mutateAsync({
          title: formData.title,
          description: formData.description,
          crime_type: formData.crime_type,
          location: formData.location,
          district_id: formData.district_id,
          station_id: formData.station_id,
          status: formData.status,
        });
        toast.success('Crime created successfully');
      }
      handleCloseForm();
      refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : 'Operation failed';
      setFormError(message ?? 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingCrime) return;
    try {
      await deleteMutation.mutateAsync(deletingCrime.ROWID);
      toast.success('Crime deleted successfully');
      setDeletingCrime(null);
      refetch();
    } catch {
      toast.error('Failed to delete crime');
    }
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      district_id: '',
      station_id: '',
      crime_type: '',
      status: '',
      date_from: '',
      date_to: '',
    });
    setDebouncedKeyword('');
  };

  const listRows: CrimeRow[] = useMemo(
    () =>
      (crimes ?? []).map((c) => ({
        ROWID: c.ROWID,
        title: c.title,
        description: c.description,
        crime_type: c.crime_type,
        location: c.location,
        district_id: c.district_id,
        station_id: c.station_id,
        status: c.status,
        CREATEDTIME: c.CREATEDTIME,
      })),
    [crimes],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Crime Management</h1>
          <p className="text-sm text-gov-slate">Create, view, and manage crime records</p>
        </div>
        <Button onClick={openCreate}>Create Crime</Button>
      </div>

      {error && (
        <AlertBanner variant="error" title="Failed to load crimes" message={error instanceof Error ? error.message : 'Unknown error'} />
      )}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Keyword</label>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
              placeholder="Search crimes..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
            <select
              value={filters.district_id}
              onChange={(e) => setFilters((f) => ({ ...f, district_id: e.target.value }))}
              disabled={districtsLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Police Station</label>
            <input
              type="text"
              value={filters.station_id}
              onChange={(e) => setFilters((f) => ({ ...f, station_id: e.target.value }))}
              placeholder="Station ID"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Crime Type</label>
            <input
              type="text"
              value={filters.crime_type}
              onChange={(e) => setFilters((f) => ({ ...f, crime_type: e.target.value }))}
              placeholder="Crime type"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={listRows}
        rowKey={(r) => r.ROWID}
        isLoading={isLoading}
        emptyTitle="No crimes found"
        emptyDescription="Try adjusting your filters or create a new crime record."
        virtualized={false}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={editingCrime ? 'Edit Crime' : 'Create Crime'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleCloseForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
              {editingCrime ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {formError && <AlertBanner variant="error" title="Validation Error" message={formError} />}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Crime Type</label>
            <input
              type="text"
              value={formData.crime_type}
              onChange={(e) => setFormData((f) => ({ ...f, crime_type: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData((f) => ({ ...f, location: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
            <select
              value={formData.district_id}
              onChange={(e) => setFormData((f) => ({ ...f, district_id: e.target.value }))}
              disabled={districtsLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">Select district</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Police Station</label>
            <input
              type="text"
              value={formData.station_id}
              onChange={(e) => setFormData((f) => ({ ...f, station_id: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value as CrimeFormData['status'] }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.filter((s) => s.value !== '').map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!viewingCrime}
        onClose={() => setViewingCrime(null)}
        title="Crime Details"
        footer={
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setViewingCrime(null)}>Close</Button>
          </div>
        }
      >
        {viewingCrime && (
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Title:</span>
              <p className="text-gray-900">{viewingCrime.title}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Description:</span>
              <p className="text-gray-900">{viewingCrime.description}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Crime Type:</span>
              <p className="text-gray-900">{viewingCrime.crime_type}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <p className="text-gray-900">{viewingCrime.location}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">District:</span>
              <p className="text-gray-900">{districtName(viewingCrime.district_id)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Police Station:</span>
              <p className="text-gray-900">{viewingCrime.station_id}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <Badge variant={STATUS_BADGE_VARIANT[viewingCrime.status] ?? 'secondary'}>{viewingCrime.status}</Badge>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-900">{new Date(viewingCrime.CREATEDTIME).toLocaleString()}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCrime}
        onClose={() => setDeletingCrime(null)}
        onConfirm={handleDelete}
        title="Delete Crime"
        message={`Are you sure you want to delete "${deletingCrime?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
};

export default CrimeManagement;
