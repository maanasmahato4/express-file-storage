async function createTable(table) {
    return await pool.query(`
    CREATE TABLE IF NOT EXISTS ${table} (
        public_id TEXT,
        public_url TEXT
    )
`);
};

module.exports = { createTable };