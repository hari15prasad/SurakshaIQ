import React, { useEffect, useMemo, useState } from 'react';
import { Card, DataTable, KpiCard, LoadingSkeleton, EmptyState, AlertBanner, Badge, Modal } from 'shared/components';
import type { DataTableColumn } from 'shared/components';
import { districtsApi } from 'shared/api';
import { useRepeatOffenders, useTopRepeatOffenders, useRepeatOffenderStatistics } from 'features/repeat-offenders/hooks/useRepeatOffenders';
import type { RepeatOffender, RepeatOffenderDetail } from 'features/repeat-offenders/hooks/useRepeatOffenders';

const RepeatOffenders: React.FC = () => {
  const [filters, setFilters] = useState({
    district_id: '',
    station_id: '',
    crime_type: '',
    minimum_offences: '',
    start_date: '',
    end_date: '',
  });
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [selectedOffender, setSelectedOffender] = useState<RepeatOffender | null>(null);
  const [offenderDetail, setOffenderDetail] = useState<RepeatOffenderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const { data: offenders, isLoading: offendersLoading, error: offendersError } = useRepeatOffenders({
    ...(filters.district_id ? { district_id: filters.district_id } : {}),
    ...(filters.station_id ? { station_id: filters.station_id } : {}),
    ...(filters.crime_type ? { crime_type: filters.crime_type } : {}),
    ...(filters.minimum_offences ? { minimum_offences: parseInt(filters.minimum_offences, 10) } : {}),
    ...(filters.start_date ? { start_date: filters.start_date } : {}),
    ...(filters.end_date ? { end_date: filters.end_date } : {}),
    limit: 100,
    offset: 0,
  });

  const { data: topOffenders, isLoading: topLoading } = useTopRepeatOffenders(10);
  const { data: statistics, isLoading: statsLoading } = useRepeatOffenderStatistics();

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

  const handleViewDetails = async (offender: RepeatOffender) => {
    setSelectedOffender(offender);
    setDetailLoading(true);
    setOffenderDetail(null);
    try {
      const res = await import('shared/api').then((m) => m.repeatOffendersApi.getById(offender.offender_id));
      setOffenderDetail(res.data);
    } catch {
      // silent
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: DataTableColumn<RepeatOffender>[] = [
    { key: 'offender_name', header: 'Name', render: (r) => r.offender_name },
    { key: 'total_offences', header: 'Offences', sortable: true, sortValue: (r) => r.total_offences, render: (r) => r.total_offences },
    { key: 'fir_count', header: 'FIRs', render: (r) => r.fir_count },
    {
      key: 'repeat_offender_score',
      header: 'Score',
      sortable: true,
      sortValue: (r) => r.repeat_offender_score,
      render: (r) => r.repeat_offender_score.toFixed(2),
    },
    {
      key: 'districts_involved',
      header: 'Districts',
      render: (r) => r.districts_involved.map((d) => districtName(d)).join(', '),
    },
    {
      key: 'latest_offence',
      header: 'Latest Offence',
      render: (r) => (r.latest_offence ? new Date(r.latest_offence).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleViewDetails(r)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      ),
    },
  ];

  const topColumns: DataTableColumn<RepeatOffender>[] = [
    { key: 'offender_name', header: 'Name', render: (r) => r.offender_name },
    { key: 'total_offences', header: 'Offences', render: (r) => r.total_offences },
    { key: 'fir_count', header: 'FIRs', render: (r) => r.fir_count },
    {
      key: 'repeat_offender_score',
      header: 'Score',
      sortable: true,
      sortValue: (r) => r.repeat_offender_score,
      render: (r) => r.repeat_offender_score.toFixed(2),
    },
    {
      key: 'latest_offence',
      header: 'Latest Offence',
      render: (r) => (r.latest_offence ? new Date(r.latest_offence).toLocaleDateString() : '-'),
    },
  ];

  const clearFilters = () => {
    setFilters({
      district_id: '',
      station_id: '',
      crime_type: '',
      minimum_offences: '',
      start_date: '',
      end_date: '',
    });
  };

  if (offendersError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Repeat Offenders</h1>
          <p className="text-sm text-gov-slate">Cross-case offender linkage and recidivism tracking</p>
        </div>
        <AlertBanner variant="error" title="Failed to load repeat offenders" message="Unable to fetch repeat offender data. Please try again later." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Repeat Offenders</h1>
        <p className="text-sm text-gov-slate">Cross-case offender linkage and recidivism tracking</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <LoadingSkeleton variant="card" />
            </Card>
          ))}
        </div>
      ) : statistics ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Repeat Offenders" value={statistics.total_repeat_offenders} accent="navy" />
          <KpiCard label="Average Offences" value={statistics.average_offences.toFixed(1)} accent="blue" />
          <KpiCard label="Highest Offence Count" value={statistics.highest_offence_count} accent="red" />
          <KpiCard label="District With Most" value={statistics.district_with_most_repeat_offenders || '-'} accent="amber" />
        </div>
      ) : null}

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Offences</label>
            <input
              type="number"
              min={1}
              value={filters.minimum_offences}
              onChange={(e) => setFilters((f) => ({ ...f, minimum_offences: e.target.value }))}
              placeholder="1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Top Repeat Offenders</h2>
          {topLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : topOffenders && topOffenders.length > 0 ? (
            <DataTable
              columns={topColumns}
              data={topOffenders}
              rowKey={(r) => r.offender_id}
              emptyTitle="No top repeat offenders"
              emptyDescription="Top repeat offenders will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No top repeat offenders" description="Top repeat offenders will appear here." />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Repeat Offender Distribution</h2>
          {statsLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : statistics && statistics.repeat_offender_distribution.length > 0 ? (
            <DataTable
              columns={[
                { key: 'district', header: 'District', render: (r) => r.district },
                { key: 'repeat_offender_count', header: 'Count', render: (r) => r.repeat_offender_count },
              ]}
              data={statistics.repeat_offender_distribution}
              rowKey={(r) => r.district}
              emptyTitle="No distribution data"
              emptyDescription="Distribution data will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No distribution data" description="Distribution data will appear here." />
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Repeat Offender List</h2>
        {offendersLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : offenders && offenders.length > 0 ? (
          <DataTable
            columns={columns}
            data={offenders}
            rowKey={(r) => r.offender_id}
            emptyTitle="No repeat offenders found"
            emptyDescription="Try adjusting your filters."
            virtualized={false}
          />
        ) : (
          <EmptyState title="No repeat offenders found" description="Try adjusting your filters." />
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedOffender}
        onClose={() => { setSelectedOffender(null); setOffenderDetail(null); }}
        title={selectedOffender ? `Offender Details — ${selectedOffender.offender_name}` : 'Offender Details'}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setSelectedOffender(null); setOffenderDetail(null); }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        }
      >
        {detailLoading ? (
          <LoadingSkeleton variant="table" rows={3} />
        ) : offenderDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Offender ID</span>
                <p className="text-sm text-gray-900">{offenderDetail.offender_id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Name</span>
                <p className="text-sm text-gray-900">{offenderDetail.offender_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Alias</span>
                <p className="text-sm text-gray-900">{offenderDetail.alias || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Age</span>
                <p className="text-sm text-gray-900">{offenderDetail.age || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Risk Level</span>
                <p className="text-sm text-gray-900">{offenderDetail.risk_level}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Status</span>
                <p className="text-sm text-gray-900">{offenderDetail.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Last Known Location</span>
                <p className="text-sm text-gray-900">{offenderDetail.last_known_location || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Total Offences</span>
                <p className="text-sm text-gray-900">{offenderDetail.total_offences}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">FIR Count</span>
                <p className="text-sm text-gray-900">{offenderDetail.fir_count}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Repeat Offender Score</span>
                <p className="text-sm text-gray-900">{offenderDetail.repeat_offender_score.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Districts Involved</span>
                <p className="text-sm text-gray-900">{offenderDetail.districts_involved.map((d) => districtName(d)).join(', ') || '-'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Police Stations Involved</span>
                <p className="text-sm text-gray-900">{offenderDetail.police_stations_involved.join(', ') || '-'}</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Crime Categories</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {offenderDetail.crime_categories.map((cat) => (
                  <Badge key={cat} variant="secondary">{cat}</Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Offence Timeline</span>
              {offenderDetail.offence_timeline.length > 0 ? (
                <DataTable
                  columns={[
                    { key: 'crime_type', header: 'Type', render: (r) => r.crime_type },
                    { key: 'district_id', header: 'District', render: (r) => districtName(r.district_id) },
                    { key: 'station_id', header: 'Station', render: (r) => r.station_id },
                    { key: 'offence_date', header: 'Date', render: (r) => new Date(r.offence_date).toLocaleDateString() },
                    { key: 'fir_number', header: 'FIR', render: (r) => r.fir_number || '-' },
                  ]}
                  data={offenderDetail.offence_timeline}
                  rowKey={(r) => r.crime_id}
                  virtualized={false}
                />
              ) : (
                <EmptyState title="No timeline data" description="Offence timeline will appear here." />
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="No details found" description="Offender details could not be loaded." />
        )}
      </Modal>
    </div>
  );
};

export default RepeatOffenders;
