import ImageCard from "../components/ImageCard.svelte";
import { currentImageStore, imageDataStore } from "../lib/stores";

// Check if the given coordinates are in collision with existing images
export const isImageCollision = (
    x: number,
    y: number,
    existingImageElements: any[]
): boolean => {
    for (let i = 0; i < existingImageElements.length; i++) {
        const existingImageDiv = existingImageElements[i].div;
        const xDiff = Math.abs(existingImageDiv.offsetLeft - x);
        const yDiff = Math.abs(existingImageDiv.offsetTop - y);

        if (xDiff < 200 && yDiff < 200) {
            return true;
        }
    }

    return false;
};

export const getRippleValue = (rippleCircles: any[], step: number) => {
    const smallestCsv = 0.95 - step * (rippleCircles.length - 1);
    const smallestCrv =
        Math.round(smallestCsv * Math.pow(10, 2)) / Math.pow(10, 2);

    return smallestCrv;
};

export const getRandomCoordinates = (minX: number, maxX: number, minY: number, maxY: number) => {
    const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

    return { x, y };
}

export const getRandomCircleCoordinates = (centerX: number, centerY: number, radius: number) => {
    const randomAngle = Math.random() * 2 * Math.PI;
    const x = centerX + Math.cos(randomAngle) * radius;
    const y = centerY + Math.sin(randomAngle) * radius;

    return { x, y };
}

export const getClosestCircle = (candidateImage: any, step: number, circleNums: number) => {
    let closestI = null;
    let closestDiff = null;

    for (let i = 0; i < circleNums; i++) {
        const currentValue = 0.95 - step * i;
        const diff = Math.abs(currentValue - candidateImage.similarity.value);

        if (closestDiff === null || diff < closestDiff) {
            closestI = i;
            closestDiff = diff;
        }
    }

    return closestI;
};

export const filterSimilarImages = (
    similarImageData: any[],
    currentImages: any[],
    smallestCrv: number
) => {
    return similarImageData.filter((candidateImage) => {
        const isSmallCrv = smallestCrv - candidateImage.similarity.value > 0.02;
        const isCurrentImage = currentImages.some((image) => {
            return image.name === candidateImage.name;
        });

        return !isSmallCrv && !isCurrentImage;
    });
};

export const createImageElement = (x: number, y: number, image: any, layer: any) => {
    const imageDiv = document.createElement("div");
    imageDiv.style.position = "absolute";
    imageDiv.style.left = `${x}px`;
    imageDiv.style.top = `${y}px`;
    const imageCard = new ImageCard({
        target: imageDiv,
        props: { image: image, layer: layer },
    });

    const element = {
        div: imageDiv,
        image: image,
        name: image.name,
        isHighlighted: false,
        shownTime: Date.now(),
        updateImage: (newImage: any) => {
            imageCard.$set({ image: newImage });
            element.image = newImage;
        },
    };

    // Handle lock and unlock events to update the highlight status
    imageCard.$on("lock", () => (element.isHighlighted = true));
    imageCard.$on("unlock", () => (element.isHighlighted = false));

    currentImageStore.update((imageElement) => [...imageElement, element]);
    imageDataStore.update((imageInfo) => [...imageInfo, image]);

    return element;
};
