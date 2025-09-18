const express = require('express');
const cors = require('cors');
const { put, del, list } = require('@vercel/blob');
const { kv } = require('@vercel/kv');
const { sql } = require('@vercel/postgres');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Database configuration
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'kv'; // 'kv', 'postgres', or 'blob'

// In-memory storage for demo (fallback)
let movies = [];
let banner = {
  title: 'Welcome to 5 TR Moviez',
  subtitle: 'Download your favorite movies in HD quality',
  backgroundImage: 'https://images.unsplash.com/photo-1489599909698-6c8e8c0b8d8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
};
let stats = { totalDownloads: 0, totalViews: 0 };

// Database functions for Vercel KV
const saveMoviesKV = async (moviesData) => {
  try {
    await kv.set('movies', JSON.stringify(moviesData));
    return true;
  } catch (error) {
    console.error('Error saving movies to KV:', error);
    return false;
  }
};

const loadMoviesKV = async () => {
  try {
    const moviesData = await kv.get('movies');
    return moviesData ? JSON.parse(moviesData) : [];
  } catch (error) {
    console.error('Error loading movies from KV:', error);
    return [];
  }
};

const saveBannerKV = async (bannerData) => {
  try {
    await kv.set('banner', JSON.stringify(bannerData));
    return true;
  } catch (error) {
    console.error('Error saving banner to KV:', error);
    return false;
  }
};

const loadBannerKV = async () => {
  try {
    const bannerData = await kv.get('banner');
    return bannerData ? JSON.parse(bannerData) : {
      title: 'Welcome to 5 TR Moviez',
      subtitle: 'Download your favorite movies in HD quality',
      backgroundImage: 'https://images.unsplash.com/photo-1489599909698-6c8e8c0b8d8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    };
  } catch (error) {
    console.error('Error loading banner from KV:', error);
    return {
      title: 'Welcome to 5 TR Moviez',
      subtitle: 'Download your favorite movies in HD quality',
      backgroundImage: 'https://images.unsplash.com/photo-1489599909698-6c8e8c0b8d8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    };
  }
};

const saveStatsKV = async (statsData) => {
  try {
    await kv.set('stats', JSON.stringify(statsData));
    return true;
  } catch (error) {
    console.error('Error saving stats to KV:', error);
    return false;
  }
};

const loadStatsKV = async () => {
  try {
    const statsData = await kv.get('stats');
    return statsData ? JSON.parse(statsData) : { totalDownloads: 0, totalViews: 0 };
  } catch (error) {
    console.error('Error loading stats from KV:', error);
    return { totalDownloads: 0, totalViews: 0 };
  }
};

// Database functions for PostgreSQL
const initPostgresTables = async () => {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50),
        genre VARCHAR(255),
        year INTEGER,
        rating DECIMAL(3,1),
        description TEXT,
        poster TEXT,
        download_links JSONB,
        views INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS banner (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        subtitle TEXT,
        background_image TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS stats (
        id SERIAL PRIMARY KEY,
        total_downloads INTEGER DEFAULT 0,
        total_views INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('PostgreSQL tables initialized successfully');
  } catch (error) {
    console.error('Error initializing PostgreSQL tables:', error);
  }
};

const saveMoviesPostgres = async (moviesData) => {
  try {
    // Clear existing movies
    await sql`DELETE FROM movies`;
    
    // Insert new movies
    for (const movie of moviesData) {
      await sql`
        INSERT INTO movies (title, category, genre, year, rating, description, poster, download_links, views, downloads)
        VALUES (${movie.title}, ${movie.category}, ${movie.genre}, ${movie.year}, ${movie.rating}, ${movie.description}, ${movie.poster}, ${JSON.stringify(movie.downloadLinks)}, ${movie.views || 0}, ${movie.downloads || 0})
      `;
    }
    return true;
  } catch (error) {
    console.error('Error saving movies to PostgreSQL:', error);
    return false;
  }
};

const loadMoviesPostgres = async () => {
  try {
    const result = await sql`SELECT * FROM movies ORDER BY created_at DESC`;
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      genre: row.genre,
      year: row.year,
      rating: row.rating,
      description: row.description,
      poster: row.poster,
      downloadLinks: row.download_links || [],
      views: row.views || 0,
      downloads: row.downloads || 0
    }));
  } catch (error) {
    console.error('Error loading movies from PostgreSQL:', error);
    return [];
  }
};

