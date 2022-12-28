const express = require('express');
const fs = require('fs');
const path = require('path');
const notes = require('./db/db.json');

const uuid = require('./helpers/uuid');

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "/db/db.json"));
});

app.post('/api/notes', (req, res) => {
    let parsedNotes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    let newNote = req.body;
    newNote.id = uuid();
    parsedNotes.push(newNote);
    console.log(parsedNotes);
    fs.writeFile("./db/db.json", JSON.stringify(parsedNotes), (parsedNotes, err) => {
        (err) ? console.log(err) : console.log("note added!");
    });
    res.json(parsedNotes);
});

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

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    let parsedNotes = JSON.parse(fs.readFileSync("./db/db.json", "utf8"));
    console.log(parsedNotes);
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

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => 
    console.log(`Express Server running on http://localhost:${PORT}`)
);