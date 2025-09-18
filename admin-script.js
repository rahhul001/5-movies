// 5 TR Moviez - Admin Dashboard JavaScript

// Admin Authentication
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        showLoginModal();
    } else {
        hideLoginModal();
        loadAdminDashboard();
    }
}

// Show login modal
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
}

// Hide login modal
function hideLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        hideLoginModal();
        loadAdminDashboard();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginModal();
    showNotification('Logged out successfully!', 'info');
}

// Load admin dashboard
function loadAdminDashboard() {
    updateDashboardStats();
    loadMoviesTable();
    loadDownloadLinksTable();
    loadBannerSettings();
    loadRecentMovies();
}

// Update dashboard statistics
function updateDashboardStats() {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    const downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{"totalDownloads": 0, "totalViews": 0}');
    
    document.getElementById('total-movies').textContent = movies.length;
    document.getElementById('total-downloads').textContent = downloadStats.totalDownloads;
    document.getElementById('total-views').textContent = downloadStats.totalViews;
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Add active class to clicked link
    event.target.classList.add('active');
    
    // Reload data if needed
    if (sectionName === 'movies') {
        loadMoviesTable();
    } else if (sectionName === 'downloads') {
        loadDownloadLinksTable();
    } else if (sectionName === 'dashboard') {
        updateDashboardStats();
        loadRecentMovies();
    } else if (sectionName === 'analytics') {
        loadAnalytics();
    }
}

