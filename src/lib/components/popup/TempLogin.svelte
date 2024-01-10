<script lang="ts">
    import browser from "webextension-polyfill";
    import Eye from "../basic/eye.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let username = "";
    let password = "";
    let showPassword = false;
    let showVerificationError = false;
    let rsaKey = {};
    let eccKey = {};

    $: type = showPassword ? "text" : "password";

    async function handleSubmit() {
        // verify
        const response = await browser.runtime.sendMessage({
            action: "sign_up_user",
            username: username,
            password: password,
        });
        if (response.isAuthenticated) {
            rsaKey = response.rsaKey;
            eccKey = response.eccKey;
            dispatch("login", { rsaKey, eccKey });
        } else showVerificationError = true;
    }
    function onInput(event) {
        password = event.target.value;
    }
    const togglePassword = () => {
        console.log("toggle password");
        showPassword = !showPassword;
    };
</script>

<form
    class="flex flex-col justify-center items-center"
    on:submit|preventDefault={handleSubmit}
>
    <label for="username">Enter Username</label>
    <div
        class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
    >
        <input
            class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
            type="text"
            id="username"
            bind:value={username}
        />
    </div>

    <label for="password">Enter Password</label>

    <div
        class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
    >
        <input
            class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
            {type}
            id="password"
            on:input={onInput}
        />
        <button
            type="button"
            class="flex justify-center items-center"
            on:click={togglePassword}
        >
            <Eye />
        </button>
    </div>
    {#if showVerificationError}
        <span class="text-xs text-red-500 font-thin"
            >Wrong username or password</span
        >
    {/if}
    <button class="bg-[#4E46DC] py-3 px-7 mt-5 rounded-3xl" type="submit"
        >Submit</button
    >
</form>
