const schemaValues = {
    "users": {
        "admin":{
            "name": "Admin User",
            "email": "mimansaj@vconstruct.in",
            "role": "admin",
            "password": "admin123"
        },
        "roles":{
            "admin": "admin",
            "manager": "manager",
            "developer": "developer",
            "tester": "tester"
        },
        "status": {
            "active": "active",
            "inactive": "inactive"
        }
    },
    "story": {
        "status": {
            "backlog": "backlog",
            "in_progress": "in_progress",
            "testing": "testing",
            "done": "done"
        },
        "priority": {
            "low": "low",
            "medium": "medium",
            "high": "high"
        }
    }
}

export default schemaValues;
