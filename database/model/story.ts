import dbSchema from "../schema/schema";

interface StoryType {
  id?: number;
  title: String;
  description: String;
  status: String;
  priority: String;
  created_at: Date;
  updated_at: Date;
  due_date: Date;
  userId: number;
  projectId: number;
}

export { type StoryType };
