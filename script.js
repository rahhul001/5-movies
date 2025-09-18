// 5 TR Moviez - Main JavaScript File

// Database Management with Server API
class MovieDatabase {
    constructor() {
        this.movies = [];
        this.banner = null;
        this.downloadStats = { totalDownloads: 0, totalViews: 0 };
        this.apiClient = window.apiClient;
        this.initDatabase();
    }

    async initDatabase() {
        // Load data from server or local storage
        await this.loadAllData();
        
        // Initialize sample data if no movies exist
        if (this.movies.length === 0) {
            await this.initSampleData();
        }
    }

    async loadAllData() {
        try {
            // Load movies
            this.movies = await this.apiClient.loadMovies();

            // Load banner
            this.banner = await this.apiClient.loadBanner();

            // Load download stats
            this.downloadStats = await this.apiClient.loadStats();
        } catch (error) {
            console.error('Failed to load data:', error);
            // Data will be loaded from localStorage as fallback
        }
    }

    // Save movies to server and local
    async saveMovies() {
        try {
            await this.apiClient.saveMovies(this.movies);
        } catch (error) {
            console.error('Failed to save movies:', error);
        }
    }

    // Save banner to server and local
    async saveBanner() {
        try {
            await this.apiClient.saveBanner(this.banner);
        } catch (error) {
            console.error('Failed to save banner:', error);
        }
    }

    // Save download stats to server and local
    async saveDownloadStats() {
        try {
            await this.apiClient.saveStats(this.downloadStats);
        } catch (error) {
            console.error('Failed to save stats:', error);
        }
    }

    // Initialize sample data if no movies exist
    initSampleData() {
        if (this.movies.length === 0) {
            this.movies = [
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
                    rating: 9.2,
                    description: 'A fictional story about two legendary revolutionaries and their journey away from home.',
                    poster: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    downloadLinks: [
                        { quality: 'HD', size: '1.5 GB', url: 'https://example.com/download3' },
                        { quality: '1080p', size: '3.2 GB', url: 'https://example.com/download4' }
                    ],
                    views: 2100,
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
                    poster: 'https://images.unsplash.com/photo-1542204637-e67bc7d41e48?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    downloadLinks: [
                        { quality: 'HD', size: '1.8 GB', url: 'https://example.com/download5' },
                        { quality: '1080p', size: '2.8 GB', url: 'https://example.com/download6' }
                    ],
                    views: 1800,
                    downloads: 380
                },
                {
                    id: 4,
                    title: 'Avatar: The Way of Water',
                    category: 'english',
                    genre: 'Action, Adventure',
                    year: 2022,
                    rating: 7.9,
                    description: 'Set more than a decade after the events of the first film.',
                    poster: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                    downloadLinks: [
                        { quality: 'HD', size: '2.1 GB', url: 'https://example.com/download7' },
                        { quality: '1080p', size: '4.5 GB', url: 'https://example.com/download8' }
                    ],
                    views: 2500,
                    downloads: 520
                }
            ];
            this.saveMovies();
        }
    }

    // Add new movie
    addMovie(movie) {
        movie.id = Date.now();
        movie.views = 0;
        movie.downloads = 0;
        this.movies.push(movie);
        this.saveMovies();
    }

    // Update existing movie
    updateMovie(id, updatedMovie) {
        const index = this.movies.findIndex(movie => movie.id === id);
        if (index !== -1) {
            this.movies[index] = { ...this.movies[index], ...updatedMovie };
            this.saveMovies();
        }
    }

    // Delete movie
    deleteMovie(id) {
        this.movies = this.movies.filter(movie => movie.id !== id);
        this.saveMovies();
    }

    // Get movies by category
    getMoviesByCategory(category) {
        if (category === 'all') return this.movies;
        return this.movies.filter(movie => movie.category === category);
    }

    // Search movies
    searchMovies(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.movies.filter(movie => 
            movie.title.toLowerCase().includes(lowercaseQuery) ||
            movie.genre.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Increment movie views
    async incrementViews(id) {
        try {
            await this.apiClient.incrementViews(id);
            // Refresh data from server
            await this.loadAllData();
        } catch (error) {
            console.error('Failed to increment views:', error);
        }
    }

    // Increment movie downloads
    async incrementDownloads(id) {
        try {
            await this.apiClient.incrementDownloads(id);
            // Refresh data from server
            await this.loadAllData();
        } catch (error) {
            console.error('Failed to increment downloads:', error);
        }
    }

    // Update banner settings
    updateBanner(bannerData) {
        this.banner = { ...this.banner, ...bannerData };
        this.saveBanner();
    }
}

// Initialize database
const movieDB = new MovieDatabase();

// DOM Elements
const moviesGrid = document.getElementById('movies-grid');
const searchInput = document.getElementById('search-input');
const sectionTitle = document.getElementById('section-title');
const bannerTitle = document.getElementById('banner-title');
const bannerSubtitle = document.getElementById('banner-subtitle');
const banner = document.getElementById('banner');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadBanner();
    displayMovies(movieDB.movies);
    setupEventListeners();
    updateStats();
});

