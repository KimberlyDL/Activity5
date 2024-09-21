const musicControllers = {
    index: (req, res) => {
        res.render('home');
    },
    trending: (req, res) => {
        res.render('trending');
    },
    favorites: (req, res) => {
        res.render('favorites');
    },
    playlist: (req, res) => {
        res.render('playlist');
    },
    artist: (req, res) => {
        res.render('artist');
    }
};

module.exports = musicControllers;