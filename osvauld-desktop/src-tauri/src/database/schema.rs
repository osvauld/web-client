// @generated automatically by Diesel CLI.

diesel::table! {
    credential_access (id) {
        id -> Text,
        credential_id -> Text,
        user_id -> Text,
        access_type -> Text,
        folder_id -> Text,
        encrypted_key -> Text,
    }
}

diesel::table! {
    credentials (id) {
        id -> Text,
        credential_type -> Text,
        data -> Text,
        folder_id -> Text,
        signature -> Text,
        permission -> Text,
    }
}

diesel::table! {
    folder_access (folder_id, user_id) {
        folder_id -> Text,
        user_id -> Text,
        access_type -> Text,
    }
}

diesel::table! {
    folders (id) {
        id -> Text,
        name -> Text,
        description -> Nullable<Text>,
        shared -> Bool,
        access_type -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Text,
        username -> Text,
        public_key -> Text,
    }
}

diesel::joinable!(credential_access -> credentials (credential_id));
diesel::joinable!(credential_access -> folders (folder_id));
diesel::joinable!(credential_access -> users (user_id));
diesel::joinable!(credentials -> folders (folder_id));
diesel::joinable!(folder_access -> folders (folder_id));
diesel::joinable!(folder_access -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    credential_access,
    credentials,
    folder_access,
    folders,
    users,
);
