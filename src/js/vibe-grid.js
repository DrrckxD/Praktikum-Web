/**
 * ============================================================================
 * FLIPPLAY: THE VIBE GRID - DEVELOPER GUIDE & JAVASCRIPT LOGIC
 * ============================================================================
 * File: src/js/vibe-grid.js
 * Description: Mengelola pengambilan data dari Kitsu API (Anime & Manga),
 * pencarian real-time (Unified Search), penyaringan berdasarkan kategori (Anime, Manga, Drama),
 * serta render DOM dinamis menggunakan Template Literals dan Array Methods.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM SELECTORS ---
    const searchInput = document.getElementById('vibe-search-input');
    const cardsContainer = document.getElementById('vibe-cards-container');
    const loadingEl = document.getElementById('vibe-loading');
    const errorEl = document.getElementById('vibe-error');
    const errorTextEl = document.getElementById('vibe-error-text');
    const emptyEl = document.getElementById('vibe-empty');
    const retryBtn = document.getElementById('vibe-retry-btn');
    const auraBtns = document.querySelectorAll('.aura-btn');
    const genreContainer = document.getElementById('vibe-genre-container');

    // --- 2. STATE MANAGEMENT ---
    let allMediaData = [];     // Menyimpan seluruh data dari API
    let currentSearchQuery = ''; // Menyimpan kata kunci pencarian real-time
    let currentCategory = 'all';     // Menyimpan kategori aktif ('all', 'Anime', 'Manga', 'Drama')
    let currentGenre = 'all';    // Menyimpan genre aktif ('all' atau nama genre)

    // Endpoint API (include=categories agar genre Kitsu ikut terambil untuk filter kategori)
    const API_URLS = {
        anime: 'https://kitsu.io/api/edge/anime?page[limit]=20&sort=-userCount&include=categories',
        manga: 'https://kitsu.io/api/edge/manga?page[limit]=20&sort=-userCount&include=categories',
        drama: 'https://api.tvmaze.com/shows'
    };

    /**
     * Normalisasi respons TVMaze (array show) ke bentuk data yang dipakai render.
     * TVMaze mengembalikan ratusan show, jadi diurutkan berdasarkan rating dan diambil 20 teratas.
     */
    function normalizeTvmaze(list) {
        return (Array.isArray(list) ? list : [])
            .slice()
            .sort((a, b) => ((b.rating && b.rating.average) || 0) - ((a.rating && a.rating.average) || 0))
            .slice(0, 20)
            .map(show => ({
                id: show.id,
                title: show.name || 'Tanpa Judul',
                media_category: 'Drama',
                images: { jpg: { image_url: (show.image && (show.image.medium || show.image.original)) || '' } },
                score: (show.rating && show.rating.average) || null,
                episodes: show.runtime ? `${show.runtime} Min` : (show.type || 'Series'),
                type: show.type || 'Drama',
                genres: (show.genres || []).map(name => ({ name })),
                synopsis: (show.summary || '').replace(/<[^>]*>/g, '')
            }));
    }

    /**
     * Normalisasi respons Kitsu (JSON:API) ke bentuk data yang dipakai render.
     * Rating Kitsu 0-100 dikonversi ke skala 0-10.
     */
    function normalizeKitsu(json, category) {
        const genreMap = {};
        ((json && json.included) || []).forEach(inc => {
            if (inc.type === 'categories') genreMap[inc.id] = inc.attributes.title;
        });
        const isManga = category === 'Manga';
        return ((json && json.data) || []).map(item => {
            const a = item.attributes || {};
            const relGenres = (item.relationships && item.relationships.categories && item.relationships.categories.data) || [];
            const rating = parseFloat(a.averageRating);
            const count = isManga ? a.chapterCount : a.episodeCount;
            const poster = a.posterImage || {};
            return {
                id: item.id,
                title: a.canonicalTitle || (a.titles && (a.titles.en || a.titles.en_jp)) || 'Tanpa Judul',
                media_category: category,
                images: { jpg: { image_url: poster.medium || poster.small || poster.original || '' } },
                score: isNaN(rating) ? null : Math.round(rating) / 10,
                episodes: count ? `${count} ${isManga ? 'Ch' : 'Ep'}` : (isManga ? 'Manga' : 'TV / Ongoing'),
                type: a.subtype || category,
                genres: relGenres.map(g => ({ name: genreMap[g.id] })).filter(g => g.name),
                synopsis: a.synopsis || ''
            };
        });
    }

    /**
     * --- 3. FETCH API FUNCTION ---
     * Mengambil data secara asinkron dari Kitsu API (anime & manga)
     * Menggunakan Promise.all untuk mengambil data anime dan manga secara bersamaan.
     */
    async function fetchVibeData() {
        if (!loadingEl || !cardsContainer) return;

        // Tampilkan state loading & sembunyikan error/empty state
        loadingEl.classList.remove('hidden');
        if (errorEl) errorEl.classList.add('hidden');
        cardsContainer.innerHTML = '';
        if (emptyEl) emptyEl.classList.add('hidden');

        try {
            // Fetch API: ambil tiga endpoint publik secara paralel
            const kitsuOpts = { headers: { Accept: 'application/vnd.api+json' } };
            const [animeRes, mangaRes, dramaRes] = await Promise.all([
                fetch(API_URLS.anime, kitsuOpts),
                fetch(API_URLS.manga, kitsuOpts),
                fetch(API_URLS.drama)
            ]);

            if (!animeRes.ok || !mangaRes.ok || !dramaRes.ok) {
                throw new Error(`HTTP ${animeRes.status}/${mangaRes.status}/${dramaRes.status}`);
            }

            const [animeJson, mangaJson, dramaJson] = await Promise.all([
                animeRes.json(), mangaRes.json(), dramaRes.json()
            ]);

            allMediaData = [
                ...normalizeKitsu(animeJson, 'Anime'),
                ...normalizeKitsu(mangaJson, 'Manga'),
                ...normalizeTvmaze(dramaJson)
            ];

            renderGenres();
            renderVibeGrid();
        } catch (err) {
            console.error('Gagal mengambil data API:', err);
            allMediaData = [];
            cardsContainer.innerHTML = '';
            if (errorEl) errorEl.classList.remove('hidden');
        } finally {
            // Sembunyikan loading state
            if (loadingEl) loadingEl.classList.add('hidden');
        }
    }

    /**
     * --- 4. RENDER & PROCESSING FUNCTION ---
     * Mengolah data menggunakan Array Methods (.filter(), .map()) dan Template Literals.
     */
    function renderVibeGrid() {
        if (!cardsContainer) return;

        // Array Method (.filter): Memfilter data berdasarkan Unified Search query dan kategori yang dipilih
        let filtered = allMediaData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery.toLowerCase());
            
            const matchesCategory = currentCategory === 'all' || item.media_category === currentCategory;

            const matchesGenre = currentGenre === 'all' || (item.genres || []).some(g => g.name === currentGenre);

            return matchesSearch && matchesCategory && matchesGenre;
        });

        // Handle Empty State
        if (filtered.length === 0) {
            cardsContainer.innerHTML = '';
            if (emptyEl) emptyEl.classList.remove('hidden');
            return;
        }

        if (emptyEl) emptyEl.classList.add('hidden');

        // Array Method (.map) & Template Literals: Render HTML card secara dinamis
        cardsContainer.innerHTML = filtered.map(item => {
            const title = item.title || 'Tanpa Judul';
            const imgUrl = (item.images && item.images.jpg && item.images.jpg.image_url) ? item.images.jpg.image_url : 'https://via.placeholder.com/300x400?text=FlipPlay';
            const score = item.score ? item.score : 'N/A';
            const mediaType = item.media_category || 'Media';
            const epOrCh = item.episodes || '12 Ep';
            const genresStr = (item.genres && item.genres.length > 0) ? item.genres.map(g => g.name).slice(0, 2).join(', ') : 'Hiburan';
            const synopsis = item.synopsis ? item.synopsis.substring(0, 95) + '...' : 'Tidak ada sinopsis tersedia.';
            
            const badgeColor = mediaType === 'Manga' ? 'bg-purple-600/90' : (mediaType === 'Drama' ? 'bg-blue-600/90' : 'bg-red-600/90');

            return `
                <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg hover:border-red-600/60 hover:shadow-red-600/20 transition-all duration-300 flex flex-col group">
                    <!-- Image Thumbnail with Badges -->
                    <div class="relative aspect-[3/4] overflow-hidden bg-zinc-950">
                        <img src="${imgUrl}" alt="${title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
                        
                        <!-- Top Badges -->
                        <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span class="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white font-black text-xs border border-white/10 flex items-center gap-1 shadow">
                                <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                ${score}
                            </span>
                        </div>

                        <div class="absolute top-3 right-3">
                            <span class="px-2.5 py-1 rounded-lg ${badgeColor} text-white font-extrabold text-[10px] uppercase tracking-wider shadow">
                                ${mediaType}
                            </span>
                        </div>

                        <!-- Bottom Card Info overlay -->
                        <div class="absolute bottom-3 left-3 right-3">
                            <span class="text-[11px] font-bold text-red-400 uppercase tracking-wide block mb-0.5">${genresStr}</span>
                            <h3 class="text-white font-extrabold text-base leading-snug line-clamp-1 group-hover:text-red-400 transition-colors">${title}</h3>
                        </div>
                    </div>

                    <!-- Card Body -->
                    <div class="p-4 flex flex-col flex-grow justify-between bg-zinc-900/90">
                        <p class="text-zinc-400 text-xs line-clamp-3 mb-4 leading-relaxed">${synopsis}</p>
                        
                        <div class="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                            <span class="text-zinc-400 font-medium flex items-center gap-1">
                                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                ${epOrCh}
                            </span>
                            <button type="button" class="px-3 py-1.5 bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow">
                                Tonton Vibe
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * --- 5. EVENT HANDLERS ---
     */

    // Genre Filter: chip dibangun dari genre yang ada pada kategori aktif (maks. 6 genre terbanyak)
    function renderGenres() {
        if (!genreContainer) return;
        const counts = {};
        allMediaData
            .filter(item => currentCategory === 'all' || item.media_category === currentCategory)
            .forEach(item => (item.genres || []).forEach(g => { counts[g.name] = (counts[g.name] || 0) + 1; }));
        const genres = Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
            .slice(0, 6);
        if (currentGenre !== 'all' && !genres.includes(currentGenre)) currentGenre = 'all';

        genreContainer.innerHTML = ['all', ...genres].map(g => {
            const active = g === currentGenre;
            const cls = active
                ? 'font-bold bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80';
            return `<button type="button" data-genre="${g}" class="genre-btn px-4 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${cls}">${g === 'all' ? 'Semua' : g}</button>`;
        }).join('');
    }

    // Event Handling: klik chip genre (event delegation)
    if (genreContainer) {
        genreContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.genre-btn');
            if (!btn) return;
            currentGenre = btn.getAttribute('data-genre');
            renderGenres();
            renderVibeGrid();
        });
    }

    // Event Handling 1: Unified Search Real-time Input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.trim();
            renderVibeGrid();
        });
    }

    // Event Handling 2: Category Filter Click Buttons (.forEach array method)
    auraBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset style untuk semua tombol kategori
            auraBtns.forEach(b => {
                b.classList.remove('bg-red-600', 'text-white', 'shadow-lg', 'shadow-red-600/30', 'font-bold');
                b.classList.add('bg-zinc-950', 'text-zinc-300', 'font-semibold');
            });
            // Beri style aktif pada tombol yang diklik
            btn.classList.remove('bg-zinc-950', 'text-zinc-300', 'font-semibold');
            btn.classList.add('bg-red-600', 'text-white', 'shadow-lg', 'shadow-red-600/30', 'font-bold');

            // Set kategori aktif dan render ulang grid
            currentCategory = btn.getAttribute('data-category');
            currentGenre = 'all';
            renderGenres();
            renderVibeGrid();
        });
    });

    // Retry Button Click Event (jika terjadi error fetch)
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            fetchVibeData();
        });
    }

    // --- 6. INITIALIZATION ---
    fetchVibeData();
});
