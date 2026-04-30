import { useState, useMemo, useCallback } from 'react';

const useProductFilter = () => {
  const [filters, setFilters] = useState({
    keyword: '', category: '', minPrice: '', maxPrice: '',
    sort: '-createdAt', page: 1, limit: 12, ratings: '',
  });

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1, limit: 12, ratings: '' });
  }, []);

  const queryParams = useMemo(() => {
    const params = {};
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params['price[gte]'] = filters.minPrice;
    if (filters.maxPrice) params['price[lte]'] = filters.maxPrice;
    if (filters.ratings) params['ratings[gte]'] = filters.ratings;
    params.sort = filters.sort;
    params.page = filters.page;
    params.limit = filters.limit;
    return params;
  }, [filters]);

  return { filters, setFilter, setPage, resetFilters, queryParams };
};

export default useProductFilter;
