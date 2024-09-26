const upload = require('../config/multer');
const { Playlist, Song } = require('../models');
const { encrypt, decrypt } = require('../utils/encryption');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const songController = {
post: async (req, res) => {
  try {
    // Full file path on the file system (absolute path)
    const uploadedFilePath = req.file.path;  // This will be something like /path/to/project/public/uploads/songs/filename.mp3
    const fileName = req.file.filename;  // The filename (e.g., sining.mp3)
    
    // Store relative path for accessing the file publicly (relative path)
    const relativeFilePath = path.join('/', 'uploads', 'songs', fileName).replace(/\\/g, '/');  // Convert to a relative path using forward slashes for public access (uploads/songs/filename.mp3)

    // Use music-metadata to extract metadata from the uploaded song
    const metadata = await mm.parseFile(uploadedFilePath);
    const { title, artist, album, genre } = metadata.common || {};

    let artistString = 'Unknown Artist';
    if (Array.isArray(artist)) {
      artistString = artist.join(', ');  // Join array of artists
    } else if (typeof artist === 'string') {
      artistString = artist;  // Use the string directly
    }

    // Save song details and relative file path to the database
    const newSong = await Song.create({
      title: title || 'Unknown Title',
      artist: artistString,
      album: album || 'Unknown Album',
      genre: genre ? genre.join(', ') : 'Unknown Genre',
      filepath: relativeFilePath  // Save the relative path to the database (e.g., uploads/songs/filename.mp3)
    });

    console.log('File uploaded and metadata extracted:', relativeFilePath);
    res.redirect('/music/local');  // Redirect after success

  } catch (err) {
    console.error('Error uploading the file or extracting metadata:', err);
    res.status(500).send('Error uploading the file or extracting metadata.');
  }
},

  create: (req, res) => {
    res.render('uploadSong', { title: 'MusicPlaylist', currentUrl: req.url });
  },

  // Get all Songs and Playlists
  index: async (req, res) => {
    try {
      const songs = await Song.findAll();
      const playlists = await Playlist.findAll(); // Get all playlists
  
      const encryptedSongs = songs.map(song => {
        return {
          ...song.get(),
          id: encrypt(song.id.toString())
        };
      });
  
      res.render('localSongs', { 
        title: 'MusicPlaylist', 
        currentUrl: req.url, 
        songs: encryptedSongs, 
        playlists // Pass playlists to the view
      });
  
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching songs', error: err.message });
    }
  },

  // Get a single Song by ID
  show: async (req, res) => {
    try {
      const songId = req.params.id;
      const song = await Song.findOne({ where: { id: songId } });
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      return res.status(200).json(song);
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching song', error: err.message });
    }
  },

  // Update a Song by ID
  patch: async (req, res) => {
    try {
      const songId = req.params.id;
      const { title, artist, album, genre, filepath } = req.body; // Data from request body
      const song = await Song.findOne({ where: { id: songId } });
      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }
      await song.update({
        title,
        artist,
        album,
        genre,
        filepath
      });
      return res.status(200).json(song);
    } catch (err) {
      return res.status(500).json({ message: 'Error updating song', error: err.message });
    }
  },

  // Delete a Song by ID
  delete: async (req, res) => {
    try {
      const encryptedId = req.params.id;
      const songId = decrypt(encryptedId);

      const song = await Song.findOne({ where: { id: songId } });

      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }

      const filePath = path.join(__dirname, '..', 'public', song.filepath);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${filePath}`, err);
        } else {
          console.log(`File deleted: ${filePath}`);
        }
      });
      
      await song.destroy();
      res.redirect('/music/local');

    } catch (err) {
      return res.status(500).json({ message: 'Error deleting song', error: err.message });
    }
  },

  setFav: async (req, res) => {
    try {
      const encryptedId = req.params.id;
      const songId = decrypt(encryptedId);

      const isFav = true;

      const song = await Song.findOne({ where: { id: songId } });

      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }

      await song.update({
        isFav
      });

      return res.status(200).json({ message: 'Song have been added to favorites' });
    }
    catch (err) {
      return res.status(500).json({ message: 'Error adding song to favorites', error: err.message });
    }
  },

  unsetFav: async (req, res) => {
    try {
      const encryptedId = req.params.id;
      const songId = decrypt(encryptedId);

      const isFav = false;

      const song = await Song.findOne({ where: { id: songId } });

      if (!song) {
        return res.status(404).json({ message: 'Song not found' });
      }

      await song.update({
        isFav
      });

      return res.status(200).json({ message: 'Song have been added to favorites' });
    }
    catch (err) {
      return res.status(500).json({ message: 'Error adding song to favorites', error: err.message });
    }
  },

  getFavAll: async (req, res) => {
    try {
      const songs = await Song.findAll({ where: { isFav: true } });
      let encryptedSongs = [];
      let message = null;
  
      if (songs && songs.length > 0) {
        encryptedSongs = songs.map(song => ({
          ...song.get(),
          id: encrypt(song.id.toString())
        }));
      } else {
        message = 'The listing is empty';
      }
  
      console.log(encryptedSongs);

      res.render('favorites', { 
        title: 'MusicPlaylist', 
        currentUrl: req.url, 
        songs: encryptedSongs, 
        message 
      });
  
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching songs', error: err.message });
    }
  }
};

module.exports = songController;