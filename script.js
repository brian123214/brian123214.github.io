const sampleImagePath = "panorama/chapter1/ChatGPT Image Apr 23, 2026 at 03_49_26 PM.png";

const chapterTitles = [
  "Lucy Looks into a Wardrobe",
  "What Lucy Found There",
  "Edmund and the Wardrobe",
  "Turkish Delight",
  "Back on This Side of the Door",
  "Into the Forest",
  "A Day with the Beavers",
  "What Happened After Dinner",
  "In the Witch's House",
  "The Spell Begins to Break",
  "Aslan Is Nearer",
  "Peter's First Battle",
  "Deep Magic from the Dawn of Time",
  "The Triumph of the Witch",
  "Deeper Magic from Before the Dawn of Time",
  "What Happened About the Statues",
  "The Hunting of the White Stag",
];

const markerPositions = [
  [13.89, 29.87], [16.22, 23.93], [22.21, 27.87], [26.93, 33.96], [11.91, 31.96], [19.53, 30.18], [27.51, 26.32], [43.40, 39.83], [33.04, 17.83],
  [46.78, 44.77], [45.61, 46.86], [42.29, 56.04], [62.43, 43.46], [64.94, 51.18], [69.89, 51.10], [39.56, 16.83], [77.10, 40.45],
];

const chapterImageCache = new Map();

const chapterData = chapterTitles.map((title, index) => {
  const chapterNumber = index + 1;
  return {
    id: chapterNumber,
    title,
    description: `Chapter ${chapterNumber} panorama scenes.`,
    marker: {
      x: markerPositions[index][0],
      y: markerPositions[index][1],
    },
    scenes: [],
  };
});

let selectedChapter = null;
let currentSceneIndex = 0;
let viewer = null;

const chapterListEl = document.getElementById("chapter-list");
const mapEl = document.getElementById("map");
const mapCanvasEl = document.getElementById("map-canvas");
const zoomInBtn = document.getElementById("zoom-in-btn");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const resetMapBtn = document.getElementById("reset-map-btn");
const zoomLevelLabel = document.getElementById("zoom-level-label");
const selectedTitleEl = document.getElementById("selected-chapter-title");
const selectedDescEl = document.getElementById("selected-chapter-description");
const enterChapterBtn = document.getElementById("enter-chapter-btn");

const viewerSectionEl = document.getElementById("viewer-section");
const viewerChapterTitleEl = document.getElementById("viewer-chapter-title");
const viewerSceneTitleEl = document.getElementById("viewer-scene-title");
const sceneCounterEl = document.getElementById("scene-counter");
const prevSceneBtn = document.getElementById("prev-scene-btn");
const nextSceneBtn = document.getElementById("next-scene-btn");
const backToMapBtn = document.getElementById("back-to-map-btn");

let mapScale = 1;
let mapOffsetX = 0;
let mapOffsetY = 0;
let isDraggingMap = false;
let dragStartX = 0;
let dragStartY = 0;
let mapStartOffsetX = 0;
let mapStartOffsetY = 0;

function imageUrl(path) {
  return encodeURI(path);
}

function updateMapTransform() {
  mapCanvasEl.style.transform = `translate(${mapOffsetX}px, ${mapOffsetY}px) scale(${mapScale})`;
  mapCanvasEl.style.setProperty("--marker-scale", `${1 / mapScale}`);
  zoomLevelLabel.textContent = `${Math.round(mapScale * 100)}%`;
}

function setMapScale(nextScale) {
  mapScale = Math.min(3, Math.max(1, nextScale));
  if (mapScale === 1) {
    mapOffsetX = 0;
    mapOffsetY = 0;
  }
  updateMapTransform();
}

function initMapInteraction() {
  updateMapTransform();

  zoomInBtn.addEventListener("click", () => setMapScale(mapScale + 0.2));
  zoomOutBtn.addEventListener("click", () => setMapScale(mapScale - 0.2));
  resetMapBtn.addEventListener("click", () => {
    mapScale = 1;
    mapOffsetX = 0;
    mapOffsetY = 0;
    updateMapTransform();
  });

  mapEl.addEventListener("wheel", (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    setMapScale(mapScale + delta);
  });

  mapEl.addEventListener("pointerdown", (event) => {
    if (mapScale <= 1) return;
    isDraggingMap = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    mapStartOffsetX = mapOffsetX;
    mapStartOffsetY = mapOffsetY;
    mapEl.setPointerCapture(event.pointerId);
  });

  mapEl.addEventListener("pointermove", (event) => {
    if (!isDraggingMap) return;
    mapOffsetX = mapStartOffsetX + (event.clientX - dragStartX);
    mapOffsetY = mapStartOffsetY + (event.clientY - dragStartY);
    updateMapTransform();
  });

  mapEl.addEventListener("pointerup", () => {
    isDraggingMap = false;
  });

  mapEl.addEventListener("pointercancel", () => {
    isDraggingMap = false;
  });
}

function buildMapAndList() {
  chapterData.forEach((chapter) => {
    const listItem = document.createElement("li");
    listItem.className = "chapter-item";
    listItem.textContent = `Chapter ${chapter.id}: ${chapter.title}`;
    listItem.dataset.chapterId = String(chapter.id);
    listItem.addEventListener("click", () => selectChapter(chapter.id));
    chapterListEl.appendChild(listItem);

    const marker = document.createElement("button");
    marker.className = "chapter-marker";
    marker.style.left = `${chapter.marker.x}%`;
    marker.style.top = `${chapter.marker.y}%`;
    marker.textContent = chapter.id;
    marker.dataset.chapterId = String(chapter.id);
    marker.setAttribute("aria-label", `Chapter ${chapter.id}: ${chapter.title}`);
    marker.addEventListener("click", () => selectChapter(chapter.id));
    mapCanvasEl.appendChild(marker);
  });
}

