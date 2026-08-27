import fs from 'fs';
import path from 'path';

// Embedded JSON database storage path
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'agrovision_db.json');

// Interface for DB collections
export interface DatabaseSchema {
  users: any[];
  cropRecommendations: any[];
  diseaseDetections: any[];
  soilReports: any[];
  marketPrices: any[];
  profitCalculations: any[];
  governmentSchemes: any[];
  communityPosts: any[];
  comments: any[];
  chatMessages: any[];
  notifications: any[];
}

const defaultSchema: DatabaseSchema = {
  users: [],
  cropRecommendations: [],
  diseaseDetections: [],
  soilReports: [],
  marketPrices: [],
  profitCalculations: [],
  governmentSchemes: [],
  communityPosts: [],
  comments: [],
  chatMessages: [],
  notifications: []
};

class LocalDB {
  private data: DatabaseSchema = { ...defaultSchema };
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = { ...defaultSchema, ...JSON.parse(raw) };
      } else {
        this.data = { ...defaultSchema };
        this.save();
      }
      this.initialized = true;
    } catch (err) {
      console.error('Error initializing database file, using memory storage:', err);
      this.data = { ...defaultSchema };
      this.initialized = true;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  public collection<T = any>(name: keyof DatabaseSchema) {
    if (!this.data[name]) {
      this.data[name] = [];
    }

    const self = this;
    const items = this.data[name] as T[];

    return {
      find: (query?: Partial<T> | ((item: T) => boolean)): T[] => {
        if (!query) return [...items];
        if (typeof query === 'function') {
          return items.filter(query);
        }
        return items.filter(item => {
          return Object.entries(query).every(([k, v]) => (item as any)[k] === v);
        });
      },

      findOne: (query: Partial<T> | ((item: T) => boolean)): T | null => {
        if (typeof query === 'function') {
          return items.find(query) || null;
        }
        return items.find(item => {
          return Object.entries(query).every(([k, v]) => (item as any)[k] === v);
        }) || null;
      },

      findById: (id: string): T | null => {
        return items.find((item: any) => item._id === id || item.id === id) || null;
      },

      insertOne: (doc: any): T => {
        const _id = doc._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const newDoc = {
          _id,
          createdAt: doc.createdAt || now,
          updatedAt: now,
          ...doc
        };
        items.unshift(newDoc as T);
        self.save();
        return newDoc as T;
      },

      insertMany: (docs: any[]): T[] => {
        const inserted: T[] = [];
        docs.forEach(doc => {
          const _id = doc._id || 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
          const now = new Date().toISOString();
          const newDoc = {
            _id,
            createdAt: doc.createdAt || now,
            updatedAt: now,
            ...doc
          };
          items.push(newDoc as T);
          inserted.push(newDoc as T);
        });
        self.save();
        return inserted;
      },

      updateOne: (query: Partial<T> | string, update: Partial<T>): T | null => {
        let index = -1;
        if (typeof query === 'string') {
          index = items.findIndex((item: any) => item._id === query || item.id === query);
        } else {
          index = items.findIndex(item => {
            return Object.entries(query).every(([k, v]) => (item as any)[k] === v);
          });
        }

        if (index !== -1) {
          items[index] = {
            ...items[index],
            ...update,
            updatedAt: new Date().toISOString()
          };
          self.save();
          return items[index];
        }
        return null;
      },

      deleteOne: (query: Partial<T> | string): boolean => {
        let index = -1;
        if (typeof query === 'string') {
          index = items.findIndex((item: any) => item._id === query || item.id === query);
        } else {
          index = items.findIndex(item => {
            return Object.entries(query).every(([k, v]) => (item as any)[k] === v);
          });
        }

        if (index !== -1) {
          items.splice(index, 1);
          self.save();
          return true;
        }
        return false;
      },

      count: (query?: Partial<T> | ((item: T) => boolean)): number => {
        if (!query) return items.length;
        if (typeof query === 'function') {
          return items.filter(query).length;
        }
        return items.filter(item => {
          return Object.entries(query).every(([k, v]) => (item as any)[k] === v);
        }).length;
      }
    };
  }
}

export const db = new LocalDB();
