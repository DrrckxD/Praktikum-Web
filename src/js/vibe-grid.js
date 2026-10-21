/**
 * ============================================================================
 * FLIPPLAY: THE VIBE GRID - DEVELOPER GUIDE & JAVASCRIPT LOGIC
 * ============================================================================
 * File: src/js/vibe-grid.js
 * Description: Mengelola pengambilan data dari Jikan Public API (Anime & Manga),
 * pencarian real-time (Unified Search), penyaringan berdasarkan Aura (Aura-Based Discovery),
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

    // --- 2. STATE MANAGEMENT ---
    let allMediaData = [];     // Menyimpan seluruh data mentah dari API / Fallback
    let currentSearchQuery = ''; // Menyimpan kata kunci pencarian real-time
    let currentAura = 'all';     // Menyimpan filter aura aktif ('all', 'high-energy', 'melancholy', 'binge-mode')

    /**
     * Fallback Dataset (Mock Data)
     * Digunakan jika Jikan API mengalami rate limit (HTTP 429) atau gangguan jaringan.
     * Mencakup Anime dan Manga dengan gambar cover yang akurat (termasuk Fullmetal Alchemist).
     */
    const fallbackData = [
        {
            mal_id: 5114,
            title: "Fullmetal Alchemist: Brotherhood",
            media_category: "Anime",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/1208/94745.jpg" } },
            score: 9.10,
            episodes: 64,
            type: "TV",
            genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Drama" }, { name: "Fantasy" }],
            synopsis: "Setelah eksperimen alkimia yang berujung bencana di keluarga Elric, Edward dan Alphonse mencari Batu Bertuah..."
        },
        {
            mal_id: 25,
            title: "Fullmetal Alchemist (Manga Edition)",
            media_category: "Manga",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/manga/3/243617.jpg" } },
            score: 9.12,
            episodes: "108 Ch",
            type: "Manga",
            genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Drama" }, { name: "Fantasy" }],
            synopsis: "Kisah epik dua bersaudara Elric dalam manga legendaris karya Hiromu Arakawa menjelajahi batas sains dan alkimia."
        },
        {
            mal_id: 1,
            title: "Cowboy Bebop",
            media_category: "Anime",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/4/19644.jpg" } },
            score: 8.75,
            episodes: 26,
            type: "TV",
            genres: [{ name: "Action" }, { name: "Sci-Fi" }, { name: "Drama" }],
            synopsis: "Di tahun 2071, sekelompok pemburu hadiah menjelajahi tata surya menumpang pesawat Bebop..."
        },
        {
            mal_id: 20,
            title: "Naruto",
            media_category: "Anime",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/13/17405.jpg" } },
            score: 8.03,
            episodes: 220,
            type: "TV",
            genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
            synopsis: "Kisah ninja muda Uzumaki Naruto yang bertekad meraih pengakuan dan impian menjadi Hokage."
        },
        {
            mal_id: 13,
            title: "Berserk",
            media_category: "Manga",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/manga/1/157897.jpg" } },
            score: 9.47,
            episodes: "360+ Ch",
            type: "Manga",
            genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Drama" }, { name: "Fantasy" }, { name: "Horror" }],
            synopsis: "Guts si Pendekar Hitam menjelajahi dunia gelap penuh pertarungan tak kenal ampun demi takdirnya."
        },
        {
            mal_id: 30276,
            title: "One Punch Man",
            media_category: "Anime",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/12/76049.jpg" } },
            score: 8.51,
            episodes: 12,
            type: "TV",
            genres: [{ name: "Action" }, { name: "Comedy" }, { name: "Sci-Fi" }],
            synopsis: "Saitama adalah pahlawan yang bisa mengalahkan musuh apa pun hanya dengan satu pukulan."
        },
        {
            mal_id: 9253,
            title: "Steins;Gate",
            media_category: "Anime",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/5/73199.jpg" } },
            score: 9.07,
            episodes: 24,
            type: "TV",
            genres: [{ name: "Drama" }, { name: "Sci-Fi" }, { name: "Suspense" }, { name: "Psychological" }],
            synopsis: "Ilmuwan gila Rintarou Okabe tak sengaja menemukan teknologi pengiriman pesan melintasi waktu."
        },
        {
            mal_id: 1535,
            title: "Death Note",
            media_category: "Anime",
            images: { jpg: { image_url: "https://cdn.myanimelist.net/images/anime/9/9453.jpg" } },
            score: 8.63,
            episodes: 37,
            type: "TV",
            genres: [{ name: "Suspense" }, { name: "Supernatural" }, { name: "Thriller" }, { name: "Mystery" }],
            synopsis: "Light Yagami menemukan buku catatan kematian milik Shinigami dan mencoba menciptakan dunia tanpa kejahatan."
        }
    ];

    /**
     * --- 3. FETCH API FUNCTION ---
     * Mengambil data secara asinkron dari Jikan Public API (v4 anime & manga)
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
            // Menggunakan Fetch API untuk mengambil data dari dua endpoint publik secara paralel
            const [animeRes, mangaRes] = await Promise.all([
                fetch('https://api.jikan.moe/v4/anime?limit=16'),
                fetch('https://api.jikan.moe/v4/manga?limit=16')
            ]);

            let combined = [];

            if (animeRes.ok) {
                const animeJson = await animeRes.json();
                if (animeJson && animeJson.data) {
                    // Array Method (.map): Transform data anime dari API
                    combined = combined.concat(animeJson.data.map(item => ({
                        ...item,
                        media_category: 'Anime',
                        episodes: item.episodes ? `${item.episodes} Ep` : 'TV / Ongoing'
                    })));
                }
            }

            if (mangaRes.ok) {
                const mangaJson = await mangaRes.json();
                if (mangaJson && mangaJson.data) {
                    // Array Method (.map): Transform data manga dari API
                    combined = combined.concat(mangaJson.data.map(item => ({
                        ...item,
                        media_category: 'Manga',
                        episodes: item.chapters ? `${item.chapters} Ch` : 'Manga'
                    })));
                }
            }

            // Jika data berhasil didapat, simpan ke state; jika kosong gunakan fallback
            if (combined.length > 0) {
                allMediaData = combined;
            } else {
                allMediaData = fallbackData;
            }

            renderVibeGrid();
        } catch (err) {
            console.warn('Jikan API error atau rate limit tercapai. Menggunakan fallback dataset lokal:', err);
            // Error Handling: Jika fetch gagal, gunakan fallback data agar aplikasi tetap berfungsi sempurna
            allMediaData = fallbackData;
            renderVibeGrid();
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

        // Array Method (.filter): Memfilter data berdasarkan Unified Search query dan kategori Aura yang dipilih
        let filtered = allMediaData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(currentSearchQuery.toLowerCase());
            
            let matchesAura = true;
            const genreNames = item.genres ? item.genres.map(g => g.name.toLowerCase()) : [];

            if (currentAura === 'high-energy') {
                matchesAura = genreNames.some(g => ['action', 'adventure', 'shounen', 'sports', 'sci-fi', 'fantasy'].includes(g)) || item.score >= 8.3;
            } else if (currentAura === 'melancholy') {
                matchesAura = genreNames.some(g => ['drama', 'psychological', 'mystery', 'romance', 'supernatural', 'suspense', 'horror', 'thriller'].includes(g));
            } else if (currentAura === 'binge-mode') {
                matchesAura = (typeof item.episodes === 'number' && item.episodes >= 24) || item.media_category === 'Manga' || genreNames.includes('adventure') || genreNames.includes('fantasy');
            }

            return matchesSearch && matchesAura;
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
            
            const badgeColor = mediaType === 'Manga' ? 'bg-purple-600/90' : 'bg-red-600/90';

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

    // Event Handling 1: Unified Search Real-time Input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchQuery = e.target.value.trim();
            renderVibeGrid();
        });
    }

    // Event Handling 2: Aura-Based Discovery Click Buttons (.forEach array method)
    auraBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset style untuk semua tombol aura
            auraBtns.forEach(b => {
                b.classList.remove('bg-red-600', 'text-white', 'shadow-lg', 'shadow-red-600/30', 'font-bold');
                b.classList.add('bg-zinc-950', 'text-zinc-300', 'font-semibold');
            });
            // Beri style aktif pada tombol yang diklik
            btn.classList.remove('bg-zinc-950', 'text-zinc-300', 'font-semibold');
            btn.classList.add('bg-red-600', 'text-white', 'shadow-lg', 'shadow-red-600/30', 'font-bold');

            // Set current aura dan render ulang grid
            currentAura = btn.getAttribute('data-aura');
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