// Universal database functions
const saveMovies = async (moviesData) => {
  if (DATABASE_TYPE === 'postgres') {
    return await saveMoviesPostgres(moviesData);
  } else if (DATABASE_TYPE === 'kv') {
    return await saveMoviesKV(moviesData);
  } else {
    // Fallback to in-memory
    movies = moviesData;
    return true;
  }
};

const loadMovies = async () => {
  if (DATABASE_TYPE === 'postgres') {
    return await loadMoviesPostgres();
  } else if (DATABASE_TYPE === 'kv') {
    return await loadMoviesKV();
  } else {
    // Fallback to in-memory
    return movies;
  }
};

const saveBanner = async (bannerData) => {
  if (DATABASE_TYPE === 'kv') {
    return await saveBannerKV(bannerData);
  } else {
    // Fallback to in-memory
    banner = bannerData;
    return true;
  }
};

const loadBanner = async () => {
  if (DATABASE_TYPE === 'kv') {
    return await loadBannerKV();
  } else {
    // Fallback to in-memory
    return banner;
  }
};

const saveStats = async (statsData) => {
  if (DATABASE_TYPE === 'kv') {
    return await saveStatsKV(statsData);
  } else {
    // Fallback to in-memory
    stats = statsData;
    return true;
  }
};

const loadStats = async () => {
  if (DATABASE_TYPE === 'kv') {
    return await loadStatsKV();
  } else {
    // Fallback to in-memory
    return stats;
  }
};

// Initialize sample data
const initSampleData = async () => {
  try {
    const existingMovies = await loadMovies();
    if (existingMovies.length === 0) {
      const sampleMovies = [
        {
          id: 1,
          title: 'Vikram',
          category: 'tamil',
          genre: 'Action, Thriller',
          year: 2022,
          rating: 8.5,
          description: 'A special agent investigates a murder case involving drug cartels.',
          poster: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          downloadLinks: [
            { quality: 'HD', size: '1.2 GB', url: 'https://example.com/download1' },
            { quality: '1080p', size: '2.5 GB', url: 'https://example.com/download2' }
          ],
          views: 1500,
          downloads: 320
        },
        {
          id: 2,
          title: 'RRR',
          category: 'telugu',
          genre: 'Action, Drama',
          year: 2022,
          rating: 8.2,
          description: 'A fictional story about two legendary revolutionaries and their journey away from home.',
          poster: 'https://images.unsplash.com/photo-1489599909698-6c8e8c0b8d8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          downloadLinks: [
            { quality: 'HD', size: '1.5 GB', url: 'https://example.com/download3' },
            { quality: '4K', size: '4.2 GB', url: 'https://example.com/download4' }
          ],
          views: 2200,
          downloads: 450
        },
        {
          id: 3,
          title: 'KGF Chapter 2',
          category: 'kannada',
          genre: 'Action, Crime',
          year: 2022,
          rating: 8.8,
          description: 'Rocky takes control of the Kolar Gold Fields and his newfound power.',
          poster: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          downloadLinks: [
            { quality: 'HD', size: '1.8 GB', url: 'https://example.com/download5' },
            { quality: '1080p', size: '3.1 GB', url: 'https://example.com/download6' }
          ],
          views: 3000,
          downloads: 680
        },
        {
          id: 4,
          title: 'Avatar: The Way of Water',
          category: 'english',
          genre: 'Sci-Fi, Adventure',
          year: 2022,
          rating: 7.9,
          description: 'Jake Sully and his family explore the regions of Pandora.',
          poster: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
          downloadLinks: [
            { quality: 'HD', size: '2.1 GB', url: 'https://example.com/download7' },
            { quality: '4K', size: '5.5 GB', url: 'https://example.com/download8' }
          ],
          views: 1800,
          downloads: 290
        }
      ];
      
      await saveMovies(sampleMovies);
      console.log('Sample movies initialized');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Initialize database and sample data
const initializeDatabase = async () => {
  try {
    if (DATABASE_TYPE === 'postgres') {
      await initPostgresTables();
    }
    await initSampleData();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize on startup
initializeDatabase();

// API Endpoints
// Movies
app.get('/api/movies', async (req, res) => {
  try {
    const movies = await loadMovies();
    res.json(movies);
  } catch (error) {
    console.error('Error in /api/movies:', error);
    res.status(500).send('Error reading movies data');
  }
});

app.post('/api/movies', async (req, res) => {
  try {
    const movies = req.body;
    const success = await saveMovies(movies);
    if (success) {
      res.status(200).send('Movies updated');
    } else {
      res.status(500).send('Error writing movies data');
    }
  } catch (error) {
    console.error('Error in POST /api/movies:', error);
    res.status(500).send('Error writing movies data');
  }
});

// Banner
app.get('/api/banner', async (req, res) => {
  try {
    const banner = await loadBanner();
    res.json(banner);
  } catch (error) {
    console.error('Error in /api/banner:', error);
    res.status(500).send('Error reading banner data');
  }
});

app.post('/api/banner', async (req, res) => {
  try {
    const banner = req.body;
    const success = await saveBanner(banner);
    if (success) {
      res.status(200).send('Banner updated');
    } else {
      res.status(500).send('Error writing banner data');
    }
  } catch (error) {
    console.error('Error in POST /api/banner:', error);
    res.status(500).send('Error writing banner data');
  }
});

// Stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await loadStats();
    res.json(stats);
  } catch (error) {
    console.error('Error in /api/stats:', error);
    res.status(500).send('Error reading stats data');
  }
});

app.post('/api/stats', async (req, res) => {
  try {
    const stats = req.body;
    const success = await saveStats(stats);
    if (success) {
      res.status(200).send('Stats updated');
    } else {
      res.status(500).send('Error writing stats data');
    }
  } catch (error) {
    console.error('Error in POST /api/stats:', error);
    res.status(500).send('Error writing stats data');
  }
});

// Blob Storage Endpoints
// Upload file to Vercel Blob
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.originalname;
    const fileBuffer = req.file.buffer;

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    res.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: fileBuffer.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Upload movie poster
app.post('/api/upload/poster', upload.single('poster'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No poster uploaded' });
    }

    const filename = `posters/${Date.now()}-${req.file.originalname}`;
    const fileBuffer = req.file.buffer;

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    res.json({
      success: true,
      url: blob.url,
      filename: filename
    });
  } catch (error) {
    console.error('Poster upload error:', error);
    res.status(500).json({ error: 'Poster upload failed' });
  }
});

