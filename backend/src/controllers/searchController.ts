import { Request, Response } from 'express';
import pool from '../database';
import { AuthRequest } from '../middleware/auth';

// Advanced search for scholarships with multiple filters, pagination, and sorting
export const advancedSearch = async (req: AuthRequest, res: Response) => {
  try {
    const {
      query,
      location,
      minAmount,
      maxAmount,
      deadlineFrom,
      deadlineTo,
      category,
      provider,
      eligibility,
      sortBy = 'deadline',
      sortOrder = 'ASC',
      page = 1,
      limit = 10
    } = req.body;

    const whereConditions: string[] = [];
    const params: any[] = [];

    if (query) {
      whereConditions.push('(s.name LIKE ? OR s.description LIKE ?)');
      params.push(`%${query}%`, `%${query}%`);
    }

    if (location) {
      whereConditions.push('s.location LIKE ?');
      params.push(`%${location}%`);
    }

    if (minAmount !== undefined) {
      whereConditions.push('s.amount >= ?');
      params.push(minAmount);
    }

    if (maxAmount !== undefined) {
      whereConditions.push('s.amount <= ?');
      params.push(maxAmount);
    }

    if (deadlineFrom) {
      whereConditions.push('s.deadline >= ?');
      params.push(deadlineFrom);
    }

    if (deadlineTo) {
      whereConditions.push('s.deadline <= ?');
      params.push(deadlineTo);
    }

    if (category) {
      whereConditions.push('JSON_CONTAINS(s.eligibility, JSON_OBJECT("category", ?))');
      params.push(category);
    }

    if (provider) {
      whereConditions.push('s.provider LIKE ?');
      params.push(`%${provider}%`);
    }

    if (eligibility) {
      whereConditions.push('JSON_CONTAINS(s.eligibility, ?)');
      params.push(JSON.stringify(eligibility));
    }

    // Only active scholarships
    whereConditions.push('s.isActive = ?');
    params.push(true);

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Sorting validation
    const validSortFields = ['name', 'amount', 'deadline', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'deadline';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // Pagination calculations and validation
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    if (
      !Number.isInteger(pageNum) || pageNum < 1 ||
      !Number.isInteger(limitNum) || limitNum < 1 ||
      !Number.isInteger(offset) || offset < 0
    ) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // IMPORTANT: LIMIT and OFFSET passed as literals in query string (after validation)
    const searchQuery = `
      SELECT s.*,
             COUNT(a.id) AS applicationCount
      FROM scholarships s
      LEFT JOIN applications a ON s.id = a.scholarshipId
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.${sortField} ${sortDirection}
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const [rows] = await pool.execute(searchQuery, params);

    // Total count for pagination (do not pass limit and offset here)
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM scholarships s
      LEFT JOIN applications a ON s.id = a.scholarshipId
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, params);
    const total = (countResult as any[])[0].total;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      scholarships: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum
      },
      filters: {
        query, location, minAmount, maxAmount, deadlineFrom, deadlineTo, category, provider, eligibility
      }
    });
  } catch (error) {
    console.error('Error performing advanced search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search suggestions for scholarships, providers, and locations
export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.json({ suggestions: [] });
    }

    const [nameSuggestions] = await pool.execute(`
      SELECT DISTINCT name as suggestion, 'scholarship' as type
      FROM scholarships
      WHERE name LIKE ? AND isActive = true
      LIMIT 5
    `, [`${query}%`]);

    const [providerSuggestions] = await pool.execute(`
      SELECT DISTINCT provider as suggestion, 'provider' as type
      FROM scholarships
      WHERE provider LIKE ? AND isActive = true
      LIMIT 3
    `, [`${query}%`]);

    const [locationSuggestions] = await pool.execute(`
      SELECT DISTINCT location as suggestion, 'location' as type
      FROM scholarships
      WHERE location LIKE ? AND isActive = true
      LIMIT 3
    `, [`${query}%`]);

    const suggestions = [
      ...(nameSuggestions as any[]),
      ...(providerSuggestions as any[]),
      ...(locationSuggestions as any[])
    ].slice(0, 10);

    res.json({ suggestions });
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Popular search terms (static example)
export const getPopularSearches = async (_req: Request, res: Response) => {
  try {
    const popularSearches = [
      { term: 'engineering', count: 150 },
      { term: 'medical', count: 120 },
      { term: 'business', count: 100 },
      { term: 'arts', count: 80 },
      { term: 'science', count: 75 }
    ];
    res.json({ popularSearches });
  } catch (error) {
    console.error('Error getting popular searches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
