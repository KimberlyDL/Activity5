const express = require('express');
const axios = require('axios'); // Import axios
const upload = require('../config/multer');  // Adjust the path as needed
const router = express.Router();
const musicController = require("../controller/MusicController");
const songController = require("../controller/SongController");
const playlistController = require("../controller/PlaylistController");

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
router.get('/trending', async (req, res) => {
    try {
        const host = await waitForAvailableHost();
        console.log(host);
        musicController.trending(req, res, apiClient, host);
    } catch (err) {
        res.status(500).json({ error: 'Error occurred while fetching music' });
    }
});
router.get('/favorites', musicController.favorites);


//playlist routescke=
router.get('/playlist', playlistController.index);
router.get('/playlist/json', playlistController.getjson);
//router.get('/playlist/create', playlistController.create);
router.post('/playlist/create', playlistController.post);
router.get('/playlist/edit/:id', playlistController.edit);
router.get('/playlist/:id', playlistController.show);
router.post('/playlist/edit/:id', playlistController.patch);
router.get('/playlists/:playlist_id/songs/:song_id', playlistController.addToPlaylist);
router.delete('/playlist/delete/:id', playlistController.delete);

router.get('/artist', async (req, res) => {
    try {
        const host = await waitForAvailableHost();
        musicController.artist(req, res, apiClient, host)
    } catch (err) {
        res.status(500).json({ error: 'Error occurred while fetching music' });
    }
});
router.get('/artists/:id/songs', musicController.getArtistSongs);


router.get('/music/local', songController.index);
router.get('/music/local/favorites', songController.getFavAll);
router.get('/music/local/upload', songController.create);
router.post('/music/local/upload', upload.single('song'), songController.post);
router.delete('/music/local/remove/:id', songController.delete);
router.get('/music/:id', songController.show);

router.post('/music/:id/favorites', songController.setFav);
router.delete('/music/:id/favorites', songController.unsetFav);


module.exports = router;
