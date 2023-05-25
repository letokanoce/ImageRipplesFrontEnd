<script lang="ts">
  import { Button, Search } from "carbon-components-svelte";
  import ImageSearchAlt from "carbon-icons-svelte/lib/ImageSearchAlt.svelte";
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { searchImages } from "../lib/api";
  import { imageDataStore } from "../lib/stores";

  let inputKeywords: string;

  const search = async () => {
    const query = inputKeywords.split(",").map((item) => item.trim());
    const searchResults = await searchImages(query);

    if (searchResults) {
      imageDataStore.set(searchResults);
      navigate("/images");
    }
  };

  onMount(() => {});
</script>

<style>
  #search-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 60%;
  }
</style>

<div id="search-bar">
  <Search
    bind:value={inputKeywords}
    on:clear={() => console.log("clear")}
    icon={null}
    placeholder="Enter some keywords separated by commas"
  />

  <Button
    on:click={search}
    kind="primary"
    icon={ImageSearchAlt}
    iconDescription="Search for some images"
  />
</div>
