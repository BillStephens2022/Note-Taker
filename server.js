// import node modules
const express = require('express');
const fs = require('fs');
const path = require('path');

//import notes json file used for saving notes
const notes = require('./db/db.json');

// NPM uuid package - adds a random ID to each note object.
const { v4: uuidv4 } = require('uuid');

// definite local host port to use
const PORT = process.env.PORT || 3001;

// create instance of Express
const app = express();

// middleware to be used
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// handles GET requests at home route.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// handles GET requests for 'notes' route.
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

// handles GET requests for the 'api/notes' route which will display all of the note objects in json format
app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "/db/db.json"));
});

// handles POST requests for new notes added by user.
app.post('/api/notes', (req, res) => {
    let parsedNotes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    let newNote = req.body;
    newNote.id = uuidv4();
    parsedNotes.push(newNote);
    fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (parsedNotes, err) => {
        (err) ? console.log(err) : console.log("note added!");
    });
    res.json(parsedNotes);
});

// handles request to see specific note objects by unique note ID.
app.get('/api/notes/:id', (req, res) => {
    if (req.params.id) {
        console.info(`${req.method} request received to get a single note`);
        const noteId = req.params.id;
        let parsedNotes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
        for (let i = 0; i < parsedNotes.length; i++) {
          const currentNote = parsedNotes[i];
          if (currentNote.id === noteId) {
            res.status(200).json(currentNote);
            return;
          }
        }
        res.status(404).send('Note not found');
      } else {
        res.status(400).send('Note ID not provided');
      }
});

// handles DELETE requests made by the user to delete specific notes.
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    let parsedNotes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    for (let i = 0; i < parsedNotes.length; i++) {
        const currentNote = parsedNotes[i];
        if (currentNote.id === noteId) {
        console.log("request received to delete note: " + noteId + " with index of " + i);
        parsedNotes.splice(i, 1);
        fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (parsedNotes, err) => {
            (err) ? console.log(err) : console.log("note deleted!");
        })
        }
    }
    res.json(notes);   
    });

// handles any other GET request made by the user - will automatically display home page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// sets up server to listen on PORT which was defined above as port 3001.
app.listen(PORT, () => 
    console.log(`Express Server running on http://localhost:${PORT}`)
);