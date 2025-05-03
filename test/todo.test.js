const axios = require('axios');
const assert = require('assert');

const API_URL = 'http://localhost:3000/todos';

describe('Todo API Tests', () => {
    let createdTodoId;

    // Test GET all todos
    it('should get all todos', async () => {
        const response = await axios.get(API_URL);
        assert.strictEqual(response.status, 200);
        assert(Array.isArray(response.data), 'Response data should be an array');
    });

    // Test POST a new todo
    it('should create a new todo', async () => {
        const newTodo = { title: 'Test Todo', completed: false };
        const response = await axios.post(API_URL, newTodo);
        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.data.title, newTodo.title);
        assert.strictEqual(response.data.completed, newTodo.completed);
        assert(response.data.id, 'Created todo should have an ID');
        createdTodoId = response.data.id; // Store the ID for later tests
    });

    // Test GET a single todo by ID
    it('should get a single todo by ID', async () => {
        const response = await axios.get(`${API_URL}/${createdTodoId}`);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.id, createdTodoId);
    });

    // Test PUT (update) a todo
    it('should update a todo', async () => {
        const updatedTodo = { title: 'Updated Test Todo', completed: true };
        const response = await axios.put(`${API_URL}/${createdTodoId}`, updatedTodo);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.title, updatedTodo.title);
        assert.strictEqual(response.data.completed, updatedTodo.completed);
        assert.strictEqual(response.data.id, createdTodoId);
    });

    // Test DELETE a todo
    it('should delete a todo', async () => {
        const response = await axios.delete(`${API_URL}/${createdTodoId}`);
        assert.strictEqual(response.status, 200);
        // Optionally, verify that the todo is no longer retrievable
        try {
            await axios.get(`${API_URL}/${createdTodoId}`);
            assert.fail('Todo should have been deleted');
        } catch (error) {
            assert.strictEqual(error.response.status, 404);
        }
    });

    // Test GET a non-existent todo (should return 404)
    it('should return 404 for a non-existent todo', async () => {
        try {
            await axios.get(`${API_URL}/nonexistentid123`);
            assert.fail('Should have returned 404');
        } catch (error) {
            assert.strictEqual(error.response.status, 404);
        }
    });
});