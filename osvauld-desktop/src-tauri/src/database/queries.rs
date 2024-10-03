use log::info;
use serde::{Deserialize, Serialize};
use surrealdb::engine::local::Db;
use surrealdb::sql::Thing;
use surrealdb::Surreal;

#[derive(Debug, Serialize, Deserialize)]
struct TestRecord {
    id: Option<Thing>,
    name: String,
    value: i32,
}

pub async fn run_test_query(db: &Surreal<Db>) -> Result<(), String> {
    let test_record = TestRecord {
        id: None,
        name: "Test Record".to_string(),
        value: 42,
    };

    let created: Option<TestRecord> = db
        .create("test_records")
        .content(test_record)
        .await
        .map_err(|e| format!("Failed to insert test record: {}", e))?;

    match created {
        Some(record) => {
            info!(
                "Test record inserted successfully: id={:?}, name={}, value={}",
                record.id, record.name, record.value
            );
            Ok(())
        }
        None => Err("Failed to retrieve inserted test record".to_string()),
    }
}
