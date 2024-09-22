const express = require('express');
const axios = require('axios'); // Import axios

const router = express.Router();
const musicController = require("../controller/MusicController");

const apiClient = axios.create({
    baseURL: 'https://api.audius.co',
    timeout: 5000,
    headers: {'Content-Type': 'application/json'}
});

getAvailableMusicHost = async (apiClient) => {
    try {
        const response = await apiClient.get('/', {
            params: {
                app_name: 'MusicPlayer',
            },
        });
        return response.data;
    }
    catch (err) {
        console.error('Error fetching available hosts:', err.message);
        return null;
    }
};

let availableHost = null;

(async () => {
    try {
        host = await getAvailableMusicHost(apiClient);
        if (host) {
            //console.log('Host fetched successfully:', host);
            availableHost = host.data[0];
        } else {
            console.error('Failed to fetch host');
        }
    } catch (err) {
        console.error('Error while fetching host:', err.message);
    }
})();

const waitForAvailableHost = () => {
    return new Promise((resolve, reject) => {
        const checkHost = () => {
            if (availableHost) {
                resolve(availableHost);
                //console.log(`Available host ${availableHost}`);
            } else {
                console.log('Host not ready, waiting...');
                setTimeout(checkHost, 500);
            }
        };
        checkHost();
    });
};
router.get('/', musicController.index);
router.get('/music/trending', async (req, res) => {
    
    try {
        const host = await waitForAvailableHost();
        console.log(host);
        musicController.trending(req, res, apiClient, host);
    } catch (err) {
        res.status(500).json({ error: 'Error occurred while fetching music' });
    }
});
router.get('/music/favorites', musicController.favorites);
router.get('/music/playlist', musicController.playlist);
router.get('/music/artist', async (req, res) => {
    try {
        const host = await waitForAvailableHost();
        musicController.artist(req, res, apiClient, host)
    } catch (err) {
        res.status(500).json({ error: 'Error occurred while fetching music' });
    }
});
router.get('/artists/:id/songs', musicController.getArtistSongs);

module.exports = router;
