<script>
    import { showAddUserDrawer } from "../store";
    import { createUser } from "../apis";
    let username = "";
    let name = "";
    let tempPassword = "";
    const submit = async (event) => {
        const payload = {
            username,
            name,
            tempPassword,
        };
        await createUser(payload);
        showAddUserDrawer.set(false);
    };
</script>

<div class="bg-macchiato-base">
    <form on:submit={submit}>
        <label for="username">Username:</label>
        <input id="username" bind:value={username} type="text" required />

        <label for="name">Name:</label>
        <input id="name" bind:value={name} type="text" required />

        <label for="password">Password:</label>
        <input
            id="password"
            bind:value={tempPassword}
            type="password"
            required
        />

        <button type="submit">Submit</button>
    </form>
</div>
