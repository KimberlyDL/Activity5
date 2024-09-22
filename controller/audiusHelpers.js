const axios = require('axios');

// for trending tracks
async function fetchTrendingTracks(availableHost, appName = 'MusicPlayer') {
    try {
        const response = await axios.get(`${availableHost}/v1/tracks/trending`, {
            params: { app_name: appName },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MusicPlayer'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching trending tracks:', error);
        throw error;
    }
}

// for artist
async function fetchUsersByIds(availableHost, userIds, appName = 'MusicPlayer') {
    try {
        const response = await axios.get(`${availableHost}/v1/users`, {
            params: { id: userIds.join(','), app_name: appName },
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MusicPlayer'
            }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

module.exports = {
    fetchTrendingTracks,
    fetchUsersByIds
};
