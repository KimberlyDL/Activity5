const { Playlist, Song } = require('../models');
const { encrypt, decrypt } = require('../utils/encryption');
const { addToPlaylist } = require('./SongController');

const playlistController = {
    index: async (req, res) => {
        try {
            // Fetch all playlists and include associated songs
            const playlists = await Playlist.findAll({
                include: {
                    model: Song,
                    as: 'Songs',  // Use the alias defined in the Playlist model
                    through: { attributes: [] }  // Exclude join table attributes
                }
            });
    
            // If no playlists exist, handle the empty state
            if (!playlists || playlists.length === 0) {
                return res.render('playlist', {
                    title: 'MusicPlaylist',
                    currentUrl: req.url,
                    playlists: [],  // Pass an empty array to avoid rendering errors
                    message: 'No playlists available yet.'  // Display a message to the user
                });
            }
    
            // Encrypt playlist IDs
            const encryptedPlaylists = playlists.map(playlist => {
                return {
                    ...playlist.get(),  // Get the plain playlist object
                    id: encrypt(playlist.id.toString()),  // Encrypt the ID
                    songs: playlist.Songs  // Include songs in the playlist
                };
            });
    
            // Render the playlists page
            res.render('playlist', {
                title: 'MusicPlaylist',
                currentUrl: req.url,
                playlists: encryptedPlaylists,
                message: null  // No message, playlists exist
            });
    
        } catch (error) {
            console.error('Error fetching playlists:', error);
            return res.status(500).json({ error: 'An error occurred while fetching playlists.' });
        }
    },

    getjson: async (req, res) => {
        try {
            // Fetch playlists and include their associated songs
            const playlists = await Playlist.findAll({
                include: {
                    model: Song,
                    through: { attributes: [] }, // Exclude join table attributes
                }
            });

            // If no playlists exist, handle the empty state
            if (!playlists || playlists.length === 0) {
                return res.render('playlist', {
                    title: 'MusicPlaylist',
                    currentUrl: req.url,
                    playlists: [],  // Pass an empty array to avoid rendering errors
                    message: 'No playlists available yet.'  // Display a message to the user
                });
            }

            // Encrypt playlist IDs
            const encryptedPlaylists = playlists.map(playlist => {
                return {
                    ...playlist.get(),  // Get the plain playlist object
                    id: encrypt(playlist.id.toString()),  // Encrypt the ID
                    songs: playlist.Songs  // Include songs in the playlist
                };
            });

            // Render the playlists page
            return res.status(200).json({ playlists: encryptedPlaylists });

        } catch (error) {
            console.error('Error fetching playlists:', error);
            return res.status(500).json({ error: 'An error occurred while fetching playlists.' });
        }
    },

    create: async (req, res) => {
        try {
            res.render('createPlaylist', { title: 'MusicPlaylist', currentUrl: req.url })
        } catch (error) {
            console.error('Error creating playlist:', error);
            return res.status(500).json({ error: 'An error occurred while creating the playlist.' });
        }
    },

    post: async (req, res) => {
        try {
            const { name, description, songIds } = req.body;

            const newPlaylist = await Playlist.create({
                name,
                description
            });

            if (songIds && songIds.length > 0) {
                const songs = await Song.findAll({
                    where: {
                        id: songIds
                    }
                });
                await newPlaylist.addSongs(songs);  // Associate the songs with the playlist
            }

            //const encryptedId = encrypt(newPlaylist.id.toString());
            res.redirect('/playlist');

        } catch (error) {
            console.error('Error creating playlist:', error);
            return res.status(500).json({ error: 'An error occurred while creating the playlist.' });
        }
    },

    getList: async (req, res) => {
        try {
            const playlists = await Playlist.findAll({
                include: Song  // Include the associated songs
            });

            const encryptedPlaylists = playlists.map(playlist => {
                return {
                    ...playlist.get(),  // Get the plain playlist object
                    id: encrypt(playlist.id.toString())  // Encrypt the ID
                };
            });
            return res.status(200).json({ error: 'Fetching result was successful.' });
        }
        catch (error) {
            console.error('Error fetching playlists:', error);
            return res.status(500).json({ error: 'An error occurred while fetching playlists.' });
        }
    },

    addToPlaylist: async (req, res) => {
        try {
            // Accessing path parameters and decrypting
            const encryptedPlaylistId = req.params.playlist_id;
            const playlistId = decrypt(encryptedPlaylistId);
    
            const encryptedSongId = req.params.song_id;
            const songId = decrypt(encryptedSongId);
    
            // Fetching the playlist by primary key
            const playlist = await Playlist.findByPk(playlistId);
            if (!playlist) {
                return res.status(404).json({ message: 'Playlist not found' });
            }
    
            // Fetching the song by primary key
            const song = await Song.findByPk(songId);
            if (!song) {
                return res.status(404).json({ message: 'Song not found' });
            }
    
            // Adding the song to the playlist
            await playlist.addSong(song);
    
            res.redirect('/music/local');
            // Sending a success response
            //return res.status(200).json({ message: 'Song added to playlist successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'An error occurred', error: error.message });
        }
    },
    

    show: async (req, res) => {
        try {
            const encryptedId = req.params.id;

            const playlistId = decrypt(encryptedId);
    
            console.log(playlistId);

            const playlist = await Playlist.findOne({
                where: { id: playlistId },
                include: [{
                    model: Song,
                    as: 'Songs'
                }]
            });
    
            if (!playlist) {
                return res.status(404).json({ message: 'Playlist not found' });
            }
            
            console.log(playlist);
            res.render('playlistSongs', { 
                title: 'MusicPlaylist',
                currentUrl: req.url,
                playlists: playlist  // Pass the playlist with its songs
            });
        } catch (error) {
            console.error('Error fetching playlist:', error);
            return res.status(500).json({ error: 'An error occurred while fetching the playlist.' });
        }
    },

    edit: async (req, res) => {
        try {
            const encryptedId = req.params.id;
            const playlistId = decrypt(encryptedId);

            res.render('createPlaylist', { title: 'MusicPlaylist', currentUrl: req.url })
        }
        catch {

        }
    },

    patch: async (req, res) => {
        try {
            const encryptedId = req.params.id;
            const { name, description, songIds } = req.body;
            const playlistId = decrypt(encryptedId);

            const playlist = await Playlist.findOne({ where: { id: playlistId } });

            if (!playlist) {
                return res.status(404).json({ message: 'Playlist not found' });
            }

            // Update playlist fields
            await playlist.update({
                name,
                description
            });

            // Update the associated songs
            if (songIds && songIds.length > 0) {
                const songs = await Song.findAll({
                    where: { id: songIds }
                });
                await playlist.setSongs(songs);  // Update the associated songs
            }

            res.redirect('/playlist');
        } catch (error) {
            console.error('Error updating playlist:', error);
            return res.status(500).json({ error: 'An error occurred while updating the playlist.' });
        }
    },

    delete: async (req, res) => {
        try {
            const encryptedId = req.params.id;
            const playlistId = decrypt(encryptedId);

            const playlist = await Playlist.findOne({ where: { id: playlistId } });

            if (!playlist) {
                return res.status(404).json({ message: 'Playlist not found' });
            }

            await playlist.destroy();  // Delete the playlist
            return res.status(200).json({ message: 'Song successfully save to playlist' });


        } catch (error) {
            console.error('Error deleting playlist:', error);
            return res.status(500).json({ error: 'An error occurred while deleting the playlist.' });
        }
    },
};
module.exports = playlistController;