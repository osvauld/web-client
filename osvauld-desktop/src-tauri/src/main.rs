// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use sys_locale::get_locale;

#[command]
fn get_system_locale() -> String {
    get_locale().unwrap_or_else(|| String::from("en-US"))
}

fn main() {
    // Create a new Tauri builder
    let builder = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_system_locale]);

    // Pass the builder to your existing run function
    osvauld_desktop_lib::run_with_builder(builder);
}