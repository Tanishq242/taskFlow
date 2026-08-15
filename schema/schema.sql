CREATE TABLE
    IF NOT EXISTS board (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_name VARCHAR(50) NOT NULL
    );

CREATE TABLE
    IF NOT EXISTS column (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        name VARCHAR(10),
        FOREIGN KEY (board_id) REFERENCES board (id)
    );

CREATE TABLE
    IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        column_id INTEGER NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(150),
        priority VARCHAR(10) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (column_id) REFERENCES column (id)
    );