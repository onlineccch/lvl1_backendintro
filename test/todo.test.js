const axios = require('axios');
const assert = require('assert');

const API_BASE_URL = 'http://localhost:3000';
const TODO_API_URL = `${API_BASE_URL}/todos`;
const AUTH_API_URL = `${API_BASE_URL}/auth`;

describe('Todo API Tests', () => {
    let createdTodoId;
    let authToken;
    let testUserId;

    // Before all tests, register and login a user
    before(async () => {
        // Register a test user
        const registrationResponse = await axios.post(`${AUTH_API_URL}/register`, {
            username: 'testuser',
            password: 'testpassword',
        });
        assert.strictEqual(registrationResponse.status, 201);
        testUserId = registrationResponse.data.user.id;

        // Login the test user
        const loginResponse = await axios.post(`${AUTH_API_URL}/login`, {
            username: 'testuser',
            password: 'testpassword',
        });
        assert.strictEqual(loginResponse.status, 200);
        authToken = loginResponse.data.token;
    });

    // Helper function to make authenticated requests
    const authRequest = (method, url, data = null) => {
        return axios({
            method,
            url,
            data,
            headers: { Authorization: `Bearer ${authToken}` },
        });
    };

    // Test to get all todos (protected route)
    it('should get all todos when authenticated', async () => {
        const response = await authRequest('get', TODO_API_URL);
        assert.strictEqual(response.status, 200);
        assert(Array.isArray(response.data), 'Response data should be an array');
    });

      // Test POST a new todo (protected route)
    it('should create a new todo when authenticated', async () => {
        const newTodo = { title: 'Test Todo', completed: false };
        const response = await authRequest('post', TODO_API_URL, newTodo);
        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.data.title, newTodo.title);
        assert.strictEqual(response.data.completed, newTodo.completed);
        assert(response.data.id, 'Created todo should have an ID');
        createdTodoId = response.data.id;
    });

    // Test GET a single todo by ID (protected route)
    it('should get a single todo by ID when authenticated', async () => {
        const response = await authRequest('get', `${TODO_API_URL}/${createdTodoId}`);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.id, createdTodoId);
    });

    // Test PUT (update) a todo (protected route)
    it('should update a todo when authenticated', async () => {
        const updatedTodo = { title: 'Updated Test Todo', completed: true };
        const response = await authRequest('put', `${TODO_API_URL}/${createdTodoId}`, updatedTodo);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.title, updatedTodo.title);
        assert.strictEqual(response.data.completed, updatedTodo.completed);
        assert.strictEqual(response.data.id, createdTodoId);
    });

    // Test DELETE a todo (protected route)
    it('should delete a todo when authenticated', async () => {
        const response = await authRequest('delete', `${TODO_API_URL}/${createdTodoId}`);
        assert.strictEqual(response.status, 200);
        // Optionally, verify that the todo is no longer retrievable
        try {
            await authRequest('get', `${TODO_API_URL}/${createdTodoId}`);
            assert.fail('Todo should have been deleted');
        } catch (error) {
            assert.strictEqual(error.response.status, 404);
        }
    });

    // Test GET a non-existent todo (protected route, should return 404)
    it('should return 404 for a non-existent todo when authenticated', async () => {
        try {
            await authRequest('get', `${TODO_API_URL}/nonexistentid123`);
            assert.fail('Should have returned 404');
        } catch (error) {
            assert.strictEqual(error.response.status, 404);
        }
    });

    // Test GET a non-existent todo (should return 404)
    it('should return 404 for a non-existent todo', async () => {
        try {
            await axios.get(`${TODO_API_URL}/nonexistentid123`);
            assert.fail('Should have returned 404');
        } catch (error) {
            assert.strictEqual(error.response.status, 404);
        }
    });
});