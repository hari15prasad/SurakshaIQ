import React, { useEffect, useMemo, useState } from 'react';
import { Card, DataTable, KpiCard, LoadingSkeleton, EmptyState, AlertBanner, Badge } from 'shared/components';
import type { DataTableColumn } from 'shared/components';
import { districtsApi } from 'shared/api';
import { useHotspots, useDistrictHotspots, useStationHotspots, useTopHotspots } from 'features/hotspots/hooks/useHotspots';
import type { Hotspot, DistrictHotspot, StationHotspot } from 'features/hotspots/hooks/useHotspots';
import { MapPin, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const;

const SEVERITY_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
};

const TREND_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  rising: 'danger',
  stable: 'warning',
  declining: 'success',
};

const Hotspots: React.FC = () => {
  const [filters, setFilters] = useState({
    district_id: '',
    station_id: '',
    crime_type: '',
    status: '',
    severity: '',
    start_date: '',
    end_date: '',
  });
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(true);

  const { data: hotspots, isLoading: hotspotsLoading, error: hotspotsError } = useHotspots({
    ...(filters.district_id ? { district_id: filters.district_id } : {}),
    ...(filters.station_id ? { station_id: filters.station_id } : {}),
    ...(filters.crime_type ? { crime_type: filters.crime_type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.start_date ? { start_date: filters.start_date } : {}),
    ...(filters.end_date ? { end_date: filters.end_date } : {}),
    limit: 100,
  });

  const { data: districtHotspots, isLoading: districtLoading } = useDistrictHotspots();
  const { data: stationHotspots, isLoading: stationLoading } = useStationHotspots();
  const { data: topHotspots, isLoading: topLoading } = useTopHotspots(10);

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

  const hotspotColumns: DataTableColumn<Hotspot>[] = [
    { key: 'district', header: 'District', render: (r) => districtName(r.district) },
    { key: 'police_station', header: 'Police Station', render: (r) => r.police_station },
    { key: 'crime_count', header: 'Crime Count', render: (r) => r.crime_count },
    { key: 'hotspot_score', header: 'Score', render: (r) => r.hotspot_score.toFixed(2) },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge variant={SEVERITY_BADGE_VARIANT[r.severity] ?? 'secondary'}>{r.severity}</Badge>,
    },
    {
      key: 'latest_crime_date',
      header: 'Latest Crime',
      render: (r) => (r.latest_crime_date ? new Date(r.latest_crime_date).toLocaleDateString() : '-'),
    },
  ];

  const districtColumns: DataTableColumn<DistrictHotspot>[] = [
    { key: 'district_name', header: 'District', render: (r) => r.district_name },
    { key: 'total_crimes', header: 'Total Crimes', render: (r) => r.total_crimes },
    { key: 'hotspot_score', header: 'Hotspot Score', render: (r) => r.hotspot_score.toFixed(2) },
    { key: 'active_firs', header: 'Active FIRs', render: (r) => r.active_firs },
    {
      key: 'trend',
      header: 'Trend',
      render: (r) => <Badge variant={TREND_BADGE_VARIANT[r.trend] ?? 'secondary'}>{r.trend}</Badge>,
    },
  ];

  const stationColumns: DataTableColumn<StationHotspot>[] = [
    { key: 'station_name', header: 'Station', render: (r) => r.station_name },
    { key: 'district_name', header: 'District', render: (r) => r.district_name },
    { key: 'crime_count', header: 'Crime Count', render: (r) => r.crime_count },
    { key: 'hotspot_score', header: 'Hotspot Score', render: (r) => r.hotspot_score.toFixed(2) },
    { key: 'active_firs', header: 'Active FIRs', render: (r) => r.active_firs },
  ];

  const topColumns: DataTableColumn<Hotspot>[] = [
    { key: 'district', header: 'District', render: (r) => districtName(r.district) },
    { key: 'police_station', header: 'Police Station', render: (r) => r.police_station },
    { key: 'crime_count', header: 'Crime Count', render: (r) => r.crime_count },
    { key: 'hotspot_score', header: 'Score', render: (r) => r.hotspot_score.toFixed(2) },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge variant={SEVERITY_BADGE_VARIANT[r.severity] ?? 'secondary'}>{r.severity}</Badge>,
    },
  ];

  const clearFilters = () => {
    setFilters({
      district_id: '',
      station_id: '',
      crime_type: '',
      status: '',
      severity: '',
      start_date: '',
      end_date: '',
    });
  };

  const totalHotspots = hotspots?.length ?? 0;
  const highestScore = hotspots?.[0]?.hotspot_score ?? 0;
  const highestDistrict = districtHotspots?.[0]?.district_name ?? '-';
  const highestStation = stationHotspots?.[0]?.station_name ?? '-';

  if (hotspotsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Crime Hotspots</h1>
          <p className="text-sm text-gov-slate">Spatial and temporal hotspot analysis across Karnataka</p>
        </div>
        <AlertBanner variant="error" title="Failed to load hotspots" message="Unable to fetch hotspot data. Please try again later." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Crime Hotspots</h1>
        <p className="text-sm text-gov-slate">Spatial and temporal hotspot analysis across Karnataka</p>
      </div>

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
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Hotspots" value={totalHotspots} icon={<Activity size={24} />} accent="navy" />
        <KpiCard label="Highest Score" value={highestScore.toFixed(1)} icon={<TrendingUp size={24} />} accent="red" />
        <KpiCard label="Highest Risk District" value={highestDistrict} icon={<MapPin size={24} />} accent="amber" />
        <KpiCard label="Highest Risk Station" value={highestStation} icon={<AlertTriangle size={24} />} accent="purple" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">District Hotspots</h2>
          {districtLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : districtHotspots && districtHotspots.length > 0 ? (
            <DataTable
              columns={districtColumns}
              data={districtHotspots}
              rowKey={(r) => r.district_id}
              emptyTitle="No district hotspots"
              emptyDescription="District hotspot data will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No district hotspots" description="District hotspot data will appear here." />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Station Hotspots</h2>
          {stationLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : stationHotspots && stationHotspots.length > 0 ? (
            <DataTable
              columns={stationColumns}
              data={stationHotspots}
              rowKey={(r) => r.station_id}
              emptyTitle="No station hotspots"
              emptyDescription="Station hotspot data will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No station hotspots" description="Station hotspot data will appear here." />
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Top Hotspots</h2>
        {topLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : topHotspots && topHotspots.length > 0 ? (
          <DataTable
            columns={topColumns}
            data={topHotspots}
            rowKey={(r) => r.id}
            emptyTitle="No top hotspots"
            emptyDescription="Top hotspots will appear here."
            virtualized={false}
          />
        ) : (
          <EmptyState title="No top hotspots" description="Top hotspots will appear here." />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Filtered Hotspots</h2>
        {hotspotsLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : hotspots && hotspots.length > 0 ? (
          <DataTable
            columns={hotspotColumns}
            data={hotspots}
            rowKey={(r) => r.id}
            emptyTitle="No hotspots found"
            emptyDescription="Try adjusting your filters."
            virtualized={false}
          />
        ) : (
          <EmptyState title="No hotspots found" description="Try adjusting your filters." />
        )}
      </Card>
    </div>
  );
};

export default Hotspots;
