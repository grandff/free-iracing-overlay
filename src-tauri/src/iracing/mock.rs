// ponytail: cross-platform 60Hz tick generator for dev testing
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MockTick {
    pub tick_id: u64,
    pub speed_kmh: f32,
    pub rpm: i32,
    pub gear: i32,
}

pub struct MockGenerator {
    tick_count: u64,
}

impl MockGenerator {
    pub fn new() -> Self {
        Self { tick_count: 0 }
    }

    pub fn next_tick(&mut self) -> MockTick {
        self.tick_count += 1;
        let t = (self.tick_count as f32) * 0.0166;
        MockTick {
            tick_id: self.tick_count,
            speed_kmh: 220.0 + (t.sin() * 15.0),
            rpm: 10500 + ((t * 2.0).sin() * 1200.0) as i32,
            gear: 5,
        }
    }
}
