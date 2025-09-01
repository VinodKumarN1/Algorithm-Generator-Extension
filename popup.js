document.addEventListener("DOMContentLoaded", async () => {
  const generateBtn = document.getElementById("generateBtn");
  const copyBtn = document.getElementById("copyBtn");
  const output = document.getElementById("output");
  const loading = document.getElementById("loading");
  const promptInputEl = document.getElementById("prompt");
  const languageEl = document.getElementById("language");

  const CACHE_KEY = "algorithmCache";

  // Load cache from local storage
  let cache = {};
  chrome.storage.local.get([CACHE_KEY], (result) => {
    if (result[CACHE_KEY]) cache = result[CACHE_KEY];
  });

  // Load algorithms JSON
  let algorithms = {};
  try {
    const res = await fetch(chrome.runtime.getURL("algorithms.json"));
    algorithms = await res.json();
  } catch (err) {
    console.error("Failed to load algorithms.json", err);
  }

  generateBtn.addEventListener("click", () => {
    const promptInput = promptInputEl.value.trim().toLowerCase();
    const language = languageEl.value.toLowerCase();

    if (!promptInput) return;

    const cacheKey = `${promptInput}_${language}`;
    if (cache[cacheKey]) {
      output.textContent = cache[cacheKey];
      return;
    }

    loading.style.display = "block";
    output.textContent = "";

    try {
      if (algorithms[promptInput] && algorithms[promptInput][language]) {
        const data = `Algorithm:\n${algorithms[promptInput][language]}\n\nExplanation:\n${algorithms[promptInput].explanation}`;
        output.textContent = data;

        // Save to cache
        cache[cacheKey] = data;
        chrome.storage.local.set({ [CACHE_KEY]: cache });
      } else {
        output.textContent = "Algorithm not found!";
      }
    } catch (err) {
      output.textContent = "Error generating algorithm!";
      console.error(err);
    } finally {
      loading.style.display = "none";
    }
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(output.textContent);
  });
});
