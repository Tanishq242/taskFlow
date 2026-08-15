import Database from 'better-sqlite3';
const db = new Database('taskflow.db');
console.log('database connected!');

db.pragma('foreign_keys = ON');

function createTables() {
    db.exec(`CREATE TABLE IF NOT EXISTS board ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_name VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS column (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        name VARCHAR(10),

        FOREIGN KEY (board_id) REFERENCES board(id)
    );

    CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_id INTEGER NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(150),
        priority VARCHAR(10) NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (column_id) REFERENCES column(id)
    );`)
}

function findColumnId(boardName, columnName) {
    const getBoardId = db.prepare("SELECT id FROM board WHERE board_name = ?");
    const getColumnId = db.prepare("SELECT id FROM column WHERE board_id = ? AND name = ?");

    const board = getBoardId.get(boardName);
    if (!board) return null;

    const column = getColumnId.get(board.id, columnName);
    return column ? column.id : null;
}

export function addBoard(board) {
    const stmt = db.prepare("INSERT INTO board (board_name) VALUES (?)");
    const result = stmt.run(board);

    const insertColumn = db.prepare(
        "INSERT INTO column (board_id, name) VALUES (?, ?)"
    );

    const columns = ["To Do", "In Progress", "Done"];

    for (const name of columns) {
        insertColumn.run(result.lastInsertRowid, name);
    }

    return result.lastInsertRowid;
}

export function addTask(boardName, columnName, title, description, priority) {
    const cid = findColumnId(boardName, columnName);
    const stmt = db.prepare("INSERT INTO task (column_id, title, description, priority) VALUES(?, ?, ?, ?)");
    const result = stmt.run(cid, title, description, priority);
    return result.lastInsertRowid;
}

export function getTask() {
    const rows = db.prepare("SELECT column.name, task.id, task.title, task.description, task.priority, task.created_at FROM column INNER JOIN task ON column.id = task.column_id").all();
    return rows;
}

export function getPriorityBasedTask(priority) {
    const rows = db.prepare("SELECT column.name, task.id, task.title, task.description, task.priority, task.created_at FROM column INNER JOIN task ON column.id = task.column_id WHERE task.priority = ?").all(priority);
    return rows;
}

export function updateTask(id, title, description, priority) {
    const row = db.prepare("SELECT * FROM task WHERE id = ?").get(id);

    if (!row) {
        return null;
    }

    const stmt = db.prepare(`UPDATE task SET title = ?, description = ?, priority = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?`);
    stmt.run(title, description, priority, id);

    return db.prepare("SELECT * FROM task WHERE id = ?").get(id);
}

export function deleteTask(id) {
    const cid = db.prepare("SELECT column_id FROM task WHERE id = ?").get(id);
    const name = db.prepare("SELECT name FROM column WHERE id = ?").get(id);
    const stmt = db.prepare("DELETE FROM task WHERE id = ?");
    stmt.run(id);
    return name;
}

export function getBoards() {
    const result = db.prepare("SELECT * FROM board").all();
    return result;
}

export function getFullBoards(board_name) {
    const result_1 = db.prepare("SELECT id FROM board WHERE board_name = ?").get(board_name);
    const result_2 = db.prepare("SELECT * FROM column WHERE board_id = ?").get(result_1);

    const columnIds = result_2.map((c) => c.id);
    if (columnIds.length === 0) return { ...board, columns: [] };

    const placeholders = columnIds.map(() => "?").join(",");
    const tasks = db.prepare(
        `SELECT * FROM task WHERE column_id IN (${placeholders}) ORDER BY created_at DESC`
    ).all(...columnIds);

    const columnsWithTasks = columns.map((col) => ({
        ...col,
        tasks: tasks.filter((t) => t.column_id === col.id),
    }));

    return { ...board, columns: columnsWithTasks };
}

createTables();

export default db;