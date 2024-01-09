import { writable } from "svelte/store";
import { sampleCredential } from "../dtos/credential.dto";
export let selectedPage = writable("Credentials");
export let isLoggedIn = writable(false);
export let isSignedUp = writable(false);
export let list = writable([
  { username: "tony", password: "test@123" },
  { username: "steve", password: "captain@america" },
  { username: "natasha", password: "blackwidow@123" },
  { username: "bruce", password: "hulk123" },
  { username: "clint", password: "hawkeye@123" },
  { username: "thor", password: "godofthunder123" },
  { username: "wanda", password: "scarletwitch@123" },
  { username: "peter", password: "spiderman@123" },
  { username: "logan", password: "wolverine123" },
  { username: "ororo", password: "storm@123" },
  { username: "scott", password: "cyclops123" },
  { username: "jean", password: "phoenix@123" },
  { username: "rhodey", password: "war_machine@123" },
  { username: "vision", password: "synthezoid123" },
  { username: "peterq", password: "starlord@123" },
  { username: "groot", password: "iamgroot123" },
  { username: "rocket", password: "rocketraccoon@123" },
  { username: "gamora", password: "deadliestwoman123" },
  { username: "drax", password: "thedestroyer@123" },
  { username: "mantis", password: "celestialbeing@123" },
  { username: "nick", password: "fury123" },
]);
export let selectedCredential = writable<sampleCredential | null>(null);
export let credOpen = writable(false);
export let showAddCredentialDrawer = writable(false);

export let showAddFolderDrawer = writable(false);
export let showAddGroupDrawer = writable(false);
export let showFolderShareDrawer = writable(false);
export let showCredentialShareDrawer = writable(false);
