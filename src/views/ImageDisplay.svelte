<script lang="ts">
  import Konva from "konva";
  import { onDestroy, onMount } from "svelte";
  import Header from "../components/Header.svelte";
  import {
      createImageElement,
      filterSimilarImages,
      getClosestCircle,
      getRandomCircleCoordinates,
      getRandomCoordinates,
      getRippleValue,
      isImageCollision,
  } from "../lib/canvas-tools";
  import {
      collageImageStore,
      currentImageStore,
      imageDataStore,
      rippleStore,
      similarImageStore,
  } from "../lib/stores";

  import { handleInterference } from "../lib/api";

  let stage: Konva.Stage;
  let layer: Konva.Layer;
  let layerOne: Konva.Layer;
  let container: HTMLDivElement;
  let containerWidth: number;
  let containerHeight: number;
  let containerArea: number;
  let initialImages: any[];
  let maxAttempts = 150;

  const getCollageImages = () => {
    collageImageStore.set([]);
    console.log("Current existing images:", $currentImageStore);

    // Remove all shapes from the layer
    layerOne.destroyChildren();

    currentImageStore.update((imageElement) => {
      const filteredElement = imageElement.filter((element) => {
        if (!element.isHighlighted) {
          element.div.remove();
          return false;
        }
        collageImageStore.update((collageImage) => [
          ...collageImage,
          element.image,
        ]);
        return true;
      });

      return filteredElement;
    });

    console.log(`Existing images after picking are ${$currentImageStore}`);

    layerOne.batchDraw();
  };

  const handleCrowd = async (element: any, initialImages: any[]) => {
    console.log("Current images before crowding handling:", $currentImageStore);
    const filteredSimilarImages = $currentImageStore.filter((currentImage) => {
      return (
        !initialImages.includes(currentImage) && !currentImage.isHighlighted
      );
    });

    console.log(
      `Initial images after filter handling are ${filteredSimilarImages}`
    );

    if (filteredSimilarImages.length > 0) {
      const earliestElement = filteredSimilarImages.reduce(
        (earliest, existingImage) => {
          return existingImage.shownTime < earliest.shownTime
            ? existingImage
            : earliest;
        },
        filteredSimilarImages[0]
      );

      console.log(`The earliest image is ${earliestElement.image.name}`);

      const inferenceResult = await handleInterference(
        element.image._id,
        earliestElement.image._id
      );

      if (inferenceResult === true) {
        earliestElement.div.remove();
        console.log(
          `The earliest image ${earliestElement.name} has been moved because of crowd!`
        );
      } else if (inferenceResult === false) {
        element.div.remove();
        console.log(
          `The image ${element.name} to be added has been moved because of crowd!`
        );
      } else {
        element.image = inferenceResult[0];
        element.name = inferenceResult[0].name;
        element.shownTime = new Date().getTime();
        element.updateImage(inferenceResult[0]);
        console.log(
          `An interfered image ${element.name} has been updated because of crowd!`
        );
      }
    }
  };

  const appendRippleImage = (
    image: any,
    randomX: number,
    randomY: number,
    containerArea: number,
    initialImages: any[]
  ) => {
    const element = createImageElement(randomX, randomY, image, layerOne);
    const existingImageArea = $currentImageStore.reduce(
      (sumArea, existingImage) => {
        const { div } = existingImage;
        const width = div.offsetWidth;
        const height = div.offsetHeight;
        return sumArea + width * height;
      },
      0
    );
    container.appendChild(element.div);
    const elementDivWidth = element.div.offsetWidth;
    const elementDivHeight = element.div.offsetHeight;
    const elementArea = elementDivWidth * elementDivHeight;
    const occupiedArea = elementArea + existingImageArea;

    console.log(
      `Existing images before checking crowded are ${$currentImageStore}`
    );

    if (occupiedArea / containerArea > 0.06) {
      console.log(
        "Check if it is crowded:",
        occupiedArea / containerArea > 0.06
      );
      handleCrowd(element, initialImages);
    }
    console.log("Ripple Image added");
    console.log("Ripple Image area", elementArea);
  };

  let generatedRipples: any[];
  let candidateSimilarImageData: any[];
  let isCirclesUpdated = false;
  let isSimilarImagesUpdated = false;
  let step = 0.02;

  const displayRippleImages = (
    step: number,
    containerArea: number,
    initialImages: any[]
  ) => {
    if (isCirclesUpdated && isSimilarImagesUpdated) {
      const rippleCircles = generatedRipples;
      const similarImageData = candidateSimilarImageData;
      const smallestCrv = getRippleValue(rippleCircles, step);

      if (rippleCircles.length !== 0) {
        similarImageData.sort(
          (a, b) => b.similarity.value - a.similarity.value
        );

        const candidateImageData = filterSimilarImages(
          similarImageData,
          $currentImageStore,
          smallestCrv
        );
        console.log(
          `Valid similar images after filtering are ${candidateImageData}`
        );
        similarImageStore.set(candidateImageData);

        console.log("Start Appending");

        $similarImageStore.forEach((image) => {
          let attempts = 0;

          const closetIndex = getClosestCircle(
            image,
            step,
            rippleCircles.length
          );
          const centerX = rippleCircles[closetIndex].x();
          const centerY = rippleCircles[closetIndex].y();

          while (attempts < maxAttempts) {
            const { x: randomX, y: randomY } = getRandomCircleCoordinates(
              centerX,
              centerY,
              rippleCircles[closetIndex].radius()
            );
            if (
              randomX >= 50 &&
              randomX <= containerWidth &&
              randomY >= 50 &&
              randomY <= containerHeight &&
              !isImageCollision(randomX, randomY, $currentImageStore)
            ) {
              appendRippleImage(
                image,
                randomX,
                randomY,
                containerArea,
                initialImages
              );
              break;
            }

            attempts++;
            if (attempts === maxAttempts) {
              console.log(
                "Max attempts reached, unable to find a suitable coordinate."
              );
            }
          }
        });
        console.log(`Existing images after added are ${$currentImageStore}`);
      }

      isCirclesUpdated = false;
      isSimilarImagesUpdated = false;
    }
  };

  onMount(async () => {
    container = document.getElementById(
      "image-display-container"
    ) as HTMLDivElement;
    if (!container) throw new Error("Container not found");

    stage = new Konva.Stage({
      container: container,
      width: container.offsetWidth,
      height: container.offsetHeight,
    });

    let stageBackground = new Konva.Rect({
      width: stage.width(),
      height: stage.height(),
      fill: "#E0F2F1",
    });

    layer = new Konva.Layer();
    layer.add(stageBackground);
    stage.add(layer);

    layerOne = new Konva.Layer();
    stage.add(layerOne);

    containerWidth = container.offsetWidth - 200;
    containerHeight = container.offsetHeight - 200;
    containerArea = container.offsetWidth * container.offsetHeight;

    $imageDataStore.forEach((image) => {
      let attempts = 0;
      while (attempts < maxAttempts) {
        const { x: randomX, y: randomY } = getRandomCoordinates(
          50,
          containerWidth,
          50,
          containerHeight
        );

        if (!isImageCollision(randomX, randomY, $currentImageStore)) {
          const element = createImageElement(randomX, randomY, image, layerOne);
          container.appendChild(element.div);

          break;
        }

        attempts++;
      }
      layerOne.draw();
    });

    initialImages = $currentImageStore;

    let isRippleScheduled = false;

    const rippleImagesSchedule = () => {
      if (!isRippleScheduled) {
        isRippleScheduled = true;
        setTimeout(() => {
          displayRippleImages(step, containerArea, initialImages);
          isRippleScheduled = false;
        }, 0);
      }
    };

    rippleStore.subscribe((value) => {
      generatedRipples = value;
      isCirclesUpdated = true;
      rippleImagesSchedule();
    });

    similarImageStore.subscribe((value) => {
      candidateSimilarImageData = value;
      isSimilarImagesUpdated = true;
      rippleImagesSchedule();
    });
  });

  onDestroy(() => {
    currentImageStore.set([]);
    imageDataStore.set([]);
  });
</script>

<style>
  .canvas-container {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

<div>
  <Header on:clearImages={getCollageImages} showButton={true} />
  <div class="canvas-container" id="image-display-container" />
</div>
