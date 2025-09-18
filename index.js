const express = require('express');
const cors = require('cors');
const { put, del, list } = require('@vercel/blob');
const { kv } = require('@vercel/kv');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'kv';

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

// Universal database functions
const saveMovies = async (moviesData) => {
  if (DATABASE_TYPE === 'kv') {
    return await saveMoviesKV(moviesData);
  } else {
    // Fallback to in-memory
    movies = moviesData;
    return true;
  }
};

const loadMovies = async () => {
  if (DATABASE_TYPE === 'kv') {
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
    kv: !!process.env.KV_REST_API_URL
  });
});

module.exports = app;
