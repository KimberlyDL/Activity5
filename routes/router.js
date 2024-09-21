const express = require('express');

const router = express.Router();
const musicController = require("../controller/MusicController");

router.get('/', musicController.index);
router.get('/music/trending', musicController.trending);
router.get('/music/favorites', musicController.favorites);
router.get('/music/playlist', musicController.playlist);
router.get('/music/artist', musicController.artist);

module.exports = router;