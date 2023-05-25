<script lang="ts">
  import Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import { rippleStore } from "../lib/stores";

  export let rippleX: number;
  export let rippleY: number;
  export let strength: number;
  export let imageWidth: number;
  export let imageHeight: number;
  export let layer: Konva.Layer;
  let circles = [];

  onMount(() => {
    const container = document.getElementById(
      "image-display-container"
    ) as HTMLDivElement;
    if (!container) throw new Error("Container not found");

    const imageDiagonal = Math.sqrt(imageWidth ** 2 + imageHeight ** 2);
    const numRippleLines = Math.ceil(strength * 10);
    const intervalRadius = imageWidth * 1.01;

    for (let i = 1; i < numRippleLines; i++) {
      const radius = (imageDiagonal / 2 + i * intervalRadius) * 1.01;

      const circle = new Konva.Circle({
        x: rippleX,
        y: rippleY,
        radius,
        stroke: "#00E5FF",
        strokeWidth: 4 - 0.4 * i,
        opacity: 0.6,
      });

      circles.push(circle);
      layer.add(circle);
    }

    rippleStore.set(circles);
    layer.draw();
  });

  onDestroy(() => {
    rippleStore.set([]);
  });
</script>
