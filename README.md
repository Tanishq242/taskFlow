# TaskFlow

A small task board app — boards contain columns, columns contain tasks. Built for the TaskFlow take-home assignment.

## Screenshot

![Board view](screenshot\image.png)

## Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite, via better-sqlite3

Frontend and backend live in the same project (not two separate repos), so there's one `npm install` for both.

## Project structure

```
taskFlow/
├── backend/
│   ├── app.js          # Express server + routes
│   ├── database.js     # sqlite connection setup
│   └── taskflow.db      # the actual database file (comes seeded, see below)
├── schema/
│   └── schema.sql        # table definitions
├── src/
│   ├── components/       # content.jsx, header.jsx + matching css
│   ├── App.jsx
│   └── main.jsx
├── UI/
│   └── taskflow-design.html
└── package.json
```

## Running it locally

You need two terminals — the backend and frontend run as separate processes.

**1. Install dependencies (from the project root):**

```
npm install
```

**2. Start the backend** (runs on `http://localhost:3000`):

```
nodemon backend/app.js
```

This project uses a globally installed nodemon rather than a local dev dependency. If you don't have it, either run `npm install -g nodemon` first, or swap the command above for `npx nodemon backend/app.js`. Plain `node backend/app.js` also works if you don't want auto-restart.

**3. Start the frontend** (runs on `http://localhost:5173`):

```
npm run dev
```

**4. Open** `http://localhost:5173` in your browser.

The database file (`backend/taskflow.db`) already ships with a board and some sample columns/tasks in it, so you should see data immediately — no separate seed step needed.

## Database

Schema lives in `schema/schema.sql`. Three tables:

- **board** — `id`, `board_name`
- **board_column** — `id`, `board_id` (FK → board), `name`
- **task** — `id`, `column_id` (FK → board_column), `title`, `description`, `priority`, `created_at`

A column belongs to one board, a task belongs to one column — a task's column *is* its status, so there's no separate status field. `title` and `priority` are `NOT NULL`; `description` is optional, matching the brief.

I went with `board_column` instead of `column` as the table name since `column` is a reserved word in SQL and it's not worth the quoting headache everywhere it's referenced.

### Queries worth pointing out

<!-- TODO: paste the actual SQL / query-builder code for these two here, with a line on what each does — e.g.:
"Count of tasks per column on a board" — used for the column headers:
```sql
...
```
"Tasks with a given priority, newest first":
```sql
...
```
-->

## What's implemented

- View a board with its columns and tasks
- Create / edit / delete a task
- Filter tasks by priority
- Everything persists in SQLite — reloading the page doesn't lose anything

**Not done / skipped on purpose:**

- Drag-and-drop
- Change the task into column
- Text search by title
- Backend tests

## Decisions & assumptions

- Column names (like "To Do", "In Progress") aren't unique across the whole app — different boards can reuse the same column names, since each column is tied to a specific `board_id`.
- Instead of a separate seed script, I committed the SQLite file itself with a board and a few tasks already in it, so a fresh clone isn't empty on first run.
- The one stretch goal I'd pick if I had time left over would probably be text search by title, since it's the smallest addition of the three options.

## What I'd do with more time

Backend tests were the first thing I cut given the time budget — I'd add those first, especially around the title validation and the move-task endpoint, since those are the two things most likely to break silently. After that, text search by title, and getting this deployed somewhere so it's not just a local link.

## Something I looked up while building this

<!-- TODO: one line here — whatever you actually looked up or found interesting. Don't skip this one, it's an easy point in the write-up and shouldn't be generic. -->

## Time spent

About 18 hours total.

## Repo

<!-- TODO: link to your public (or invite-accessible) git repo -->