// Load banner settings
function loadBanner() {
    const bannerData = movieDB.banner;
    bannerTitle.textContent = bannerData.title;
    bannerSubtitle.textContent = bannerData.subtitle;
    if (bannerData.backgroundImage) {
        banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bannerData.backgroundImage})`;
    }
}

// Display movies in grid
function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    if (movies.length === 0) {
        moviesGrid.innerHTML = '<div class="no-movies"><p>No movies found.</p></div>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => openMovieModal(movie.id);

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title}" loading="lazy">
        </div>
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <p class="movie-genre">${movie.genre}</p>
            <div class="movie-badges">
                ${movie.year ? `<span class="movie-year">${movie.year}</span>` : ''}
                <span class="movie-category">${movie.category.toUpperCase()}</span>
            </div>
        </div>
    `;

    return card;
}

// Open movie modal
function openMovieModal(movieId) {
    const movie = movieDB.movies.find(m => m.id === movieId);
    if (!movie) return;

    // Increment views
    movieDB.incrementViews(movieId);

    // Update modal content
    document.getElementById('modal-poster').src = movie.poster;
    document.getElementById('modal-title').textContent = movie.title;
    document.getElementById('modal-genre').textContent = `${movie.genre} | ${movie.category.toUpperCase()}`;
    document.getElementById('modal-description').textContent = movie.description || 'No description available.';

    // Create download options
    const downloadOptions = document.getElementById('download-options');
    downloadOptions.innerHTML = '';

    movie.downloadLinks.forEach((link, index) => {
        const option = document.createElement('div');
        option.className = 'download-option';
        option.innerHTML = `
            <div class="download-info">
                <h4>Download ${index + 1} - ${link.quality}</h4>
                <p>Size: ${link.size}</p>
            </div>
            <button class="download-btn" onclick="downloadMovie(${movieId}, ${index})">
                <i class="fas fa-download"></i> Download
            </button>
        `;
        downloadOptions.appendChild(option);
    });

    // Show modal
    document.getElementById('movie-modal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

// Download movie
function downloadMovie(movieId, linkIndex) {
    const movie = movieDB.movies.find(m => m.id === movieId);
    if (movie && movie.downloadLinks[linkIndex]) {
        const link = movie.downloadLinks[linkIndex];
        
        // Increment download count
        movieDB.incrementDownloads(movieId);
        
        // Open download link
        window.open(link.url, '_blank');
        
        // Show success message
        showNotification(`Starting download: ${movie.title} - ${link.quality}`, 'success');
    }
}

// Show category movies
function showCategory(category) {
    const movies = movieDB.getMoviesByCategory(category);
    displayMovies(movies);
    
    // Update section title
    const categoryNames = {
        'tamil': 'Tamil Movies',
        'telugu': 'Telugu Movies',
        'kannada': 'Kannada Movies',
        'english': 'English Movies'
    };
    sectionTitle.textContent = categoryNames[category] || 'All Movies';
    
    // Scroll to movies section
    document.getElementById('movies-section').scrollIntoView({ behavior: 'smooth' });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query === '') {
            displayMovies(movieDB.movies);
            sectionTitle.textContent = 'All Movies';
        } else {
            const results = movieDB.searchMovies(query);
            displayMovies(results);
            sectionTitle.textContent = `Search Results for "${query}"`;
        }
    });

    // Navigation menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const category = this.getAttribute('href').substring(1);
                if (category === 'home') {
                    displayMovies(movieDB.movies);
                    sectionTitle.textContent = 'All Movies';
                } else {
                    showCategory(category);
                }
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('movie-modal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

// Scroll to movies section
function scrollToMovies() {
    document.getElementById('movies-section').scrollIntoView({ behavior: 'smooth' });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Update stats
function updateStats() {
    // This will be called by admin dashboard
    if (typeof window.updateAdminStats === 'function') {
        window.updateAdminStats();
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .no-movies {
        grid-column: 1 / -1;
        text-align: center;
        padding: 50px;
        color: #666;
    }
    
    .notification i {
        font-size: 1.2rem;
    }
`;
document.head.appendChild(style);
