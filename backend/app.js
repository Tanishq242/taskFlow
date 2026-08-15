import express from "express";
import cors from "cors";
import db, { addBoard, addTask, getTask, getPriorityBasedTask, updateTask, deleteTask, getBoards, getFullBoards } from './database.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello from Server!!!")
})


app.post('/addboard', (req, res) => {
    console.log(req.body);
    const { boardname } = req.body;

    if (!boardname) {
        return res.status(400).json({ message: 'board_name is required' });
    }

    const id = addBoard(boardname);
    res.status(201).json({ id });
});


app.post('/addtask', (req, res) => {
    console.log(req.body);

    const { title, description, priority, column, board_name } = req.body;

    if (!title && !description && !priority && !column && !board_name) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const id = addTask(board_name, column, title, description, priority);

    res.json({ id: id });
})

app.get('/task', (req, res) => {
    res.json(getTask());
})

app.get('/task/:priority', (req, res) => {
    const { priority } = req.params;
    res.json(getPriorityBasedTask(priority));
})

app.put("/task/update/:id", (req, res) => {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    const updated = updateTask(id, title, description, priority);

    if (!updated) {
        return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updated);
})

app.delete('/task/delete/:id', (req, res) => {
    const { id } = req.params;
    const result = deleteTask(id);

    res.json({message: result});
})

app.get("/getTasks/:board", (req, res) => {
    const { board } = req.params;

    if (!board) {
        return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(getFullBoards(board));
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})