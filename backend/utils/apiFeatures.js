/**
 * API Features — filtering, sorting, field limiting, pagination, and search
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalCount = 0;
  }

  /**
   * Filter by query parameters
   * Supports MongoDB operators: gte, gt, lte, lt, in
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'keyword'];
    excludedFields.forEach((el) => delete queryObj[el]);

    
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

    const parsed = JSON.parse(queryStr);

    
    Object.keys(parsed).forEach((key) => {
      if (parsed[key]?.$in && typeof parsed[key].$in === 'string') {
        parsed[key].$in = parsed[key].$in.split(',');
      }
    });

    this.query = this.query.find(parsed);
    return this;
  }

  /**
   * Search by keyword in text-indexed fields
   */
  search() {
    const keyword = this.queryString.keyword || this.queryString.search;
    if (keyword) {
      this.query = this.query.find({
        $text: { $search: keyword },
      });
    }
    return this;
  }

  /**
   * Sort results
   * Default: newest first
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Select specific fields
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Paginate results
   */
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(this.queryString.limit, 10) || 12));
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;

    return this;
  }

  /**
   * Count total matching documents (for pagination metadata)
   */
  async countTotal() {
    const countQuery = this.query.model.find(this.query.getFilter());
    this.totalCount = await countQuery.countDocuments();
    return this;
  }

  /**
   * Get pagination info
   */
  getPaginationInfo() {
    const totalPages = Math.ceil(this.totalCount / this.limit);
    return {
      currentPage: this.page,
      totalPages,
      totalResults: this.totalCount,
      resultsPerPage: this.limit,
      hasNextPage: this.page < totalPages,
      hasPrevPage: this.page > 1,
    };
  }
}

export default APIFeatures;
