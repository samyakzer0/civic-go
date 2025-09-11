# Task Assignment Feature Setup

## Overview
The task assignment feature allows admins to create and manage tasks for specific reports. Tasks are visible to all admins but filtered by their assigned categories.

## Database Setup

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to create the `report_tasks` table:

```sql
-- First, check if the table exists and what its structure is
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'report_tasks' 
ORDER BY ordinal_position;

-- If the table doesn't exist or has issues, drop and recreate it
DROP TABLE IF EXISTS report_tasks CASCADE;

CREATE TABLE report_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id VARCHAR NOT NULL,
  task_description TEXT NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  category VARCHAR NOT NULL,
  priority VARCHAR DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status VARCHAR DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_report_tasks_report_id ON report_tasks(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tasks_category ON report_tasks(category);
CREATE INDEX IF NOT EXISTS idx_report_tasks_assigned_to ON report_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_report_tasks_status ON report_tasks(status);
CREATE INDEX IF NOT EXISTS idx_report_tasks_priority ON report_tasks(priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_report_tasks_updated_at
  BEFORE UPDATE ON report_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test task to verify the table works
INSERT INTO report_tasks (
  report_id, 
  task_description, 
  assigned_by, 
  category, 
  priority, 
  status, 
  notes
) VALUES (
  'CG-RD-20241201-TEST', 
  'Test task to verify table functionality', 
  (SELECT id FROM auth.users LIMIT 1),
  'Roads', 
  'Medium', 
  'Pending', 
  'This is a test task'
);

-- Verify the insertion worked
SELECT * FROM report_tasks WHERE report_id = 'CG-RD-20241201-TEST';
```

### Option 2: Browser Console (Alternative)
1. Login to your app as an admin
2. Open browser console (F12)
3. Copy and paste the contents of `src/scripts/create_report_tasks_table.js`
4. Press Enter to execute

## Features

### For Admins:
- **Task Creation**: Add tasks to any report with description, priority, due date, and notes
- **Task Management**: Update task status (Pending → In Progress → Completed)
- **Task Overview**: View all tasks across assigned categories in the Task Management tab
- **Category Filtering**: Tasks are automatically filtered by admin's assigned categories
- **Priority System**: Low, Medium, High, Urgent priority levels
- **Due Date Tracking**: Set and track task deadlines
- **Status Tracking**: Monitor task progress with visual indicators

### Task Properties:
- **Description**: What needs to be done
- **Priority**: Low, Medium, High, Urgent
- **Status**: Pending, In Progress, Completed, Cancelled
- **Due Date**: Optional deadline
- **Notes**: Additional context or instructions
- **Category**: Automatically set based on report category
- **Assigned By**: Admin who created the task

## Usage

1. **Access Task Management**:
   - Login as admin
   - Go to Admin Dashboard
   - Click on "Task Management" tab

2. **Create Tasks**:
   - Go to Category Management
   - Select a category
   - Click on a report to view details
   - Click "Add Task" button
   - Fill in task details and submit

3. **Manage Tasks**:
   - View tasks in report details
   - Update status using action buttons
   - Delete tasks if needed

4. **Monitor Progress**:
   - Use Task Management tab for overview
   - View statistics by category
   - Track overdue tasks

## Development Notes

- The system works with both Supabase and localStorage fallbacks
- Tasks are automatically filtered by admin category permissions
- Real-time updates when task status changes
- Responsive design works on mobile and desktop
- Dark/light theme support

## Troubleshooting

- **Table not found**: Run the SQL setup script in Supabase dashboard
- **Tasks not loading**: Check browser console for errors
- **Permission issues**: Ensure admin has correct category assignments
- **Data not persisting**: Check Supabase connection and environment variables