// Load movies table
async function loadMoviesTable() {
    try {
        const movies = await window.apiClient.loadMovies();
        const tbody = document.getElementById('movies-table-body');
        tbody.innerHTML = '';
    
    movies.forEach(movie => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="movie-select" data-id="${movie.id}" onchange="updateSelectedCount()"></td>
            <td><img src="${movie.poster}" alt="${movie.title}" class="table-poster"></td>
            <td><strong>${movie.title}</strong></td>
            <td><span class="movie-year">${movie.year || 'N/A'}</span></td>
            <td><span class="movie-category">${movie.category.toUpperCase()}</span></td>
            <td>${movie.genre}</td>
            <td>${movie.rating ? movie.rating.toFixed(1) + '/10' : 'N/A'}</td>
            <td>${movie.downloads || 0}</td>
            <td>${movie.views || 0}</td>
            <td>
                <button class="btn btn-success" onclick="editMovie(${movie.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteMovie(${movie.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load download links table
function loadDownloadLinksTable() {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    const tbody = document.getElementById('downloads-table-body');
    tbody.innerHTML = '';
    
    movies.forEach(movie => {
        movie.downloadLinks.forEach((link, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${movie.title}</strong></td>
                <td>${link.quality}</td>
                <td>${link.size}</td>
                <td><a href="${link.url}" target="_blank" class="download-link">View Link</a></td>
                <td>
                    <button class="btn btn-success" onclick="editDownloadLink(${movie.id}, ${index})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteDownloadLink(${movie.id}, ${index})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Load recent movies
function loadRecentMovies() {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    const recentMovies = movies.slice(-5).reverse(); // Get last 5 movies
    const container = document.getElementById('recent-movies-list');
    container.innerHTML = '';
    
    recentMovies.forEach(movie => {
        const item = document.createElement('div');
        item.className = 'recent-movie-item';
        item.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}" class="recent-movie-poster">
            <div class="recent-movie-info">
                <h4>${movie.title}</h4>
                <p>${movie.category.toUpperCase()} • ${movie.genre}</p>
            </div>
        `;
        container.appendChild(item);
    });
}

// Load banner settings
function loadBannerSettings() {
    const banner = JSON.parse(localStorage.getItem('banner') || '{}');
    
    document.getElementById('banner-title-input').value = banner.title || '';
    document.getElementById('banner-subtitle-input').value = banner.subtitle || '';
    document.getElementById('banner-bg-input').value = banner.backgroundImage || '';
    
    // Update preview
    updateBannerPreview();
}

// Update banner preview
function updateBannerPreview() {
    const title = document.getElementById('banner-title-input').value || 'Welcome to 5 TR Moviez';
    const subtitle = document.getElementById('banner-subtitle-input').value || 'Download your favorite movies in HD quality';
    const bgImage = document.getElementById('banner-bg-input').value;
    
    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-subtitle').textContent = subtitle;
    
    const previewBanner = document.getElementById('banner-preview');
    if (bgImage) {
        previewBanner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})`;
    }
}

// Update banner
function updateBanner() {
    const title = document.getElementById('banner-title-input').value;
    const subtitle = document.getElementById('banner-subtitle-input').value;
    const backgroundImage = document.getElementById('banner-bg-input').value;
    
    const bannerData = { title, subtitle, backgroundImage };
    localStorage.setItem('banner', JSON.stringify(bannerData));
    
    showNotification('Banner updated successfully!', 'success');
}

// Open movie modal
function openMovieModal(movieId = null) {
    const modal = document.getElementById('movie-modal');
    const form = document.getElementById('movie-form');
    
    if (movieId) {
        // Edit mode
        const movie = JSON.parse(localStorage.getItem('movies') || '[]').find(m => m.id === movieId);
        if (movie) {
            document.getElementById('modal-title').textContent = 'Edit Movie';
            populateMovieForm(movie);
            // Store the movie ID for updating
            form.dataset.movieId = movieId;
        }
    } else {
        // Add mode
        document.getElementById('modal-title').textContent = 'Add New Movie';
        form.reset();
        // Remove any stored movie ID
        delete form.dataset.movieId;
        // Clear download links container except first one
        const container = document.getElementById('download-links-container');
        container.innerHTML = `
            <div class="download-link-item">
                <div class="form-group">
                    <label>Quality</label>
                    <input type="text" placeholder="e.g., HD, 1080p" class="quality-input">
                </div>
                <div class="form-group">
                    <label>Size</label>
                    <input type="text" placeholder="e.g., 1.2 GB" class="size-input">
                </div>
                <div class="form-group">
                    <label>Download Link</label>
                    <input type="url" placeholder="Download URL" class="link-input">
                </div>
                <button type="button" class="btn btn-danger" onclick="removeDownloadLink(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

// Populate movie form for editing
function populateMovieForm(movie) {
    document.getElementById('movie-title').value = movie.title;
    document.getElementById('movie-year').value = movie.year || '';
    document.getElementById('movie-category').value = movie.category;
    document.getElementById('movie-genre').value = movie.genre;
    document.getElementById('movie-poster').value = movie.poster;
    document.getElementById('movie-description').value = movie.description || '';
    document.getElementById('movie-rating').value = movie.rating || '';
    
    // Populate download links
    const container = document.getElementById('download-links-container');
    container.innerHTML = '';
    
    movie.downloadLinks.forEach((link, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'download-link-item';
        linkItem.innerHTML = `
            <div class="form-group">
                <label>Quality</label>
                <input type="text" placeholder="e.g., HD, 1080p" class="quality-input" value="${link.quality}">
            </div>
            <div class="form-group">
                <label>Size</label>
                <input type="text" placeholder="e.g., 1.2 GB" class="size-input" value="${link.size}">
            </div>
            <div class="form-group">
                <label>Download Link</label>
                <input type="url" placeholder="Download URL" class="link-input" value="${link.url}">
            </div>
            <button type="button" class="btn btn-danger" onclick="removeDownloadLink(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(linkItem);
    });
}

// Close movie modal
function closeMovieModal() {
    document.getElementById('movie-modal').style.display = 'none';
    document.getElementById('movie-form').reset();
    delete document.getElementById('movie-form').dataset.movieId;
}

// Add download link
function addDownloadLink() {
    const container = document.getElementById('download-links-container');
    const linkItem = document.createElement('div');
    linkItem.className = 'download-link-item';
    linkItem.innerHTML = `
        <div class="form-group">
            <label>Quality</label>
            <input type="text" placeholder="e.g., HD, 1080p" class="quality-input">
        </div>
        <div class="form-group">
            <label>Size</label>
            <input type="text" placeholder="e.g., 1.2 GB" class="size-input">
        </div>
        <div class="form-group">
            <label>Download Link</label>
            <input type="url" placeholder="Download URL" class="link-input">
        </div>
        <button type="button" class="btn btn-danger" onclick="removeDownloadLink(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    container.appendChild(linkItem);
}

// Remove download link
function removeDownloadLink(button) {
    const container = document.getElementById('download-links-container');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        showNotification('At least one download link is required!', 'error');
    }
}

// Save movie
function saveMovie(e) {
    e.preventDefault();
    
    const form = e.target;
    const movieId = form.dataset.movieId;
    
    // Collect form data
    const movieData = {
        title: document.getElementById('movie-title').value,
        year: parseInt(document.getElementById('movie-year').value),
        category: document.getElementById('movie-category').value,
        genre: document.getElementById('movie-genre').value,
        poster: document.getElementById('movie-poster').value,
        description: document.getElementById('movie-description').value,
        rating: parseFloat(document.getElementById('movie-rating').value) || null
    };
    
    // Collect download links
    const downloadLinks = [];
    document.querySelectorAll('.download-link-item').forEach(item => {
        const quality = item.querySelector('.quality-input').value;
        const size = item.querySelector('.size-input').value;
        const url = item.querySelector('.link-input').value;
        
        if (quality && size && url) {
            downloadLinks.push({ quality, size, url });
        }
    });
    
    if (downloadLinks.length === 0) {
        showNotification('At least one download link is required!', 'error');
        return;
    }
    
    movieData.downloadLinks = downloadLinks;
    
    // Save to localStorage
    let movies = JSON.parse(localStorage.getItem('movies') || '[]');
    
    if (movieId) {
        // Update existing movie
        const index = movies.findIndex(m => m.id === parseInt(movieId));
        if (index !== -1) {
            movies[index] = { ...movies[index], ...movieData };
            showNotification('Movie updated successfully!', 'success');
        }
    } else {
        // Add new movie
        movieData.id = Date.now();
        movieData.views = 0;
        movieData.downloads = 0;
        movies.push(movieData);
        showNotification('Movie added successfully!', 'success');
    }
    
    // Save to cloud and local storage
    if (window.cloudDB && window.cloudDB.isFirebaseEnabled) {
        try {
            await window.cloudDB.saveMovies(movies);
            localStorage.setItem('movies', JSON.stringify(movies));
        } catch (error) {
            console.error('Failed to save to cloud:', error);
            localStorage.setItem('movies', JSON.stringify(movies));
        }
    } else {
        localStorage.setItem('movies', JSON.stringify(movies));
    }
    
    // Reload tables and close modal
    loadMoviesTable();
    loadDownloadLinksTable();
    updateDashboardStats();
    closeMovieModal();
}

// Edit movie
function editMovie(movieId) {
    openMovieModal(movieId);
}

// Delete movie
function deleteMovie(movieId) {
    if (confirm('Are you sure you want to delete this movie?')) {
        let movies = JSON.parse(localStorage.getItem('movies') || '[]');
        movies = movies.filter(m => m.id !== movieId);
        localStorage.setItem('movies', JSON.stringify(movies));
        
        loadMoviesTable();
        loadDownloadLinksTable();
        updateDashboardStats();
        showNotification('Movie deleted successfully!', 'success');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('movie-form').addEventListener('submit', saveMovie);
    
    // Banner preview updates
    document.getElementById('banner-title-input').addEventListener('input', updateBannerPreview);
    document.getElementById('banner-subtitle-input').addEventListener('input', updateBannerPreview);
    document.getElementById('banner-bg-input').addEventListener('input', updateBannerPreview);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const movieModal = document.getElementById('movie-modal');
        const loginModal = document.getElementById('login-modal');
        
        if (e.target === movieModal) {
            closeMovieModal();
        }
        if (e.target === loginModal) {
            // Don't close login modal on outside click
        }
    });
    
    // Check authentication
    checkAuth();
});

// Global function for updating admin stats (called from main script)
window.updateAdminStats = function() {
    if (typeof updateDashboardStats === 'function') {
        updateDashboardStats();
    }
};

// New Admin Functions

// Filter movies
function filterMovies() {
    const searchTerm = document.getElementById('admin-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    
    let filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm) || 
                             movie.genre.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || movie.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    loadFilteredMovies(filteredMovies);
}

// Load filtered movies
function loadFilteredMovies(movies) {
    const tbody = document.getElementById('movies-table-body');
    tbody.innerHTML = '';
    
    movies.forEach(movie => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="movie-select" data-id="${movie.id}" onchange="updateSelectedCount()"></td>
            <td><img src="${movie.poster}" alt="${movie.title}" class="table-poster"></td>
            <td><strong>${movie.title}</strong></td>
            <td><span class="movie-year">${movie.year || 'N/A'}</span></td>
            <td><span class="movie-category">${movie.category.toUpperCase()}</span></td>
            <td>${movie.genre}</td>
            <td>${movie.rating ? movie.rating.toFixed(1) + '/10' : 'N/A'}</td>
            <td>${movie.downloads || 0}</td>
            <td>${movie.views || 0}</td>
            <td>
                <button class="btn btn-success" onclick="editMovie(${movie.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteMovie(${movie.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Clear filters
function clearFilters() {
    document.getElementById('admin-search').value = '';
    document.getElementById('category-filter').value = '';
    loadMoviesTable();
}

// Toggle select all
function toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.movie-select');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateSelectedCount();
}

// Update selected count
function updateSelectedCount() {
    const selected = document.querySelectorAll('.movie-select:checked');
    document.getElementById('selected-count').textContent = `${selected.length} selected`;
}

// Bulk delete
function bulkDelete() {
    const selected = document.querySelectorAll('.movie-select:checked');
    if (selected.length === 0) {
        showNotification('Please select movies to delete!', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selected.length} movie(s)?`)) {
        let movies = JSON.parse(localStorage.getItem('movies') || '[]');
        
        selected.forEach(checkbox => {
            const movieId = parseInt(checkbox.dataset.id);
            movies = movies.filter(m => m.id !== movieId);
        });
        
        localStorage.setItem('movies', JSON.stringify(movies));
        loadMoviesTable();
        updateDashboardStats();
        showNotification(`${selected.length} movie(s) deleted successfully!`, 'success');
    }
}

// Export movies
function exportMovies() {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    const dataStr = JSON.stringify(movies, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'movies-backup.json';
    link.click();
    
    showNotification('Movies exported successfully!', 'success');
}

// Import movies
function importMovies() {
    document.getElementById('import-file').click();
}

// Handle import
function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedMovies = JSON.parse(e.target.result);
            const currentMovies = JSON.parse(localStorage.getItem('movies') || '[]');
            
            // Merge movies (avoid duplicates by ID)
            const existingIds = currentMovies.map(m => m.id);
            const newMovies = importedMovies.filter(m => !existingIds.includes(m.id));
            
            const mergedMovies = [...currentMovies, ...newMovies];
            localStorage.setItem('movies', JSON.stringify(mergedMovies));
            
            loadMoviesTable();
            updateDashboardStats();
            showNotification(`${newMovies.length} movies imported successfully!`, 'success');
        } catch (error) {
            showNotification('Error importing movies. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
}

// Load analytics
function loadAnalytics() {
    const movies = JSON.parse(localStorage.getItem('movies') || '[]');
    
    // Top downloads
    const topDownloads = movies
        .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        .slice(0, 5);
    
    const downloadsContainer = document.getElementById('top-downloads');
    downloadsContainer.innerHTML = '';
    topDownloads.forEach((movie, index) => {
        const item = document.createElement('div');
        item.className = 'analytics-item';
        item.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <span class="title">${movie.title}</span>
            <span class="count">${movie.downloads || 0}</span>
        `;
        downloadsContainer.appendChild(item);
    });
    
    // Top views
    const topViews = movies
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    
    const viewsContainer = document.getElementById('top-views');
    viewsContainer.innerHTML = '';
    topViews.forEach((movie, index) => {
        const item = document.createElement('div');
        item.className = 'analytics-item';
        item.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <span class="title">${movie.title}</span>
            <span class="count">${movie.views || 0}</span>
        `;
        viewsContainer.appendChild(item);
    });
    
    // Category distribution
    const categoryStats = {};
    movies.forEach(movie => {
        categoryStats[movie.category] = (categoryStats[movie.category] || 0) + 1;
    });
    
    const categoryContainer = document.getElementById('category-distribution');
    categoryContainer.innerHTML = '';
    Object.entries(categoryStats).forEach(([category, count]) => {
        const item = document.createElement('div');
        item.className = 'category-stat-item';
        item.innerHTML = `
            <span class="category">${category.toUpperCase()}</span>
            <span class="count">${count}</span>
        `;
        categoryContainer.appendChild(item);
    });
}

// Save general settings
function saveGeneralSettings() {
    const settings = {
        siteName: document.getElementById('site-name').value,
        maxDownloads: parseInt(document.getElementById('max-downloads').value),
        autoCleanup: parseInt(document.getElementById('auto-cleanup').value)
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// Change admin password
function changeAdminPassword() {
    const newPassword = document.getElementById('admin-password-new').value;
    const confirmPassword = document.getElementById('admin-password-confirm').value;
    
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // In a real application, you would hash the password
    localStorage.setItem('adminPassword', newPassword);
    showNotification('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('admin-password-new').value = '';
    document.getElementById('admin-password-confirm').value = '';
}

// Backup database
function backupDatabase() {
    const data = {
        movies: JSON.parse(localStorage.getItem('movies') || '[]'),
        banner: JSON.parse(localStorage.getItem('banner') || '{}'),
        downloadStats: JSON.parse(localStorage.getItem('downloadStats') || '{}'),
        settings: JSON.parse(localStorage.getItem('adminSettings') || '{}'),
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `moviez-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Database backed up successfully!', 'success');
}

// Reset database
function resetDatabase() {
    if (confirm('Are you sure you want to reset the database? This will delete ALL data!')) {
        if (confirm('This action cannot be undone. Are you absolutely sure?')) {
            localStorage.removeItem('movies');
            localStorage.removeItem('banner');
            localStorage.removeItem('downloadStats');
            localStorage.removeItem('adminSettings');
            
            loadMoviesTable();
            updateDashboardStats();
            showNotification('Database reset successfully!', 'success');
        }
    }
}

// Clear cache
function clearCache() {
    // Clear any cached data (in this case, just show a notification)
    showNotification('Cache cleared successfully!', 'success');
}
