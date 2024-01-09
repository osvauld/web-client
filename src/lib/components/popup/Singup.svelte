<script lang="ts">
    import browser from "webextension-polyfill";
    import { writable } from "svelte/store";
    import { isLoggedIn, isSignedUp } from "../../store/ui.store";
    import Eye from "../basic/eye.svelte";

    const username = writable("");
    const password = writable("");
    const passphrase = writable("");
    const confirmPassphrase = writable("");
    const isPasswordVerfied = writable(false);

    let showPassword = false;
    let showVerificationError = false;
    let showPassphraseMismatchError = false;
    let rsaKey = {};
    let eccKey = {};

    function toggleShowPassword() {
        showPassword = !showPassword;
    }

    async function handleSubmit() {
        // verify
        const response = await browser.runtime.sendMessage({
            action: "sign_up_user",
            username: $username,
            password: $password,
        });
        if (response.isAuthenticated) {
            isPasswordVerfied.set(true);
            rsaKey = response.rsaKey;
            eccKey = response.eccKey;
        } else showVerificationError = true;
    }

    const handlePassPhraseSubmit = async () => {
        if ($passphrase === $confirmPassphrase) {
            const response = await browser.runtime.sendMessage({
                action: "save_passphrase",
                passphrase: $passphrase,
                rsaKey,
                eccKey,
            });
            if (response.isSaved) {
                isSignedUp.set(true);
                isLoggedIn.set(true);
            }
        } else showPassphraseMismatchError = true;
    };
</script>

<div
    class="h-auto mt-12 flex justify-center items-center text-base font-bold text-white"
>
    {#if !$isPasswordVerfied}
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
                    bind:value={$username}
                />
            </div>

            <label for="password">Enter Password</label>

            <div
                class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
            >
                {#if showPassword}
                    <input
                        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
                        type="text"
                        id="password"
                        bind:value={$password}
                    />
                {:else}
                    <input
                        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
                        type="password"
                        id="password"
                        bind:value={$password}
                    />
                {/if}
                <button
                    type="button"
                    class="flex justify-center items-center"
                    on:click={toggleShowPassword}
                >
                    <Eye />
                </button>
            </div>
            {#if showVerificationError}
                <span class="text-xs text-red-500 font-thin"
                    >Wrong username or password</span
                >
            {/if}
            <button
                class="bg-[#4E46DC] py-3 px-7 mt-5 rounded-3xl"
                type="submit">Submit</button
            >
        </form>
    {:else}
        <form
            class="flex flex-col justify-center items-center"
            on:submit|preventDefault={handlePassPhraseSubmit}
        >
            <label for="passphrase">Enter Passphrase</label>

            <div
                class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
            >
                {#if showPassword}
                    <input
                        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
                        type="text"
                        id="password"
                        bind:value={$passphrase}
                    />
                {:else}
                    <input
                        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
                        type="password"
                        id="password"
                        bind:value={$passphrase}
                    />
                {/if}
                <button
                    type="button"
                    class="flex justify-center items-center"
                    on:click={toggleShowPassword}
                >
                    <Eye />
                </button>
            </div>
            <label for="passphrase">Confirm Passphrase</label>

            <div
                class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]"
            >
                {#if showPassword}
                    <input
                        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
                        type="text"
                        id="password"
                        bind:value={$confirmPassphrase}
                    />
                {:else}
                    <input
                        class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
                        type="password"
                        id="password"
                        bind:value={$confirmPassphrase}
                    />
                {/if}
                <button
                    type="button"
                    class="flex justify-center items-center"
                    on:click={toggleShowPassword}
                >
                    <Eye />
                </button>
            </div>
            {#if showPassphraseMismatchError}
                <span class="text-xs text-red-500 font-thin"
                    >Passphrase doesn't match</span
                >
            {/if}
            <button
                class="bg-[#4E46DC] py-3 px-7 mt-5 rounded-3xl"
                type="submit">Submit</button
            >
        </form>
    {/if}
</div>
