import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, DataTable, LoadingSkeleton, EmptyState, AlertBanner, Modal, Badge, Button } from 'shared/components';
import type { DataTableColumn } from 'shared/components';
import { useSearch, useSearchSuggestions, useSearchFilters } from 'features/search/hooks/useSearch';
import type { SearchResult, SearchSuggestion } from 'features/search/hooks/useSearch';

const CATEGORY_LABEL: Record<string, string> = {
  Crime: 'Crimes',
  FIR: 'FIRs',
  Hotspot: 'Hotspots',
  RepeatOffender: 'Repeat Offenders',
  Network: 'Network Entities',
  PredictiveRisk: 'Predictive Risk',
  Anomaly: 'Anomalies',
  Alert: 'Alerts',
  Report: 'Reports',
};

const CATEGORY_VARIANT: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'> = {
  Crime: 'danger',
  FIR: 'warning',
  Hotspot: 'success',
  RepeatOffender: 'secondary',
  Network: 'info',
  PredictiveRisk: 'primary',
  Anomaly: 'danger',
  Alert: 'warning',
  Report: 'success',
};

const CATEGORY_ROUTE: Record<string, string> = {
  Crime: '/crimes',
  FIR: '/firs',
  Hotspot: '/hotspots',
  RepeatOffender: '/repeat-offenders',
  Network: '/network-analysis',
  PredictiveRisk: '/risk-scoring',
  Anomaly: '/anomalies',
  Alert: '/alerts',
  Report: '/reports',
};

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [station, setStation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const { data: results, isLoading: resultsLoading, error: resultsError } = useSearch({
    keyword: debouncedKeyword,
    ...(category ? { category } : {}),
    ...(district ? { district } : {}),
    ...(station ? { station } : {}),
    limit: 50,
    offset: 0,
  });

  const { data: suggestions } = useSearchSuggestions(debouncedKeyword);
  const { data: filters } = useSearchFilters();

  const districts = useMemo(() => filters?.districts ?? [], [filters?.districts]);
  const stations = useMemo(() => filters?.stations ?? [], [filters?.stations]);
  const categories = useMemo(() => filters?.categories ?? [], [filters?.categories]);

  const filteredStations = useMemo(() => {
    if (!district) return stations;
    return stations.filter((s) => s.district_id === district);
  }, [district, stations]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    setKeyword(suggestion.keyword);
    setDebouncedKeyword(suggestion.keyword);
    setShowSuggestions(false);
  }, []);

  const handleSelectResult = useCallback((result: SearchResult) => {
    const route = CATEGORY_ROUTE[result.category];
    if (route) {
      navigate(route);
    } else {
      setSelectedResult(result);
    }
  }, [navigate]);

  const columns: DataTableColumn<SearchResult>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleSelectResult(r)}
          className="text-left text-blue-600 hover:underline"
        >
          {r.title}
        </button>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (r) => <Badge variant={CATEGORY_VARIANT[r.category] ?? 'secondary'}>{CATEGORY_LABEL[r.category] ?? r.category}</Badge>,
    },
    {
      key: 'subtitle',
      header: 'Subtitle',
      render: (r) => r.subtitle,
    },
    {
      key: 'description',
      header: 'Description',
      render: (r) => (
        <span className="line-clamp-1 max-w-xs" title={r.description}>
          {r.description}
        </span>
      ),
    },
    {
      key: 'relevance_score',
      header: 'Relevance',
      render: (r) => `${Math.round(r.relevance_score)}%`,
    },
    {
      key: 'created_at',
      header: 'Created At',
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'),
    },
  ];

  if (resultsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Global Search</h1>
          <p className="text-sm text-gov-slate">Search across crimes, FIRs, hotspots, and more</p>
        </div>
        <AlertBanner variant="error" title="Search failed" message="Unable to perform search. Please try again later." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Global Search</h1>
        <p className="text-sm text-gov-slate">Search across crimes, FIRs, hotspots, repeat offenders, network entities, predictive risk, anomalies, alerts, and reports</p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">Keyword</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Search across all modules..."
            />
            {showSuggestions && suggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {suggestions.slice(0, 10).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(s)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span>{s.keyword}</span>
                    <Badge variant="secondary">{CATEGORY_LABEL[s.category] ?? s.category}</Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
            <select
              value={district}
              onChange={(e) => {
                setDistrict(e.target.value);
                setStation('');
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Station</label>
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Stations</option>
              {filteredStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {resultsLoading ? (
        <Card className="p-6">
          <LoadingSkeleton variant="table" rows={5} />
        </Card>
      ) : results && results.results.length > 0 ? (
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-navy-700 dark:text-white">
            Search Results ({results.total_results})
          </h2>
          <DataTable
            columns={columns}
            data={results.results}
            rowKey={(r) => r.id}
            emptyTitle="No results found"
            emptyDescription="Try adjusting your search criteria."
            virtualized={false}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <EmptyState title="No results found" description="Try adjusting your search criteria." />
        </Card>
      )}

      {/* Result Details Modal */}
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title={selectedResult ? `Result Details — ${selectedResult.title}` : 'Result Details'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedResult(null)}>
              Close
            </Button>
            {selectedResult && CATEGORY_ROUTE[selectedResult.category] && (
              <Button variant="primary" onClick={() => handleSelectResult(selectedResult)}>
                Open in {CATEGORY_LABEL[selectedResult.category] ?? selectedResult.category}
              </Button>
            )}
          </div>
        }
      >
        {selectedResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Title</span>
                <p className="text-sm text-gray-900">{selectedResult.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Category</span>
                <Badge variant={CATEGORY_VARIANT[selectedResult.category] ?? 'secondary'}>
                  {CATEGORY_LABEL[selectedResult.category] ?? selectedResult.category}
                </Badge>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-gray-700">Description</span>
                <p className="text-sm text-gray-900">{selectedResult.description}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Relevance Score</span>
                <p className="text-sm text-gray-900">{Math.round(selectedResult.relevance_score)}%</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Created At</span>
                <p className="text-sm text-gray-900">{new Date(selectedResult.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Search;
