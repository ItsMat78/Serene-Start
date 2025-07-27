// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn set_interactive(window: Window) {
    window.set_ignore_cursor_events(false).unwrap();
}

#[tauri::command]
fn set_ignore(window: Window) {
    window.set_ignore_cursor_events(true).unwrap();
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();
            // This is the magic that makes it feel like part of the desktop!
            main_window.set_always_on_top(true);
            main_window.set_skip_taskbar(true).unwrap();
            main_window.set_decorations(false).unwrap();
            main_window.set_transparent(true);
            main_window.set_ignore_cursor_events(true).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, set_interactive, set_ignore])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
