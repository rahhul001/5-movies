// API Client for 5 TR Moviez Server
// This handles all communication with the server

class APIClient {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.isOnline = navigator.onLine;
        this.setupOfflineHandling();
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('Back online - syncing data');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('Gone offline - using local storage');
        });
    }

    async syncOfflineData() {
        // Sync any offline changes when back online
        try {
            const localMovies = this.getFromLocal('movies');
            if (localMovies && localMovies.length > 0) {
                await this.saveMovies(localMovies);
            }
        } catch (error) {
            console.error('Failed to sync offline data:', error);
        }
    }

    // Movies API
    async loadMovies() {
        if (!this.isOnline) {
            return this.getFromLocal('movies') || [];
        }

        try {
            const response = await fetch(`${this.baseURL}/movies`);
            if (!response.ok) throw new Error('Failed to load movies');
            
            const movies = await response.json();
            this.saveToLocal('movies', movies);
            return movies;
        } catch (error) {
            console.error('Failed to load movies from server:', error);
            return this.getFromLocal('movies') || [];
        }
    }

    async saveMovies(movies) {
        // Always save to localStorage as backup
        this.saveToLocal('movies', movies);

        if (!this.isOnline) {
            console.log('Offline - saved to localStorage only');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movies)
            });

            if (!response.ok) throw new Error('Failed to save movies');
            
            const result = await response.json();
            console.log('Movies saved to server:', result.message);
            return result;
        } catch (error) {
            console.error('Failed to save movies to server:', error);
            throw error;
        }
    }

    async addMovie(movieData) {
        const movies = await this.loadMovies();
        const newMovie = {
            id: Date.now(),
            ...movieData,
            views: 0,
            downloads: 0
        };
        movies.push(newMovie);
        await this.saveMovies(movies);
        return newMovie;
    }

    async updateMovie(id, updates) {
        const movies = await this.loadMovies();
        const index = movies.findIndex(m => m.id === id);
        if (index === -1) throw new Error('Movie not found');
        
        movies[index] = { ...movies[index], ...updates };
        await this.saveMovies(movies);
        return movies[index];
    }

    async deleteMovie(id) {
        const movies = await this.loadMovies();
        const filteredMovies = movies.filter(m => m.id !== id);
        await this.saveMovies(filteredMovies);
    }

    // Banner API
    async loadBanner() {
        if (!this.isOnline) {
            return this.getFromLocal('banner') || this.getDefaultBanner();
        }

        try {
            const response = await fetch(`${this.baseURL}/banner`);
            if (!response.ok) throw new Error('Failed to load banner');
            
            const banner = await response.json();
            this.saveToLocal('banner', banner);
            return banner;
        } catch (error) {
            console.error('Failed to load banner from server:', error);
            return this.getFromLocal('banner') || this.getDefaultBanner();
        }
    }

    async saveBanner(banner) {
        this.saveToLocal('banner', banner);

        if (!this.isOnline) {
            console.log('Offline - banner saved to localStorage only');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/banner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(banner)
            });

            if (!response.ok) throw new Error('Failed to save banner');
            
            const result = await response.json();
            console.log('Banner saved to server:', result.message);
            return result;
        } catch (error) {
            console.error('Failed to save banner to server:', error);
            throw error;
        }
    }

    // Stats API
    async loadStats() {
        if (!this.isOnline) {
            return this.getFromLocal('downloadStats') || { totalDownloads: 0, totalViews: 0 };
        }

        try {
            const response = await fetch(`${this.baseURL}/stats`);
            if (!response.ok) throw new Error('Failed to load stats');
            
            const stats = await response.json();
            this.saveToLocal('downloadStats', stats);
            return stats;
        } catch (error) {
            console.error('Failed to load stats from server:', error);
            return this.getFromLocal('downloadStats') || { totalDownloads: 0, totalViews: 0 };
        }
    }

    async saveStats(stats) {
        this.saveToLocal('downloadStats', stats);

        if (!this.isOnline) {
            console.log('Offline - stats saved to localStorage only');
            return;
        }

        try {
            const response = await fetch(`${this.baseURL}/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stats)
            });

            if (!response.ok) throw new Error('Failed to save stats');
            
            const result = await response.json();
            console.log('Stats saved to server:', result.message);
            return result;
        } catch (error) {
            console.error('Failed to save stats to server:', error);
            throw error;
        }
    }

    async incrementViews(movieId) {
        try {
            const movies = await this.loadMovies();
            const movie = movies.find(m => m.id === movieId);
            if (movie) {
                movie.views = (movie.views || 0) + 1;
                await this.saveMovies(movies);
                
                // Update total stats
                const stats = await this.loadStats();
                stats.totalViews = (stats.totalViews || 0) + 1;
                await this.saveStats(stats);
            }
        } catch (error) {
            console.error('Failed to increment views:', error);
        }
    }

    async incrementDownloads(movieId) {
        try {
            const movies = await this.loadMovies();
            const movie = movies.find(m => m.id === movieId);
            if (movie) {
                movie.downloads = (movie.downloads || 0) + 1;
                await this.saveMovies(movies);
                
                // Update total stats
                const stats = await this.loadStats();
                stats.totalDownloads = (stats.totalDownloads || 0) + 1;
                await this.saveStats(stats);
            }
        } catch (error) {
            console.error('Failed to increment downloads:', error);
        }
    }

    // Local storage helpers
    saveToLocal(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    getFromLocal(key) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    getDefaultBanner() {
        return {
            title: 'Welcome to 5 TR Moviez',
            subtitle: 'Download your favorite movies in HD quality',
            backgroundImage: 'https://images.unsplash.com/photo-1489599909698-6c8e8c0b8d8e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
        };
    }

    // Get connection status
    getStatus() {
        return {
            isOnline: this.isOnline,
            baseURL: this.baseURL
        };
    }
}

// Create global instance
window.apiClient = new APIClient();
