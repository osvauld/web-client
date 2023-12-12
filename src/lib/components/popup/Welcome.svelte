<script>
    import { writable } from 'svelte/store';
    import {isLoggedIn} from "../../store/ui.store"
    import Eye from "../basic/eye.svelte"
  
    const passphrase = writable('');
  
    const hardcodedPassword = "wonderwomen"; 

    let showPassword = false;
    let errorMessage = false;

    function toggleShowPassword() {
    showPassword = !showPassword;
    }
    async function handleSubmit() {
      const enteredPassphrase = $passphrase;
      if (enteredPassphrase === hardcodedPassword) {
        isLoggedIn.set(true);
        console.log('isLoggedIn set to true');
      } else {
        errorMessage = true;
      }
    }
  </script>
  
  <div class="h-auto mt-12 flex justify-center items-center text-base font-bold text-white">
    <form class="flex flex-col justify-center items-center" on:submit|preventDefault={handleSubmit}>
      <label for="passphrase">Enter Passphrase</label>
  
      <div class="flex bg-[#2E3654] px-3 mt-4 border rounded-3xl border-[#4C598B4D]">
                {#if showPassword}
                <input class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0" type="text" id="passphrase" bind:value={$passphrase} />
            {:else}
                <input class="text-white bg-[#2E3654] border-0 tracking-wider font-normal border-transparent focus:border-transparent focus:ring-0" type="password" id="passphrase" bind:value={$passphrase} />
            {/if}
            <button type="button" class="flex justify-center items-center" on:click={toggleShowPassword}>
                <Eye />
            </button>
      </div>
      {#if errorMessage}
      <span class="text-xs text-red-500 font-thin">Passphrase doesn't match</span>
      {/if}
      <button class="bg-[#4E46DC] py-3 px-7 mt-5 rounded-3xl" type="submit">Submit</button>
    </form>
  </div>
  