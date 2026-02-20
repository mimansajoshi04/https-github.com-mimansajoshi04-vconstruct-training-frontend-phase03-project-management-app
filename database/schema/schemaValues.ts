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
            "pending": "pending",
            "in_progress": "in_progress",
            "completed": "completed",
            "not_started": "not_started"
        },
        "priority": {
            "low": "low",
            "medium": "medium",
            "high": "high"
        }
    }
}

export default schemaValues;
