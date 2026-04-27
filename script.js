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
  [12, 72], [18, 65], [25, 57], [33, 50], [21, 45], [42, 62], [50, 56], [56, 48], [62, 40],
  [70, 35], [74, 44], [68, 57], [60, 67], [49, 74], [37, 79], [26, 83], [15, 87],
];

const chapterData = chapterTitles.map((title, index) => {
  const chapterNumber = index + 1;
  return {
    id: chapterNumber,
    title,
    description: `Chapter ${chapterNumber} mock scenes. Replace these with real panoramas in panorama/chapter${chapterNumber}/ when ready.`,
    marker: {
      x: markerPositions[index][0],
      y: markerPositions[index][1],
    },
    scenes: [
      {
        title: `Chapter ${chapterNumber}: Scene A`,
        image: sampleImagePath,
        pitch: 2,
        yaw: 145,
        hfov: 112,
      },
      {
        title: `Chapter ${chapterNumber}: Scene B`,
        image: sampleImagePath,
        pitch: 0,
        yaw: 20,
        hfov: 105,
      },
    ],
  };
});

let selectedChapter = null;
let currentSceneIndex = 0;
let viewer = null;

const chapterListEl = document.getElementById("chapter-list");
const mapEl = document.getElementById("map");
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

function imageUrl(path) {
  return encodeURI(path);
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
    mapEl.appendChild(marker);
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

function openChapterViewer() {
  if (!selectedChapter) return;

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
selectChapter(1);
