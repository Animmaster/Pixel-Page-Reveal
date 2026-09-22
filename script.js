import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Flip, SplitText);

const preloader = document.querySelector(".preloader");
const preloaderBg = document.querySelector(".preloader-bg");
const preloaderGrid = document.querySelector(".preloader-grid");
const progressMarker = document.querySelector(".progress-marker");

const isDesktop = window.innerWidth >= 1000;
const maxTileSize = isDesktop ? 85 : 50;

const snapToOdd = (value) => (value % 2 === 0 ? value - 1 : value);
const columnCount = snapToOdd(Math.floor(window.innerWidth / maxTileSize));
const rowCount = snapToOdd(Math.floor(window.innerHeight / maxTileSize));

const tileSize = Math.min(
  window.innerWidth / columnCount,
  window.innerHeight / rowCount,
);

const totalColumns = columnCount + 2;
const totalRows = rowCount + 2;

preloaderGrid.style.width = `${totalColumns * tileSize}px`;
preloaderGrid.style.height = `${totalRows * tileSize}px`;

const tiles = [];
for (let i = 0; i < totalColumns * totalRows; i++) {
  const tile = document.createElement("div");
  tile.classList.add("grid-tile");
  tile.style.width = `${tileSize}px`;
  tile.style.height = `${tileSize}px`;
  preloaderGrid.appendChild(tile);
  tiles.push(tile);
}

const middleRow = Math.floor(totalRows / 2);
const centerColumn = Math.floor(totalColumns / 2);
const tileAtColumn = (column) => tiles[middleRow * totalColumns + column];

const firstStop = tileAtColumn(centerColumn - (isDesktop ? 5 : 2));
const secondStop = tileAtColumn(centerColumn + (isDesktop ? 3 : 1));
const thirdStop = tileAtColumn(centerColumn + (isDesktop ? 5 : 2));
const finalStop = tileAtColumn(centerColumn);

const markerStops = [firstStop, secondStop, thirdStop, finalStop];
markerStops.forEach((tile) => {
  tile.style.backgroundColor = "#fff";
  tile.style.outline = "0.05px solid #fff";
});

const fadeInTiles = tiles.filter((tile) => !markerStops.includes(tile));
gsap.set(fadeInTiles, { opacity: 0 });

gsap.set(progressMarker, { width: tileSize, height: tileSize });

const preloaderRect = preloader.getBoundingClientRect();

const getTileOffset = (tile) => {
  const tileRect = tile.getBoundingClientRect();
  return {
    left: tileRect.left - preloaderRect.left,
    top: tileRect.top - preloaderRect.top,
  };
};
gsap.set(progressMarker, getTileOffset(firstStop));

function moveMarkerTo(tile, label) {
  const startState = Flip.getState(progressMarker);
  gsap.set(progressMarker, getTileOffset(tile));
  progressMarker.querySelector("p, img").outerHTML = label;
  Flip.from(startState, { duration: 1, ease: "power1.out" });
}

const splitCopy = (selector, type, className) =>
  SplitText.create(selector, {
    type,
    [`${type}Class`]: className,
    mask: type,
  });

const titleChars = splitCopy(".hero-title h1", "chars", "char").chars;
const subtitleLines = splitCopy(".hero-subtitle h3", "lines", "line").lines;
const navWords = splitCopy("nav a", "words", "word").words;
gsap.set([titleChars, subtitleLines, navWords], { y: "100%" });

const timeline = gsap.timeline({ delay: 1 });

timeline.to(
  fadeInTiles,
  {
    opacity: 1,
    duration: 0.125,
    stagger: { each: 2.5 / fadeInTiles.length, from: "random" },
  },
  0,
);

timeline.to(
  [firstStop, secondStop, thirdStop],
  {
    backgroundColor: "#C4D600",
    outlineColor: "#C4D600",
    duration: 0.125,
    stagger: 0.25,
  },
  2.75,
);

timeline.add(() => moveMarkerTo(secondStop, "<p>50</p>"), 0.25);
timeline.add(() => moveMarkerTo(thirdStop, "<p>75</p>"), 1.5);
timeline.add(
  () => moveMarkerTo(finalStop, `<img src="/logo.png" alt="" />`),
  2.75,
);

timeline.add(() => preloaderBg.remove());

const collapsingTiles = tiles.filter((tile) => tile !== finalStop);

timeline.to(
  collapsingTiles,
  {
    scaleY: 0,
    transformOrigin: "top",
    duration: 0.75,
    stagger: { each: 0.0035, from: "random" },
    ease: "power3.out",
  },
  "+=0.5",
);

timeline.to(
  [finalStop, progressMarker],
  { scaleY: 0, transformOrigin: "top", duration: 0.75, ease: "power3.out" },
  "<",
);

timeline.to(
  titleChars,
  {
    y: "0%",
    duration: 1,
    ease: "power3.out",
    stagger: { each: 0.05, from: "random" },
  },
  "<1",
);
timeline.to(
  subtitleLines,
  { y: "0%", duration: 1, ease: "power3.out", stagger: 0.1 },
  "<0.5",
);
timeline.to(
  navWords,
  { y: "0%", duration: 1, ease: "power3.out", stagger: 0.075 },
  "<0.25",
);
