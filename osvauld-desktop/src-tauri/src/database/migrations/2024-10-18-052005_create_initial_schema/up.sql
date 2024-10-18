-- Your SQL goes here
CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL
);

CREATE TABLE folders (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    shared BOOLEAN NOT NULL,
    access_type TEXT NOT NULL
);

CREATE TABLE folder_access (
    folder_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    access_type TEXT NOT NULL,
    PRIMARY KEY (folder_id, user_id),
    FOREIGN KEY (folder_id) REFERENCES folders (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE credentials (
    id TEXT PRIMARY KEY NOT NULL,
    credential_type TEXT NOT NULL,
    data TEXT NOT NULL,
    folder_id TEXT NOT NULL,
    signature TEXT NOT NULL,
    permission TEXT NOT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders (id)
);