function selectChapter(chapterId) {
  selectedChapter = chapterData.find((chapter) => chapter.id === chapterId) || null;
  if (!selectedChapter) return;

  selectedTitleEl.textContent = `Chapter ${selectedChapter.id}: ${selectedChapter.title}`;
  selectedDescEl.textContent = selectedChapter.description;
  enterChapterBtn.disabled = false;

  document.querySelectorAll(".chapter-item, .chapter-marker").forEach((el) => {
    el.classList.toggle("active", Number(el.dataset.chapterId) === chapterId);
  });
}

function chapterToViewerConfig(chapter) {
  const scenes = {};

  chapter.scenes.forEach((scene, idx) => {
    scenes[`scene-${idx}`] = {
      title: scene.title,
      type: "equirectangular",
      panorama: imageUrl(scene.image),
      pitch: scene.pitch,
      yaw: scene.yaw,
      hfov: scene.hfov,
    };
  });

  return {
    default: {
      firstScene: "scene-0",
      sceneFadeDuration: 800,
      autoLoad: true,
    },
    scenes,
  };
}

async function fileExists(path) {
  try {
    const response = await fetch(imageUrl(path), { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function resolveChapterImage(chapterNumber) {
  if (chapterImageCache.has(chapterNumber)) {
    return chapterImageCache.get(chapterNumber);
  }

  const candidates = [
    `panorama/${chapterNumber}.png`,
    `panorama/${chapterNumber}.jpg`,
    `panorama/${chapterNumber}.jpeg`,
    `panorama/chapter${chapterNumber}/${chapterNumber}.png`,
    `panorama/chapter${chapterNumber}/${chapterNumber}.jpg`,
    `panorama/chapter${chapterNumber}/${chapterNumber}.jpeg`,
    `panorama/chapter1/${chapterNumber}.png`,
    `panorama/chapter1/${chapterNumber}.jpg`,
    `panorama/chapter1/${chapterNumber}.jpeg`,
  ];

  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await fileExists(candidate)) {
      chapterImageCache.set(chapterNumber, candidate);
      return candidate;
    }
  }

  chapterImageCache.set(chapterNumber, sampleImagePath);
  return sampleImagePath;
}

async function buildScenesForChapter(chapter) {
  const chapterImage = await resolveChapterImage(chapter.id);
  const isFallback = chapterImage === sampleImagePath;

  chapter.description = isFallback
    ? `Chapter ${chapter.id} does not have ${chapter.id}.png yet. Showing fallback image.`
    : `Chapter ${chapter.id} loaded from ${chapterImage}.`;

  chapter.scenes = [
    {
      title: `Chapter ${chapter.id}: Main Scene`,
      image: chapterImage,
      pitch: 0,
      yaw: 0,
      hfov: 110,
    },
  ];
}

function updateViewerUI() {
  if (!selectedChapter) return;

  const total = selectedChapter.scenes.length;
  const currentScene = selectedChapter.scenes[currentSceneIndex];

  viewerChapterTitleEl.textContent = `Chapter ${selectedChapter.id}: ${selectedChapter.title}`;
  viewerSceneTitleEl.textContent = currentScene.title;
  sceneCounterEl.textContent = `Scene ${currentSceneIndex + 1} / ${total}`;

  prevSceneBtn.disabled = currentSceneIndex === 0;
  nextSceneBtn.disabled = currentSceneIndex === total - 1;
}

async function openChapterViewer() {
  if (!selectedChapter) return;

  await buildScenesForChapter(selectedChapter);
  selectedDescEl.textContent = selectedChapter.description;

  currentSceneIndex = 0;

  if (viewer && typeof viewer.destroy === "function") {
    viewer.destroy();
  }

  viewer = pannellum.viewer("panorama-viewer", chapterToViewerConfig(selectedChapter));

  viewerSectionEl.classList.remove("hidden");
  updateViewerUI();
  viewerSectionEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function goToScene(index) {
  if (!selectedChapter) return;

  const maxIndex = selectedChapter.scenes.length - 1;
  if (index < 0 || index > maxIndex) return;

  currentSceneIndex = index;
  const sceneId = `scene-${currentSceneIndex}`;
  const sceneData = selectedChapter.scenes[currentSceneIndex];

  if (viewer) {
    viewer.loadScene(sceneId, sceneData.pitch, sceneData.yaw, sceneData.hfov);
  }

  updateViewerUI();
}

function closeViewer() {
  viewerSectionEl.classList.add("hidden");
  document.getElementById("map-layout").scrollIntoView({ behavior: "smooth", block: "start" });
}

enterChapterBtn.addEventListener("click", openChapterViewer);
prevSceneBtn.addEventListener("click", () => goToScene(currentSceneIndex - 1));
nextSceneBtn.addEventListener("click", () => goToScene(currentSceneIndex + 1));
backToMapBtn.addEventListener("click", closeViewer);

buildMapAndList();
initMapInteraction();
selectChapter(1);
