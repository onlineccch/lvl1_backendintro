
const express = require('express'); // Import the Express.js framework
const app = express(); // Create an Express application instance
const port = 3000; // Define the port the server will listen on
const bodyParser = require('body-parser');

app.use(bodyParser.json())

let todos = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build a REST API', completed: false }
];

let nextId = 3;

app.get("/", (_req,res)=>{
  res.status(200).send("Hello, Welcome to Todo list!!!")
})

// GET /todos - Get all todos
app.get('/todos', (req, res) => {
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
app.post('/todos', (req, res) => {
  const task = req.body; // Extract the 'task' from the request body

  console.log(task)

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

  console.log("after: "+JSON.stringify(newTodo) )

  // Send a 201 Created response with the newly created todo object.
  res.status(201).json(newTodo);
});

// PUT /todos/:id - Update a todo
app.put('/todos/:id', (req, res) => {
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
app.delete('/todos/:id', (req, res) => {
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
