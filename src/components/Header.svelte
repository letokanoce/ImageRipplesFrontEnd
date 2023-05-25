<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import CicsRegionTarget from "carbon-icons-svelte/lib/CicsRegionTarget.svelte";
  import LogoInstagram from "carbon-icons-svelte/lib/LogoInstagram.svelte";
  import { createEventDispatcher } from "svelte";
  import { navigate } from "svelte-routing";
  export let showButton = false;

  const dispatch = createEventDispatcher();

  const keepHighlightedImages = () => {
    dispatch("clearImages");
  };

  const showCollage = () => {
    navigate("/collage");
  };

  const handleHeaderClick = () => {
    navigate("/");
  };

  const handleHeaderKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleHeaderClick();
    }
  };
</script>

<style>
  h3 {
    font-family: "Mogra";
    color: #fb8c00;
    font-size: 30px;
    padding: 3px 10px 0 10px;
  }

  h4 {
    padding: 5px 15px 0 15px;
    color: #f5f5f5;
    font-family: "Instrument Sans";
  }

  .custom-header {
    background-color: #80cbc4;
    padding: 5px;
    width: 100%;
    height: 25%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  .header-text {
    display: flex;
    gap: 10px;
  }
</style>

<div class="custom-header">
  <div class="header-text">
    <h3 on:click={handleHeaderClick} on:keydown={handleHeaderKeyPress}>
      HELLO!
    </h3>
    <h4>Image Ripples</h4>
  </div>
  <div class="header-button">
    {#if showButton}
      <Button
        size="small"
        icon={CicsRegionTarget}
        iconDescription="Choose"
        on:click={keepHighlightedImages}
      />
      <Button
        size="small"
        icon={LogoInstagram}
        iconDescription="Show Collage"
        on:click={showCollage}
      />
    {/if}
  </div>
</div>
