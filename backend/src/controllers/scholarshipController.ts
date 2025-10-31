import { Request, Response } from 'express';
import pool from '../database';
import { Scholarship } from '../types';

export const getAllScholarships = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM scholarships');
    const scholarships: Scholarship[] = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      description: row.description,
      amount: row.amount,
      eligibility: {
        minimumMarks: row.minimum_marks,
        maximumIncome: row.maximum_income,
        ageLimit: row.age_limit,
        courseYear: row.course_year
      },
      benefits: (() => {
        try {
          return JSON.parse(row.benefits);
        } catch {
          return [row.benefits];
        }
      })(),
      deadline: row.deadline,
      documentsRequired: (() => {
        try {
          return JSON.parse(row.documents_required);
        } catch {
          return [row.documents_required];
        }
      })(),
      icon: row.icon
    }));
    res.json(scholarships);
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getScholarshipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM scholarships WHERE id = ?', [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: 'Scholarship not found' });
    }
    const row = (rows as any[])[0];
    const scholarship: Scholarship = {
      id: row.id,
      name: row.name,
      type: row.type,
      description: row.description,
      amount: row.amount,
      eligibility: {
        minimumMarks: row.minimum_marks,
        maximumIncome: row.maximum_income,
        ageLimit: row.age_limit,
        courseYear: row.course_year
      },
      benefits: (() => {
        try {
          return JSON.parse(row.benefits);
        } catch {
          return [row.benefits];
        }
      })(),
      deadline: row.deadline,
      documentsRequired: (() => {
        try {
          return JSON.parse(row.documents_required);
        } catch {
          return [row.documents_required];
        }
      })(),
      icon: row.icon
    };
    res.json(scholarship);
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createScholarship = async (req: Request, res: Response) => {
  try {
    const { name, type, description, amount, eligibility, benefits, deadline, documentsRequired, icon } = req.body;
    const id = Date.now().toString();
    await pool.execute(
      'INSERT INTO scholarships (id, name, type, description, amount, minimum_marks, maximum_income, age_limit, course_year, benefits, deadline, documents_required, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, description, amount, eligibility.minimumMarks, eligibility.maximumIncome, eligibility.ageLimit, eligibility.courseYear, JSON.stringify(benefits), deadline, JSON.stringify(documentsRequired), icon]
    );
    res.status(201).json({ id, message: 'Scholarship created successfully' });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateScholarship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, description, amount, eligibility, benefits, deadline, documentsRequired, icon } = req.body;
    await pool.execute(
      'UPDATE scholarships SET name = ?, type = ?, description = ?, amount = ?, minimum_marks = ?, maximum_income = ?, age_limit = ?, course_year = ?, benefits = ?, deadline = ?, documents_required = ?, icon = ? WHERE id = ?',
      [name, type, description, amount, eligibility.minimumMarks, eligibility.maximumIncome, eligibility.ageLimit, eligibility.courseYear, JSON.stringify(benefits), deadline, JSON.stringify(documentsRequired), icon, id]
    );
    res.json({ message: 'Scholarship updated successfully' });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteScholarship = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM scholarships WHERE id = ?', [id]);
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