// Upload movie file
app.post('/api/upload/movie', upload.single('movie'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No movie file uploaded' });
    }

    const filename = `movies/${Date.now()}-${req.file.originalname}`;
    const fileBuffer = req.file.buffer;

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
    });

    res.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: fileBuffer.length
    });
  } catch (error) {
    console.error('Movie upload error:', error);
    res.status(500).json({ error: 'Movie upload failed' });
  }
});

// List all files in blob storage
app.get('/api/files', async (req, res) => {
  try {
    const { blobs } = await list();
    res.json({ files: blobs });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Delete file from blob storage
app.delete('/api/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    await del(filename);
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Increment views
app.post('/api/movies/:id/increment-views', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movies = await loadMovies();
    const movieIndex = movies.findIndex(m => m.id === movieId);
    if (movieIndex > -1) {
      movies[movieIndex].views = (movies[movieIndex].views || 0) + 1;
      await saveMovies(movies);
      
      // Update total stats
      const stats = await loadStats();
      stats.totalViews = (stats.totalViews || 0) + 1;
      await saveStats(stats);
      
      res.status(200).send('Views incremented');
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (error) {
    console.error('Error in increment-views:', error);
    res.status(500).send('Error updating views');
  }
});

// Increment downloads
app.post('/api/movies/:id/increment-downloads', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movies = await loadMovies();
    const movieIndex = movies.findIndex(m => m.id === movieId);
    if (movieIndex > -1) {
      movies[movieIndex].downloads = (movies[movieIndex].downloads || 0) + 1;
      await saveMovies(movies);
      
      // Update total stats
      const stats = await loadStats();
      stats.totalDownloads = (stats.totalDownloads || 0) + 1;
      await saveStats(stats);
      
      res.status(200).send('Downloads incremented');
    } else {
      res.status(404).send('Movie not found');
    }
  } catch (error) {
    console.error('Error in increment-downloads:', error);
    res.status(500).send('Error updating downloads');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL,
    database: DATABASE_TYPE,
    blob: !!process.env.BLOB_READ_WRITE_TOKEN,
    kv: !!process.env.KV_REST_API_URL,
    postgres: !!process.env.POSTGRES_URL
  });
});

// Start server (only if not in Vercel environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database type: ${DATABASE_TYPE}`);
  });
}

module.exports = app;
