
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;
const secretKey = 'yourSecretKey'; // Replace with a strong secret key

app.use(bodyParser.json());

let todos = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build a REST API', completed: false }
];

let users = [
  { id: 1, username: 'testuser', password: 'password123' } // In a real app, store hashed passwords!
];

let nextUserId = 2;

let nextId = 3;

app.get("/", (_req,res)=>{
  res.status(200).send("Hello, Welcome to Todo list!!!")
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// User registration route
app.post('/auth/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  const newUser = { id: nextUserId++, username, password }; // Again, hash the password in a real app
  users.push(newUser);
  res.status(201).json({ message: 'User registered successfully', user: newUser });
});

// User login route
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ token });
});

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// GET /todos - Get all todos
app.get('/todos', authenticateToken, (req, res) => {

  console.log(req.user)
  res.status(200).json(todos);
});


// GET /todo - Get one todo
app.get('/todos/:id', (req, res) => {
  const {id} = req.params;
  const todo = todos.find(todo => todo.id === parseInt(id));

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  res.status(200).json(todo);
});


// POST /todos - Add a new todo
app.post('/todos',authenticateToken,[
  body('title').notEmpty().withMessage('Title is required'),
  body('completed').isBoolean().withMessage('Completed must be a boolean')
],(req, res) => {

  const errors = validationResult(req);

  // If there are validation errors, return a 400 Bad Request response with the errors.
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const task = req.body; // Extract the 'task' from the request body


  // Basic validation: Check if the 'task' is provided.
  if (!task) {
    // If 'task' is missing, send a 400 Bad Request response with an error message.
    return res.status(400).json({ message: 'Task is required' });
  }

  // Create a new todo object with a unique ID, the provided task, and completed: false.
  const newTodo = {
    id: nextId++, // Assign the next available ID and increment the counter
    title: task.title, // Use the task from the request body
    completed: task.completed // New todos are initially not completed
  };

  // Add the new todo to the todos array.
  todos.push(newTodo);


  // Send a 201 Created response with the newly created todo object.
  res.status(201).json(newTodo);
});

// PUT /todos/:id - Update a todo
app.put('/todos/:id', authenticateToken, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty if provided'),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean if provided')
],(req, res) => {

  
  // Get the todo ID from the URL parameters.
  const todoId = parseInt(req.params.id);
  const { title, completed } = req.body; // Get the updated task and completed status from the request body

  // Find the index of the todo with the matching ID in the todos array.
  const todoIndex = todos.findIndex(todo => todo.id === todoId);

  // Check if the todo was found.
  if (todoIndex === -1) {
    // If the todo is not found, send a 404 Not Found response with an error message.
    return res.status(404).json({ message: 'Todo not found' });
  }

  // Get the existing todo object.
  const todoToUpdate = todos[todoIndex];

  // Update the task if it was provided in the request body.
  if (title !== undefined) {
    todoToUpdate.title = title;
  }

  // Update the completed status if it was provided in the request body.
  if (completed !== undefined) {
    todoToUpdate.completed = completed;
  }

  // Send a 200 OK response with the updated todo object.
  res.status(200).json(todoToUpdate);
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', authenticateToken, (req, res) => {
  // Get the todo ID from the URL parameters.
  const todoId = parseInt(req.params.id);

  // Find the index of the todo with the matching ID.
  const todoIndex = todos.findIndex(todo => todo.id === todoId);

  // Check if the todo was found.
  if (todoIndex === -1) {
    // If the todo is not found, send a 404 Not Found response with an error message.
    return res.status(404).json({ message: 'Todo not found' });
  }

  // Remove the todo from the array using splice.
  const deletedTodo = todos.splice(todoIndex, 1)[0];

  // Send a 200 OK response with a success message and the deleted todo object.
  res.status(200).json({ message: 'Todo deleted successfully', deletedTodo });
});

// Start the server and listen on the specified port.
app.listen(port, () => {
  console.log(`Todo API server listening at http://localhost:${port}`);
});
