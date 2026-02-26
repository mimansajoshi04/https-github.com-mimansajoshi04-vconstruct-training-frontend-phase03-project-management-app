const dbSchema = {
  name: "project-management-app",
  version: 1,
  objectStores: [
    // users
    {
      name: "users",
      options: { keyPath: "id", autoIncrement: true },
      indexes: [
        { name: "id", keyPath: "id", options: { unique: true } },
        { name: "name", keyPath: "name", options: { unique: false } },
        { name: "email", keyPath: "email", options: { unique: true } },
        { name: "role", keyPath: "role", options: { unique: false } },
        { name: "password", keyPath: "password", options: { unique: false } },
        { name: "avatar_color", keyPath: "avatar_color", options: { unique: false } },
      ],
    },
    // projects
    {
      name: "projects",
      options: { keyPath: "id", autoIncrement: true },
      indexes: [
        { name: "id", keyPath: "id", options: { unique: true } },
        { name: "name", keyPath: "name", options: { unique: false } },
        {
          name: "description",
          keyPath: "description",
          options: { unique: false },
        },
        {
          name: "created_by",
          keyPath: "created_by",
          options: { unique: false },
        },
        {
          name: "created_at",
          keyPath: "created_at",
          options: { unique: false },
        },
        {
          name: "updated_at",
          keyPath: "updated_at",
          options: { unique: false },
        },
        {
          name: "start_date",
          keyPath: "start_date",
          options: { unique: false },
        },
        {
          name: "deadline_date",
          keyPath: "deadline_date",
          options: { unique: false },
        },
      ],
    },
    // story
    {
      name: "story",
      options: { keyPath: "id", autoIncrement: true },
      indexes: [
        { name: "id", keyPath: "id", options: { unique: true } },
        { name: "title", keyPath: "title", options: { unique: false } },
        {
          name: "description",
          keyPath: "description",
          options: { unique: false },
        },
        { name: "status", keyPath: "status", options: { unique: false } },
        { name: "priority", keyPath: "priority", options: { unique: false } },
        {
          name: "created_at",
          keyPath: "created_at",
          options: { unique: false },
        },
        {
          name: "updated_at",
          keyPath: "updated_at",
          options: { unique: false },
        },
        { name: "due_date", keyPath: "due_date", options: { unique: false } },
        {
          name: "project_id",
          keyPath: "project_id",
          options: { unique: false },
        },
        { name: "user_id", keyPath: "user_id", options: { unique: false } },
      ],
    },
    // assignments
    {
      name: "project_user_relation",
      options: { keyPath: "id", autoIncrement: true },
      indexes: [
        { name: "id", keyPath: "id", options: { unique: true } },
        { name: "user_id", keyPath: "user_id", options: { unique: false } },
        {
          name: "project_id",
          keyPath: "project_id",
          options: { unique: false },
        },
        {
          name: "assigned_at",
          keyPath: "assigned_at",
          options: { unique: false },
        },
      ],
    },
  ],
};

export default dbSchema;
