// @generated automatically by Diesel CLI.

diesel::table! {
    credentials (id) {
        id -> Text,
        credential_type -> Text,
        data -> Text,
        folder_id -> Text,
        signature -> Text,
        permission -> Text,
        encrypted_key -> Text,
        updated_at -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    devices (id) {
        id -> Text,
        device_key -> Text,
        updated_at -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    folders (id) {
        id -> Text,
        name -> Text,
        description -> Nullable<Text>,
        shared -> Bool,
        access_type -> Text,
        updated_at -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    sync_records (id) {
        id -> Text,
        resource_id -> Text,
        resource_type -> Text,
        operation_type -> Text,
        folder_id -> Nullable<Text>,
        credential_id -> Nullable<Text>,
        source_device_id -> Text,
        target_device_id -> Text,
        status -> Text,
        updated_at -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Text,
        username -> Text,
        public_key -> Text,
        updated_at -> Text,
        created_at -> Text,
    }
}

diesel::joinable!(credentials -> folders (folder_id));
diesel::joinable!(sync_records -> credentials (credential_id));
diesel::joinable!(sync_records -> folders (folder_id));

diesel::allow_tables_to_appear_in_same_query!(credentials, devices, folders, sync_records, users,);
