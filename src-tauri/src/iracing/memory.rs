// iRacing presence probe over the SDK's named shared memory (Local\IRSDKMemMapFileName).
//
// ponytail: opening the mapping is all we need to answer "is iRacing running?", which
// is the only question asked today (the 1Hz connection watcher in main.rs). Mapping a
// view and parsing the irsdk header belongs to M5, when telemetry is actually read —
// writing it now would be unused unsafe code against an API we cannot exercise yet.
//
// NOTE: windows-sys 0.52+ changed HANDLE from `isize` to `*mut c_void` and made
// MapViewOfFile return MEMORY_MAPPED_VIEW_ADDRESS. This file targets 0.59.

#[cfg(windows)]
use windows_sys::Win32::Foundation::{CloseHandle, INVALID_HANDLE_VALUE};
#[cfg(windows)]
use windows_sys::Win32::System::Memory::{OpenFileMappingA, FILE_MAP_READ};

pub struct SharedMemoryReader {
    is_connected: bool,
}

impl SharedMemoryReader {
    pub fn new() -> Self {
        Self {
            is_connected: false,
        }
    }

    /// True while the iRacing sim is running and publishing its telemetry mapping.
    #[cfg(windows)]
    pub fn connect(&mut self) -> bool {
        // NUL-terminated: OpenFileMappingA takes a C string.
        const MAP_NAME: &[u8] = b"Local\\IRSDKMemMapFileName\0";

        let handle = unsafe { OpenFileMappingA(FILE_MAP_READ, 0, MAP_NAME.as_ptr()) };
        // Failure is null; INVALID_HANDLE_VALUE is checked too since the docs are
        // inconsistent about which this API returns.
        if handle.is_null() || handle == INVALID_HANDLE_VALUE {
            self.is_connected = false;
            return false;
        }

        // Probe only — release the handle immediately so we never hold a reference
        // that would keep the sim's mapping alive after it exits.
        unsafe { CloseHandle(handle) };
        self.is_connected = true;
        true
    }

    #[cfg(not(windows))]
    pub fn connect(&mut self) -> bool {
        // macOS/Linux dev: iRacing cannot be running, so the HUD stays hidden and the
        // browser preview (mock engine) is what developers work against.
        self.is_connected = false;
        false
    }

    #[allow(dead_code)]
    pub fn is_connected(&self) -> bool {
        self.is_connected
    }
}

impl Default for SharedMemoryReader {
    fn default() -> Self {
        Self::new()
    }
}
