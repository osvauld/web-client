<script lang="ts">
    import Eye from "../basic/icons/eye.svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let privateKeys = "";
    let passphrase = "";
    let showPassword = false;

    function togglePasswordVisibility() {
        showPassword = !showPassword;
    }

    function handleInputChange(event, field) {
        if (field === "privateKey") {
            privateKeys = event.target.value;
        } else if (field === "passphrase") {
            passphrase = event.target.value;
        }
    }

    function handleSubmit() {
        dispatch("submit", { privateKeys, passphrase });
    }
</script>

<div class="flex flex-col justify-center items-center">
    <label for="privateKey" class="font-normal mt-6">Enter Private Key</label>
    <textarea
        class="text-white bg-osvauld-frameblack border border-osvauld-iconblack tracking-wider font-normal focus:ring-0"
        id="privateKey"
        on:input={(e) => handleInputChange(e, "privateKey")}
    />

    <label for="passphrase" class="font-normal mt-6">Enter Passphrase</label>
    <div
        class="flex bg-osvauld-frameblack px-3 mt-4 border rounded-lg border-osvauld-iconblack"
    >
        <input
            class="text-white bg-osvauld-frameblack border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0"
            type={showPassword ? "text" : "password"}
            id="passphrase"
            on:input={(e) => handleInputChange(e, "passphrase")}
        />

        <button
            type="button"
            class="flex justify-center items-center"
            on:click={togglePasswordVisibility}
        >
            <Eye />
        </button>
    </div>
    <button
        class="bg-osvauld-carolinablue py-2 px-10 mt-8 rounded-lg text-osvauld-ninjablack font-medium w-[150px] flex justify-center items-center whitespace-nowrap"
        type="button"
        on:click={handleSubmit}
    >
        <span>Submit</span>
    </button>
</div>
