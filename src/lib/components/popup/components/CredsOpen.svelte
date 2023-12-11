<script>
     import {list} from "../../../store/ui.store"
     import { selectedCredential } from "../../../store/ui.store"
     import Copy from "../../../../lib/components/basic/copyIcon.svelte"
     import Tick from "../../../../lib/components/basic/tick.svelte"

     let copiedUsername = false;
     let copiedPassword = false;

    function copyOperation(text, boolean){
       navigator.clipboard.writeText(text);
       boolean ? copiedPassword = true : copiedUsername = true
       setTimeout(()=> {
          copiedUsername = copiedPassword = false;
       },2000)
    }
    
</script>



<div class="flex flex-col justify-center items-center w-[80%] h-[300px] my-24 mx-auto bg-[#2B324D] border rounded-md border-[#4C598B4D] text-white">
     <div class="flex justify-end items-center w-3/4">
          {$list[$selectedCredential].username}
          {#if !copiedUsername}
          <span class="mx-4 cursor-pointer transition ease-in-out duration-500 transform hover:scale-110" on:click={()=> {copyOperation($list[$selectedCredential].username, false)}}> <Copy /></span>
          {:else}
          <span class="mx-4 ">
               <Tick/>
          </span>
          {/if}
     </div>
    <div class="flex justify-end items-center w-3/4">
          {$list[$selectedCredential].password}
          {#if !copiedPassword}
          <span class="mx-4 cursor-pointer  transition ease-in-out duration-500 transform hover:scale-110" on:click={()=> {copyOperation($list[$selectedCredential].password, true)}}> <Copy /></span>
          {:else}
          <span class="mx-4">
               <Tick/>
          </span>
          {/if}
    </div> 
</div>