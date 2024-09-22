const { fetchTrendingTracks, fetchUsersByIds } = require('./audiusHelpers');

let trendingSongs = null;
let artists = null;
let tracks = null;

const musicControllers = {
    index: (req, res) => {
        res.render('home', { title: 'MusicPlaylist', currentUrl: req.url });
    },
    trending: async (req, res, apiClient, availableHost) => {
        if (!trendingSongs) {
            if (!availableHost) {
                return res.status(500).json({ error: 'No available host to fetch trending songs' });
            }
            try {
                console.log(`${availableHost}/v1/tracks/trending`);

                // const tracks = await fetchTrendingTracks(availableHost);

                // const userIds = [...new Set(tracks.map(track => track.user.id))];
                // const artists = await fetchUsersByIds(availableHost, userIds);

                const response = await apiClient.get(`${availableHost}/v1/tracks/trending`, {
                    params: {
                        app_name: 'MusicPlayer',
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'MusicPlayer'
                    },
                });

                if (response) {
                    tracks = response.data;
                    trendingSongs = response.data.data.map((song, index) => {
                        return {
                            id: song.id,
                            genre: song.genre,
                            title: song.title,
                            artist: song.user.name,
                            image: song.artwork['480x480'],
                            description: song.description,
                            duration: song.duration,
                            user_id: song.user.id,
                            rank: index + 1
                        };
                    });
                }
                res.render('trending', { title: 'Music Player',  currentUrl: req.url, songs: trendingSongs });
            } catch (error) {
                console.error(`Error fetching from ${host}:`, error.response ? error.response.data : error.message);
                res.status(500).json({ error: 'Failed to fetch trending songs' });
            }
        }
        else {
            res.render('trending', { title: 'Music Player',  currentUrl: req.url, songs: trendingSongs });
        }
    },
    favorites: (req, res) => {
        res.render('favorites', { title: 'MusicPlaylist', currentUrl: req.url });
    },
    playlist: (req, res) => {
        res.render('playlist', { title: 'MusicPlaylist', currentUrl: req.url });
    },

    artist: async (req, res, apiClient, availableHost) => {
        if (!availableHost) {
            return res.status(500).json({ error: 'No available host to fetch artist data' });
        }
    
        // Check if artists data is already cached
        if (artists) {
            return res.render('artist', { title: 'Music Player', currentUrl: req.url, artists: artists });
        }
    
        try {
            if (!tracks) {
                const response = await apiClient.get(`${availableHost}/v1/tracks/trending`, {
                    params: {
                        app_name: 'MusicPlayer',
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'MusicPlayer'
                    },
                });
    
                if (response && response.data) {
                    tracks = response.data;
                } else {
                    return res.status(500).json({ error: 'Failed to fetch trending tracks' });
                }
            }
    
            artists = tracks.data.map((song) => ({
                id: song.user.id,
                name: song.user.name,
                profile_picture: song.user.profile_picture['480x480'],
                cover_photo: song.user.cover_photo['480x480'],
                bio: song.user.bio,
                twitter_handle: song.user.twitter_handle,
                instagram_handle: song.user.instagram_handle,
                tiktok_handle: song.user.tiktok_handle,
                album_count: song.user.album_count,
            }));
    
            // Render the artist view with the cached artist data
            res.render('artist', { title: 'Music Player', currentUrl: req.url, artists: artists });
    
        } catch (error) {
            console.error(`Error fetching from ${availableHost}:`, error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to fetch artist data' });
        }
    },
    

    getArtistSongs: async (req, res) => {
        const { id } = req.params; // Artist ID from path parameters
        const { limit = 10, offset = 0, sort = 'date', sort_method = 'title', sort_direction = 'asc', query = '', filter_tracks = 'all' } = req.query;
        
        try {
            // Build query filters
            const filter = { artist_id: id }; // Filter by artist ID

            // Apply track filter (public, unlisted, all)
            if (filter_tracks === 'public') {
                filter.is_public = true;
            } else if (filter_tracks === 'unlisted') {
                filter.is_public = false;
            }

            // Add search query (optional, e.g., title or artist name contains the query)
            if (query) {
                filter.$or = [
                    { title: new RegExp(query, 'i') },
                    { artist_name: new RegExp(query, 'i') }
                ];
            }

            // Sorting options
            const sortOptions = {};
            sortOptions[sort_method] = sort_direction === 'asc' ? 1 : -1;

            // Fetch songs with pagination, filtering, and sorting
            const songs = await Song.find(filter)
                .sort(sortOptions)
                .skip(parseInt(offset)) // Number of items to skip (pagination)
                .limit(parseInt(limit))  // Number of items to fetch
                .exec();

            // Total count for pagination metadata
            const totalSongs = await Song.countDocuments(filter);

            // Pagination metadata
            const pagination = {
                totalItems: totalSongs,
                limit: parseInt(limit),
                offset: parseInt(offset),
                totalPages: Math.ceil(totalSongs / limit),
                currentPage: Math.floor(offset / limit) + 1
            };

            res.json({ songs, pagination });
        } catch (error) {
            console.error('Error fetching artist songs:', error);
            res.status(500).json({ error: 'Failed to fetch artist songs' });
        }
    },

    gettrendingmusic: async (req, res, apiClient, availableHost) => {
        if (!availableHost) {
            return res.status(500).json({ error: 'No available host to fetch trending songs' });
        }

        try {
            console.log(`${availableHost}/v1/tracks/trending`);
            const response = await apiClient.get(`${availableHost}/v1/tracks/trending`, {
                params: {
                    app_name: 'MusicPlayer',
                },
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'MusicPlayer'
                },
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error(`Error fetching from ${host}:`, error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to fetch trending songs' });
        }

    }
}

module.exports = musicControllers;