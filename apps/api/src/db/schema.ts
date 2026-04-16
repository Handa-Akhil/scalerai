import { rawQuery } from "./pool";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY,
    owner_id UUID NULL,
    name VARCHAR(160) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_boards_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS board_members (
    board_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (board_id, user_id),
    CONSTRAINT fk_board_members_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY,
    board_id UUID NOT NULL,
    title VARCHAR(160) NOT NULL,
    position DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_lists_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY,
    list_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    due_date TIMESTAMPTZ NULL,
    labels JSONB NOT NULL,
    members JSONB NOT NULL,
    checklist JSONB NOT NULL,
    comments JSONB NOT NULL,
    activity JSONB NOT NULL,
    position DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT fk_cards_list FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
  )`
];

const migrationStatements = [
  `ALTER TABLE boards ADD COLUMN IF NOT EXISTS owner_id UUID NULL`,
  `ALTER TABLE cards ADD COLUMN IF NOT EXISTS labels JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE cards ADD COLUMN IF NOT EXISTS members JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE cards ADD COLUMN IF NOT EXISTS checklist JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE cards ADD COLUMN IF NOT EXISTS comments JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE cards ADD COLUMN IF NOT EXISTS activity JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'fk_boards_owner'
     ) THEN
       ALTER TABLE boards
       ADD CONSTRAINT fk_boards_owner
       FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL;
     END IF;
   END $$`
];

export async function initializeSchema(): Promise<void> {
  for (const statement of schemaStatements) {
    await rawQuery(statement);
  }

  for (const statement of migrationStatements) {
    await rawQuery(statement);
  }
}
