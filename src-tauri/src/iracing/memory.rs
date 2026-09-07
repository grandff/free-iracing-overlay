// ponytail: direct zero-copy Windows Shared Memory mapping (Local\IRSDKMemMapFileName)

#[cfg(windows)]
use windows_sys::Win32::Foundation::{CloseHandle, HANDLE, INVALID_HANDLE_VALUE};
#[cfg(windows)]
use windows_sys::Win32::System::Memory::{
    MapViewOfFile, OpenFileMappingA, UnmapViewOfFile, FILE_MAP_READ,
};

pub struct SharedMemoryReader {
    #[cfg(windows)]
    handle: HANDLE,
    #[cfg(windows)]
    buffer_ptr: *const u8,
    is_connected: bool,
}

impl SharedMemoryReader {
    pub fn new() -> Self {
        Self {
            #[cfg(windows)]
            handle: 0 as HANDLE,
            #[cfg(windows)]
            buffer_ptr: std::ptr::null(),
            is_connected: false,
        }
    }

    #[cfg(windows)]
    pub fn connect(&mut self) -> bool {
        unsafe {
            let map_name = b"Local\\IRSDKMemMapFileName\0";
            let handle = OpenFileMappingA(FILE_MAP_READ, 0, map_name.as_ptr());
            if handle == 0 || handle == INVALID_HANDLE_VALUE {
                self.is_connected = false;
                return false;
            }

            let view = MapViewOfFile(handle, FILE_MAP_READ, 0, 0, 0);
            if view.is_null() {
                CloseHandle(handle);
                self.is_connected = false;
                return false;
            }

            self.handle = handle;
            self.buffer_ptr = view as *const u8;
            self.is_connected = true;
            true
        }
    }

    #[cfg(not(windows))]
    pub fn connect(&mut self) -> bool {
        // Fallback for macOS/Linux dev environments
        self.is_connected = false;
        false
    }

    pub fn is_connected(&self) -> bool {
        self.is_connected
    }
}

impl Drop for SharedMemoryReader {
    fn drop(&mut self) {
        #[cfg(windows)]
        unsafe {
            if !self.buffer_ptr.is_null() {
                UnmapViewOfFile(self.buffer_ptr as *const _);
            }
            if self.handle != 0 && self.handle != INVALID_HANDLE_VALUE {
                CloseHandle(self.handle);
            }
        }
    }
}
