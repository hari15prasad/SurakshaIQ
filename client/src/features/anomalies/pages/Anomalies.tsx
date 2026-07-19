import React, { useMemo, useState } from 'react';
import { Card, DataTable, KpiCard, ChartContainer, LoadingSkeleton, EmptyState, AlertBanner, Modal, Badge } from 'shared/components';
import type { DataTableColumn } from 'shared/components';
import { useAnomalies, useAnomalySummary, useDistrictAnomalies, useStationAnomalies } from 'features/anomalies/hooks/useAnomalies';
import type { Anomaly, DistrictAnomaly, StationAnomaly } from 'features/anomalies/hooks/useAnomalies';

const SEVERITY_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'danger',
  CRITICAL: 'danger',
};

const Anomalies: React.FC = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const { data: anomalies, isLoading: anomaliesLoading, error: anomaliesError } = useAnomalies(100);
  const { data: summary, isLoading: summaryLoading } = useAnomalySummary();
  const { data: districtAnomalies, isLoading: districtLoading } = useDistrictAnomalies();
  const { data: stationAnomalies, isLoading: stationLoading } = useStationAnomalies();

  const districtChartData = useMemo(
    () =>
      (districtAnomalies ?? []).map((d) => ({
        district: d.district_name,
        score: d.anomaly_score,
      })),
    [districtAnomalies]
  );

  const stationChartData = useMemo(
    () =>
      (stationAnomalies ?? []).map((s) => ({
        station: s.station_name,
        score: s.anomaly_score,
      })),
    [stationAnomalies]
  );

  const anomalyColumns: DataTableColumn<Anomaly>[] = [
    { key: 'anomaly_type', header: 'Type', render: (r) => r.anomaly_type },
    { key: 'affected_entity_name', header: 'Entity', render: (r) => r.affected_entity_name },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge variant={SEVERITY_VARIANT[r.severity] ?? 'secondary'}>{r.severity}</Badge>,
    },
    {
      key: 'anomaly_score',
      header: 'Score',
      sortable: true,
      sortValue: (r) => r.anomaly_score,
      render: (r) => r.anomaly_score.toFixed(1),
    },
    {
      key: 'detected_at',
      header: 'Detected',
      render: (r) => (r.detected_at ? new Date(r.detected_at).toLocaleDateString() : '-'),
    },
  ];

  const districtColumns: DataTableColumn<DistrictAnomaly>[] = [
    { key: 'district_name', header: 'District', render: (r) => r.district_name },
    { key: 'crime_count', header: 'Crimes', render: (r) => r.crime_count },
    { key: 'fir_count', header: 'FIRs', render: (r) => r.fir_count },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge variant={SEVERITY_VARIANT[r.severity] ?? 'secondary'}>{r.severity}</Badge>,
    },
    {
      key: 'anomaly_score',
      header: 'Score',
      sortable: true,
      sortValue: (r) => r.anomaly_score,
      render: (r) => r.anomaly_score.toFixed(1),
    },
  ];

  const stationColumns: DataTableColumn<StationAnomaly>[] = [
    { key: 'station_name', header: 'Station', render: (r) => r.station_name },
    { key: 'district_name', header: 'District', render: (r) => r.district_name },
    { key: 'crime_count', header: 'Crimes', render: (r) => r.crime_count },
    { key: 'fir_count', header: 'FIRs', render: (r) => r.fir_count },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <Badge variant={SEVERITY_VARIANT[r.severity] ?? 'secondary'}>{r.severity}</Badge>,
    },
    {
      key: 'anomaly_score',
      header: 'Score',
      sortable: true,
      sortValue: (r) => r.anomaly_score,
      render: (r) => r.anomaly_score.toFixed(1),
    },
  ];

  if (anomaliesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Anomaly Detection</h1>
          <p className="text-sm text-gov-slate">Statistical outliers and pattern deviations flagged by the analytics engine</p>
        </div>
        <AlertBanner variant="error" title="Failed to load anomalies" message="Unable to fetch anomaly data. Please try again later." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Anomaly Detection</h1>
        <p className="text-sm text-gov-slate">Statistical outliers and pattern deviations flagged by the analytics engine</p>
      </div>

      {summaryLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <LoadingSkeleton variant="card" />
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Anomalies" value={summary.total_anomalies} accent="navy" />
          <KpiCard label="High Severity" value={summary.high_anomalies} accent="amber" />
          <KpiCard label="Critical Severity" value={summary.critical_anomalies} accent="red" />
          <KpiCard label="Average Score" value={summary.average_anomaly_score.toFixed(1)} accent="blue" />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">District Anomaly Scores</h2>
          {districtLoading ? (
            <LoadingSkeleton variant="card" />
          ) : districtChartData.length > 0 ? (
            <ChartContainer
              title=""
              type="bar"
              data={districtChartData}
              xKey="district"
              series={[{ key: 'score', color: '#ef4444', label: 'Anomaly Score' }]}
              height={300}
            />
          ) : (
            <EmptyState title="No district anomaly data" description="District anomaly scores will appear here." />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Station Anomaly Scores</h2>
          {stationLoading ? (
            <LoadingSkeleton variant="card" />
          ) : stationChartData.length > 0 ? (
            <ChartContainer
              title=""
              type="bar"
              data={stationChartData}
              xKey="station"
              series={[{ key: 'score', color: '#f59e0b', label: 'Anomaly Score' }]}
              height={300}
            />
          ) : (
            <EmptyState title="No station anomaly data" description="Station anomaly scores will appear here." />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">District Anomalies</h2>
          {districtLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : districtAnomalies && districtAnomalies.length > 0 ? (
            <DataTable
              columns={districtColumns}
              data={districtAnomalies}
              rowKey={(r) => r.district_id}
              emptyTitle="No district anomalies"
              emptyDescription="District anomalies will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No district anomalies" description="District anomalies will appear here." />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Station Anomalies</h2>
          {stationLoading ? (
            <LoadingSkeleton variant="table" rows={5} />
          ) : stationAnomalies && stationAnomalies.length > 0 ? (
            <DataTable
              columns={stationColumns}
              data={stationAnomalies}
              rowKey={(r) => r.station_id}
              emptyTitle="No station anomalies"
              emptyDescription="Station anomalies will appear here."
              virtualized={false}
            />
          ) : (
            <EmptyState title="No station anomalies" description="Station anomalies will appear here." />
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">Anomaly List</h2>
        {anomaliesLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : anomalies && anomalies.length > 0 ? (
          <DataTable
            columns={anomalyColumns}
            data={anomalies}
            rowKey={(r) => r.anomaly_id}
            emptyTitle="No anomalies found"
            emptyDescription="Anomalies will appear here when detected."
            virtualized={false}
          />
        ) : (
          <EmptyState title="No anomalies found" description="Anomalies will appear here when detected." />
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        title={selectedAnomaly ? `Anomaly Details — ${selectedAnomaly.anomaly_type}` : 'Anomaly Details'}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedAnomaly(null)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedAnomaly && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Anomaly ID</span>
                <p className="text-sm text-gray-900">{selectedAnomaly.anomaly_id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Type</span>
                <p className="text-sm text-gray-900">{selectedAnomaly.anomaly_type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Severity</span>
                <Badge variant={SEVERITY_VARIANT[selectedAnomaly.severity] ?? 'secondary'}>{selectedAnomaly.severity}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Score</span>
                <p className="text-sm text-gray-900">{selectedAnomaly.anomaly_score.toFixed(1)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Entity</span>
                <p className="text-sm text-gray-900">{selectedAnomaly.affected_entity_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Detected At</span>
                <p className="text-sm text-gray-900">{new Date(selectedAnomaly.detected_at).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Description</span>
              <p className="text-sm text-gray-900">{selectedAnomaly.description}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Contributing Factors</span>
              <div className="mt-2 space-y-2">
                {selectedAnomaly.contributing_factors.map((factor, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{factor.name}</p>
                      <p className="text-xs text-gray-500">Contribution: {factor.contribution.toFixed(2)}</p>
                    </div>
                    <Badge variant="secondary">Weight: {factor.weight.toFixed(1)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Anomalies;
