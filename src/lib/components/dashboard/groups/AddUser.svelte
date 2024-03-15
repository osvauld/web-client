<script>
    import { showAddUserDrawer } from "../store";
    import { createUser } from "../apis";
    import { ClosePanel } from "../icons"
    let username = "";
    let name = "";
    let tempPassword = "test@123";
    $: activeButton = username.length >= 3 && name.length >= 3
    
    const submit = async (event) => {
        const payload = {
            username,
            name,
            tempPassword,
        };
        await createUser(payload);
        showAddUserDrawer.set(false);
    };

    const handleClose = () => {
        showAddUserDrawer.set(false);
    }
</script>

<div class="bg-osvauld-frameblack rounded-3xl h-[25rem] w-[23rem] p-6 pt-2">

    <div class="flex justify-between items-center px-4 py-6">
        <p class="text-2xl font-sans font-normal text-osvauld-dusklabel">
          Add new user
        </p>
        <button class="bg-osvauld-frameblack"
          on:click|stopPropagation ={handleClose}><ClosePanel /></button
        >
    </div>
    
    <div class="border border-osvauld-iconblack w-[calc(100%+3rem)] -translate-x-6 my-10 mt-0"></div>

    <form on:submit={submit} class="h-1/2 flex flex-col justify-between items-center">

        <div class="mb-4 w-full">
            <label for="username"   class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer">Username:</label>
            <input id="username" bind:value={username} type="text"  placeholder="Enter username" class="py-1 rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0" required autocomplete="off" />
        </div>

        <div class="mb-4 w-full">
            <label for="name"   class="label block mb-2 text-left text-osvauld-dusklabel text-sm font-normal cursor-pointer">Full Name:</label>
            <input id="name" bind:value={name} type="text"  placeholder="Enter full name here" required class="py-1  rounded-sm items-center text-base bg-osvauld-frameblack border-osvauld-iconblack  w-[95%] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0" autocomplete="off" />
        </div>


        <button class="w-full px-4 py-2 mt-3 border border-osvauld-placeholderblack rounded-md  { activeButton ? "bg-osvauld-carolinablue text-osvauld-ninjablack" : "bg-osvauld-iconblack text-osvauld-sheffieldgrey" }"

         type="submit">Generate password</button>
    </form>
</div>

