CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL,
    username TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE folders (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    shared BOOLEAN NOT NULL,
    access_type TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credentials (
    id TEXT PRIMARY KEY NOT NULL,
    credential_type TEXT NOT NULL,
    data TEXT NOT NULL,
    folder_id TEXT NOT NULL,
    signature TEXT NOT NULL,
    permission TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders (id)
);

CREATE TABLE devices (
    id TEXT PRIMARY KEY NOT NULL,
    device_key TEXT NOT NULL UNIQUE,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sync_records (
    id TEXT PRIMARY KEY NOT NULL,
    resource_id TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('folder', 'credential', 'sync_status')),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'status_change')),
    folder_id TEXT,
    credential_id TEXT,
    source_device_id TEXT NOT NULL,
    target_device_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
    FOREIGN KEY (credential_id) REFERENCES credentials(id) ON DELETE CASCADE
);