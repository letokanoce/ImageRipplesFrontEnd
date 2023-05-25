<script lang="ts">
  import Header from "../components/Header.svelte";
  import { collageImageStore } from "../lib/stores";

  let collageImageData = [];

  collageImageStore.subscribe((value) => {
    collageImageData = value;
  });
</script>

<style>
  .collage-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .collage-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    margin: 10px;
  }
</style>

<div>
  <Header />
  <div class="collage-container">
    {#each collageImageData as collageImage}
      <img
        class="collage-image"
        src={collageImage.address}
        alt={collageImage.name}
      />
    {/each}
  </div>
</div>
