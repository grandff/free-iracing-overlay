pub mod memory;
pub mod mock;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TelemetryHeader {
    pub ver: i32,
    pub status: i32,
    pub tick_rate: i32,
}
