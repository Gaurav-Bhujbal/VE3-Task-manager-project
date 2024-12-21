## Task Management API

A RESTful API built with Node.js, Express, and SQLite for managing user tasks. This API includes authentication using JSON Web Tokens (JWT) and provides CRUD operations for tasks.

## Features

    1.User Authentication:
       • Users can register and log in.
       • JWT is used to secure task-related routes.
    2.Task Management:
       • Add, update, fetch, and delete tasks.
       • Tasks are linked to users by their username.
    3.Database:
       • SQLite database used for persistence.
       • Uses open() method to connect to the SQLite database.

## Installation
    1.clone the repository:
        • git clone https://github.com/Gaurav-Bhujbal/VE3-Task-manager-project.git
    2.Directory:
        • cd VE3-Task-manager-project
    3.Install dependencies:
        • npm install
    4.	Run the server:
        • node index.js
        • The server will start at: http://localhost:3000.

## API Endpoints

## Authentication

Register User

    • POST /auth/register
    • Request Body:

        {
            "username": "testuser",
            "password": "password123"
        }


    • Response:
        {
            "message": "User registered successfully"
        }

Log In

    • POST /auth/login
    • Request Body:
        {
            "username": "testuser",
            "password": "password123"
        }


    • Response:
        {
            "token": "<JWT_TOKEN>",
            "message": "Login successful"
        }

## Task Management (Authenticated)

Get All Tasks

    • GET /tasks
    • Headers:
        Authorization: Bearer <JWT_TOKEN>
    • Response:
        [
            {
                "id": 1,
                "user": "Gaurav",
                "title": "Learn CSS",
                "description": "Understand basics",
                "status": "completed"
            }
        ]

Add Task

    • POST /tasks
    • Headers:
        Authorization: Bearer <JWT_TOKEN>
    • Request Body:
        {
            "title" : "Learn HTML",
            "description" : "Learn HTML elements",
            "status" : "pending"
        }
    • Response:
        {
            "id": 1,
            "message": "Task created successfully"
        }

Update Task

    • PUT /tasks/:id
    • Headers:
        Authorization: Bearer <JWT_TOKEN>
    • Request Body:
        {
            "status": "completed"
        }
    • Response:
        {
            "message": "Task updated successfully"
        }

Delete Task

    • DELETE /tasks/:id
    • Headers:
        Authorization: Bearer <JWT_TOKEN>
    • Response:
        {
            "message": "Task deleted successfully"
        }


## Future Improvements

    • Add password reset functionality.
    • Add pagination to the GET /tasks endpoint.
