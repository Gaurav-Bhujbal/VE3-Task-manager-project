const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = require("path").join(__dirname, "task-managerDB.db");
const bcrypt = require("bcrypt");
const { request } = require("http");
const jwt = require("jsonwebtoken");
const { error } = require("console");

// initiializing Database
let db;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at https://localhost:3000");
    });
  } catch (error) {
    console.log("Error:-", error);
  }
};

initializeDbAndServer();

//Middleware for Authenticate JWT tokens

const authenticateToken = (request, response, next) => {
  const authHeader = request.headers["authorization"];
  if (authHeader === undefined) {
    response.status(401);
    return response.json({ error: "Access denied, no token provided" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secret-key", (error, user) => {
    if (error) {
      response.status(403);
      return response.json({ message: "Invalid token" });
    }
    request.user = user;
    next();
  });
};

//APIs

//Registration api

app.post("/auth/register", async (request, response) => {
  const { username, password } = request.body;
  if (!username || !password) {
    response.status(400);
    return response.send({ error: "Username and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const checkingUserQuery = `
        SELECT *
        FROM users
        WHERE username = '${username}'
    `;
  const isUserFound = await db.get(checkingUserQuery);

  if (isUserFound !== undefined) {
    response.status(400);
    return response.send({ error: "Username already exists" });
  } else {
    const addUserQuery = `
            INSERT INTO users(username,password)
            VALUES ('${username}','${hashedPassword}')
        `;
    const dbResponse = await db.run(addUserQuery);
    response.status(201);
    response.send({ message: "User registered successfully" });
  }
});

//Login api

app.post("/auth/login", async (request, response) => {
  const { username, password } = request.body;

  if (!username || !password) {
    response.status(400);
    return response.send({ error: "Username and Password are required" });
  }

  const checkingLoginUserQuery = `
    SELECT *
    FROM users
    WHERE username = '${username}'
  `;
  const user = await db.get(checkingLoginUserQuery);
  if (user === undefined) {
    response.status(400);
    return response.send({ error: "User not found, Please Register." });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    response.status(401);
    response.send({ error: "Invalid username and password" });
  } else {
    const token = jwt.sign({ username: user.username }, "secret-key", {
      expiresIn: "1h",
    });
    response.status(200);
    response.json({ token, message: "Login successful" });
  }
});

//API Endpoints

//Get all tasks API

app.get("/tasks", authenticateToken, async (request, response) => {
  const { username } = request.user;
  const getTasksQuery = `
      SELECT *
      FROM tasks
      WHERE user = '${username}'
  `;
  const tasks = await db.all(getTasksQuery);
  response.json(tasks);
});

//Add new task API

app.post("/tasks", authenticateToken, async (request, response) => {
  const { title, description, status } = request.body;
  const { username } = request.user;
  if (!title || !description || !status) {
    response.status(400);
    return response.json({ error: "Title, Description, Status are required" });
  }
  const addTaskQuery = `
    INSERT INTO tasks(user,title,description,status)
    VALUES('${username}','${title}','${description}','${status}');
  `;
  const dbResponse = await db.run(addTaskQuery);
  response.json({
    id: dbResponse.lastID,
    message: "Task created successfully",
  });
});

//Get task by Id API

app.get("/tasks/:id", authenticateToken, async (request, response) => {
  const { id } = request.params;
  const getTaskQuery = `
        SELECT *
        FROM tasks
        WHERE id = ${id};
    `;
  const task = await db.get(getTaskQuery);
  if (task === undefined) {
    response.status(400);
    return response.json({ error: "Invalid Id" });
  }
  response.json(task);
});

//Update task by Id API

app.put("/tasks/:id", authenticateToken, async (request, response) => {
  const { id } = request.params;
  const { status } = request.body;
  if (!status) {
    response.status(400);
    return response.json({ message: "Status is required" });
  }

  const findTaskQuery = `
    SELECT * 
    FROM tasks
    WHERE id = ${id};
  `;
  const task = await db.get(findTaskQuery);
  if (task === undefined) {
    response.status(400);
    return response.json({ error: "Task not found" });
  }
  const updateTaskQuery = `
        UPDATE tasks
        SET status = '${status}'
        WHERE id = ${id};
    `;
  const dbResponse = await db.run(updateTaskQuery);
  response.json({ message: "Task updated successfully" });
});

//Remove task by Id API

app.delete("/tasks/:id", authenticateToken, async (request, response) => {
  const { id } = request.params;
  const deleteTaskQuery = `
        DELETE FROM tasks
        WHERE id = ${id};
    `;
  const dbResponse = await db.run(deleteTaskQuery);
  if (dbResponse.changes === 0) {
    response.status(400);
    return response.json({ message: "Task not found" });
  }
  response.json({ message: "Task deleted successfully" });
});
