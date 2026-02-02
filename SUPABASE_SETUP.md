# UKLC Lesson Finder - Supabase Setup Guide

## Step 1: Create a Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email (FREE - no credit card needed)

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Fill in:
   - **Name**: uklc-lesson-finder
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose the closest to UK (e.g., "Europe West")
3. Click "Create new project"
4. Wait 2-3 minutes for the project to be created

## Step 3: Create the Database Table

1. In your project, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy and paste this SQL code:

```sql
-- Create the lessons table
CREATE TABLE lessons (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  week TEXT NOT NULL,
  programme TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT,
  pdf_path TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read lessons
CREATE POLICY "Anyone can view lessons"
  ON lessons
  FOR SELECT
  USING (true);

-- Create a policy that allows anyone to insert lessons (you'll control this with admin login in the app)
CREATE POLICY "Anyone can insert lessons"
  ON lessons
  FOR INSERT
  WITH CHECK (true);

-- Create a policy that allows anyone to update lessons
CREATE POLICY "Anyone can update lessons"
  ON lessons
  FOR UPDATE
  USING (true);

-- Create a policy that allows anyone to delete lessons
CREATE POLICY "Anyone can delete lessons"
  ON lessons
  FOR DELETE
  USING (true);
```

4. Click "RUN" (bottom right)
5. You should see "Success. No rows returned"

## Step 4: Get Your API Credentials

1. Click "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. You'll see two important values:
   - **Project URL** (starts with https://)
   - **anon public** key (long string of random characters)
4. **KEEP THESE SAFE** - you'll need them in the next step!

## Step 5: Add Credentials to Your Code

1. Open the file `supabaseClient.js`
2. Replace `YOUR_SUPABASE_URL_HERE` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY_HERE` with your anon public key
4. Save the file

Example:
```javascript
const supabaseUrl = 'https://abcdefghijklm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Step 6: Deploy to Vercel

1. Upload all files to your GitHub repository (including the updated supabaseClient.js)
2. Vercel will automatically redeploy
3. Wait 2-3 minutes

## Step 7: Import Your Existing Lessons

1. On your ORIGINAL computer (the one with 28 lessons):
   - Open the OLD version of the site
   - Login as admin
   - Click "Export"
   - Save the JSON file

2. On the NEW version of the site (with Supabase):
   - Login as admin
   - Click "Import"
   - Upload the JSON file
   - All 28 lessons will be added to Supabase!

## Step 8: Test It!

1. Open the site on Computer A - you should see all lessons
2. Open the site on Computer B - you should see the SAME lessons!
3. Add a lesson on Computer A
4. Refresh on Computer B - the new lesson appears!

## Troubleshooting

**"Failed to load lessons"**
- Check that you copied the URL and key correctly in supabaseClient.js
- Make sure you ran the SQL code to create the table

**"Failed to add lesson"**
- Make sure the SQL policies were created correctly
- Check the browser console (F12) for error messages

**Need help?**
- Supabase docs: https://supabase.com/docs
- Or send me a message!
