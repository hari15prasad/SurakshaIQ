import React from 'react';
import { Activity, AlertTriangle, FileText, MapPin, FileCheck, CheckCircle, XCircle, Calendar, Building2 } from 'lucide-react';
import { KpiCard, Card, AlertBanner, ChartContainer, DataTable, LoadingSkeleton, EmptyState } from 'shared/components';
import type { DataTableColumn } from 'shared/components';
import { useDashboardSummary, useCrimeTrends, useRecentCrimes, useRecentFirs, useDistrictSummary } from 'features/dashboard/hooks/useDashboard';
import type { DistrictSummaryResponse } from 'features/dashboard/hooks/useDashboard';

const Dashboard: React.FC = () => {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: trends, isLoading: trendsLoading } = useCrimeTrends('daily');
  const { data: recentCrimes, isLoading: crimesLoading } = useRecentCrimes(10);
  const { data: recentFirs, isLoading: firsLoading } = useRecentFirs(10);
  const { data: districtSummary, isLoading: districtLoading } = useDistrictSummary();

  const isLoading = summaryLoading || trendsLoading || crimesLoading || firsLoading || districtLoading;

  const trendData = (trends ?? []).map((t) => ({
    period: t.period,
    crimes: t.count,
  }));

  const districtColumns: DataTableColumn<DistrictSummaryResponse>[] = [
    { key: 'district_name', header: 'District', render: (r) => r.district_name },
    { key: 'crime_count', header: 'Crimes', render: (r) => r.crime_count },
    { key: 'fir_count', header: 'FIRs', render: (r) => r.fir_count },
    { key: 'active_investigations', header: 'Active Investigations', render: (r) => r.active_investigations },
  ];

  if (summaryError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Command Overview</h1>
          <p className="text-sm text-gov-slate">Welcome back</p>
        </div>
        <AlertBanner variant="error" title="Failed to load dashboard" message="Unable to fetch dashboard metrics. Please try again later." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Command Overview</h1>
        <p className="text-sm text-gov-slate">Real-time operational overview</p>
      </div>

      <AlertBanner
        variant="info"
        title="Live intelligence feed active"
        message="Dashboard metrics reflect aggregated crime data scoped to your jurisdiction."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-5">
              <LoadingSkeleton variant="card" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Crimes" value={summary?.total_crimes ?? 0} icon={<FileText size={24} />} accent="navy" />
          <KpiCard label="Total FIRs" value={summary?.total_firs ?? 0} icon={<FileCheck size={24} />} accent="blue" />
          <KpiCard label="Crimes Today" value={summary?.crimes_today ?? 0} icon={<Calendar size={24} />} accent="green" />
          <KpiCard label="FIRs Today" value={summary?.firs_today ?? 0} icon={<Calendar size={24} />} accent="amber" />
          <KpiCard label="Active FIRs" value={summary?.active_firs ?? 0} icon={<CheckCircle size={24} />} accent="purple" />
          <KpiCard label="Closed FIRs" value={summary?.closed_firs ?? 0} icon={<XCircle size={24} />} accent="purple" />
          <KpiCard label="Districts" value={summary?.registered_districts ?? 0} icon={<MapPin size={24} />} accent="navy" />
          <KpiCard label="Police Stations" value={summary?.registered_police_stations ?? 0} icon={<Building2 size={24} />} accent="blue" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={20} className="text-viz-blue" />
            <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Crime Trends</h2>
          </div>
          {trendsLoading ? (
            <LoadingSkeleton variant="card" />
          ) : trendData.length > 0 ? (
            <ChartContainer
              type="bar"
              data={trendData}
              xKey="period"
              series={[{ key: 'crimes', color: '#3b82f6', label: 'Crimes' }]}
              height={320}
            />
          ) : (
            <EmptyState title="No trend data" description="Crime trends will appear here as data is collected." />
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin size={20} className="text-viz-blue" />
            <h2 className="text-lg font-semibold text-navy-700 dark:text-white">District Summary</h2>
          </div>
          {districtLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : districtSummary && districtSummary.length > 0 ? (
            <DataTable
              columns={districtColumns}
              data={districtSummary}
              rowKey={(r) => r.district_id}
              emptyTitle="No district data"
              emptyDescription="District summary will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No district data" description="District summary will appear here." />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-viz-blue" />
            <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Recent Crimes</h2>
          </div>
          {crimesLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : recentCrimes && recentCrimes.length > 0 ? (
            <DataTable
              columns={[
                { key: 'title', header: 'Title', render: (r) => r.title },
                { key: 'crime_type', header: 'Type', render: (r) => r.crime_type },
                { key: 'status', header: 'Status', render: (r) => r.status },
                { key: 'CREATEDTIME', header: 'Created', render: (r) => new Date(r.CREATEDTIME).toLocaleDateString() },
              ]}
              data={recentCrimes}
              rowKey={(r) => r.ROWID}
              emptyTitle="No recent crimes"
              emptyDescription="Recent crimes will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No recent crimes" description="Recent crimes will appear here." />
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={20} className="text-viz-blue" />
            <h2 className="text-lg font-semibold text-navy-700 dark:text-white">Recent FIRs</h2>
          </div>
          {firsLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : recentFirs && recentFirs.length > 0 ? (
            <DataTable
              columns={[
                { key: 'fir_number', header: 'FIR Number', render: (r) => r.fir_number },
                { key: 'crime_id', header: 'Crime ID', render: (r) => r.crime_id },
                { key: 'status', header: 'Status', render: (r) => r.status },
                { key: 'CREATEDTIME', header: 'Created', render: (r) => new Date(r.CREATEDTIME).toLocaleDateString() },
              ]}
              data={recentFirs}
              rowKey={(r) => r.ROWID}
              emptyTitle="No recent FIRs"
              emptyDescription="Recent FIRs will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No recent FIRs" description="Recent FIRs will appear here." />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
