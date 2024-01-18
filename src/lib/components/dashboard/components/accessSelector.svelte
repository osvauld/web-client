<script>
   export let user;
   export let handleRoleChange; 
</script>




<div class="absolute top-2 right-7 !z-50 w-[140px] h-[110px] bg-osvauld-frameblack border-osvauld-bordergreen  ml-auto flex flex-col justify-center items-center" >
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-readerOrange text-osvauld-readerText m-1" on:click|stopPropagation={() => handleRoleChange('read', user)}>Read</button>
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-managerPurple text-osvauld-managerText m-1" on:click|stopPropagation={() => handleRoleChange('write', user)}>Write</button>
    <button class="w-full rounded-md cursor-pointer px-2 py-1 bg-osvauld-ownerGreen text-osvauld-ownerText m-1" on:click|stopPropagation={() => handleRoleChange('owner', user)}>Owner</button>
</div>