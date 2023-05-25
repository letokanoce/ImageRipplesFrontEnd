<script lang="ts">
  import { Button } from "carbon-components-svelte";
  import WatsonHealthAiResultsHigh from "carbon-icons-svelte/lib/WatsonHealthAiResultsHigh.svelte";
  import Konva from "konva";
  import { createEventDispatcher, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import Ripple from "../components/Ripple.svelte";
  import { findSimilarImages } from "../lib/api";
  import { similarImageStore } from "../lib/stores";

  export let image: any;
  export let layer: Konva.Layer;
  let ripple: Ripple | null = null;
  const dispatch = createEventDispatcher();

  // Image state interface
  interface ImageState {
    isHighlighted: boolean;
    buttonKind: "ghost" | "primary";
  }

  // Image state store
  const state = writable<ImageState>({
    isHighlighted: false,
    buttonKind: "ghost",
  });

  // Toggle highlighting function
  const toggleHighlighting = () => {
    state.update((current) => {
      const newState: ImageState = {
        ...current,
        isHighlighted: !current.isHighlighted,
        buttonKind: current.isHighlighted ? "ghost" : "primary",
      };

      // Dispatch lock or unlock event based on highlighting state
      dispatch(newState.isHighlighted ? "lock" : "unlock", image);

      return newState;
    });
  };

  const handleClick = async (event: MouseEvent) => {
    console.log("Image Clicked");
    const { target } = event;
    const { width, height, left, top } = (
      target as HTMLImageElement
    ).getBoundingClientRect();

    // Calculate the geometric center of the image
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Calculate the ripple position
    const x = centerX;
    const y = centerY - height / 2;

    // Remove the previous ripple if it exists
    if (ripple) {
      ripple.$destroy();
    }
    // Create the Ripple component
    ripple = new Ripple({
      target: document.body,
      props: {
        rippleX: x,
        rippleY: y,
        strength: image.strength,
        imageWidth: width,
        imageHeight: height,
        layer: layer,
      },
    });

    const similarImgs = await findSimilarImages(image._id);
    if (similarImgs.length === 0) {
      alert("No similar images have been founded!");
    }
    similarImageStore.set(similarImgs);
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") handleClick(event as any);
  };

  onDestroy(() => {
    if (ripple) {
      ripple.$destroy();
    }
  });
</script>

<style>
  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin: 0.2em;
    cursor: pointer;
  }

  #image-card {
    border: none;
    background-color: #90a4ae;
  }

  #highlight-button {
    position: absolute;
    top: 0;
    right: 0;
  }
</style>

<div id="image-card">
  <img
    src={image.address}
    alt={image.name}
    on:click={handleClick}
    on:keydown={handleKeyPress}
  />
  <div id="highlight-button">
    <Button
      size="small"
      kind={$state.buttonKind}
      iconDescription="Highlighting"
      icon={WatsonHealthAiResultsHigh}
      on:click={toggleHighlighting}
    />
  </div>
</div>
