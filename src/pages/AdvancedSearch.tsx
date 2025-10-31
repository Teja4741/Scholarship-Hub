import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navigation from '../components/Navigation';

interface Scholarship {
  id: number;
  name: string;
  description: string;
  amount: number;
  deadline: string;
  location: string;
  provider: string;
  eligibility: any;
  benefits: any;
  documentsRequired: any;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
}

interface SearchFilters {
  query?: string;
  location?: string;
  minAmount?: number;
  maxAmount?: number;
  deadlineFrom?: string;
  deadlineTo?: string;
  category?: string;
  provider?: string;
  eligibility?: any;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    minAmount: undefined,
    maxAmount: undefined,
    deadlineFrom: '',
    deadlineTo: '',
    category: '',
    provider: '',
    eligibility: undefined
  });

  const [sortBy, setSortBy] = useState('deadline');
  const [sortOrder, setSortOrder] = useState('ASC');

  const categories = [
    'General', 'SC/ST', 'OBC', 'Minority', 'Merit-based', 'Need-based',
    'Sports', 'Arts', 'Research', 'International', 'Women', 'Disability'
  ];

  const providers = [
    'Government of India', 'State Government', 'Private Trusts',
    'Educational Institutions', 'Corporate Foundations', 'NGOs'
  ];

  const performSearch = async (page = 1) => {
    setLoading(true);
    try {
      const searchData = {
        ...filters,
        sortBy,
        sortOrder,
        page,
        limit: 10
      };

      const response = await api.advancedSearch(searchData);
      setScholarships(response.scholarships);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await api.getSearchSuggestions(query);
      setSuggestions(response.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
  };

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSuggestionClick = (suggestion: any) => {
    setFilters(prev => ({ ...prev, query: suggestion.suggestion }));
    setShowSuggestions(false);
    performSearch();
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      minAmount: undefined,
      maxAmount: undefined,
      deadlineFrom: '',
      deadlineTo: '',
      category: '',
      provider: '',
      eligibility: undefined
    });
    performSearch();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  useEffect(() => {
    performSearch();
  }, [sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Advanced Search</h1>
          <p className="text-gray-600">Find scholarships that match your specific criteria</p>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Query */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Keywords
              </label>
              <input
                type="text"
                value={filters.query}
                onChange={(e) => {
                  handleFilterChange('query', e.target.value);
                  getSuggestions(e.target.value);
                }}
                placeholder="Scholarship name, provider, or keywords..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{suggestion.suggestion}</span>
                      <span className="text-gray-500 ml-2">({suggestion.type})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="City, State, or Country"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Range (₹)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={filters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Deadline Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.deadlineFrom}
                  onChange={(e) => handleFilterChange('deadlineFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.deadlineTo}
                  onChange={(e) => handleFilterChange('deadlineTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <select
                value={filters.provider}
                onChange={(e) => handleFilterChange('provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Providers</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => performSearch()}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="deadline">Deadline</option>
              <option value="amount">Amount</option>
              <option value="name">Name</option>
              <option value="createdAt">Date Added</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
            {pagination && (
              <span className="text-sm text-gray-600 ml-auto">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
              </span>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Searching scholarships...</p>
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No scholarships found matching your criteria.</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            scholarships.map((scholarship) => (
              <div key={scholarship.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {scholarship.name}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {scholarship.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📍 {scholarship.location}</span>
                      <span>🏢 {scholarship.provider}</span>
                      <span>📊 {scholarship.applicationCount} applications</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {formatCurrency(scholarship.amount)}
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      Deadline: {formatDate(scholarship.deadline)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {scholarship.eligibility?.category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {scholarship.eligibility.category}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      {scholarship.type}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/scholarship/${scholarship.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => performSearch(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.currentPage - 2)) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => performSearch(pageNum)}
                    className={`px-3 py-2 border rounded-md ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => performSearch(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
