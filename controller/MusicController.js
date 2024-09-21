const musicControllers = {
    index: (req, res) => {
        res.render('home', {title: 'MusicPlaylist'});
    },
    trending: (req, res) => {
        res.render('trending', {title: 'MusicPlaylist'});
    },
    favorites: (req, res) => {
        res.render('favorites', {title: 'MusicPlaylist'});
    },
    playlist: (req, res) => {
        res.render('playlist', {title: 'MusicPlaylist'});
    },
    artist: (req, res) => {
        res.render('artist', {title: 'MusicPlaylist'});
    }
};

module.exports = musicControllers;