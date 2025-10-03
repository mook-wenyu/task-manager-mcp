// 全局变量
// Global variables
let tasks = [];
let selectedTaskId = null;
let searchTerm = "";
let sortOption = "date-asc";
let globalAnalysisResult = null; // 添加：保存全局分析结果
                                   // New: Store global analysis result
let svg, g, simulation;
let width, height; // << 添加：将宽高定义为全局变量
                   // << New: Define width and height as global variables
let isGraphInitialized = false; // << 添加：跟踪图表是否已初始化
                                 // << New: Track whether the chart has been initialized
let zoom; // << 添加：保存缩放行为对象
          // << New: Save zoom behavior object

// 添加：i18n 全局变量
// New: i18n global variables
let currentLang = "en"; // 缺省语言
                           // Default language
let translations = {}; // 保存加载的翻译
                       // Store loaded translations

// DOM元素
// DOM elements
const taskListElement = document.getElementById("task-list");
const taskDetailsContent = document.getElementById("task-details-content");
const statusFilter = document.getElementById("status-filter");
const currentTimeElement = document.getElementById("current-time");
const progressIndicator = document.getElementById("progress-indicator");
const progressCompleted = document.getElementById("progress-completed");
const progressInProgress = document.getElementById("progress-in-progress");
const progressPending = document.getElementById("progress-pending");
const progressLabels = document.getElementById("progress-labels");
const dependencyGraphElement = document.getElementById("dependency-graph");
const globalAnalysisResultElement = document.getElementById(
  "global-analysis-result"
); // 假设 HTML 中有这个元素
// Assuming this element exists in HTML
const langSwitcher = document.getElementById("lang-switcher"); // << 添加：获取切换器元素
                                                                   // << New: Get switcher element
const resetViewBtn = document.getElementById("reset-view-btn"); // << 添加：获取重置按钮元素
                                                                   // << New: Get reset button element

// 初始化
// Initialization
document.addEventListener("DOMContentLoaded", () => {
  // fetchTasks(); // 将由 initI18n() 触发
  // fetchTasks(); // Will be triggered by initI18n()
  initI18n(); // << 添加：初始化 i18n
              // << New: Initialize i18n
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
  updateDimensions(); // << 添加：初始化时更新尺寸
                      // << New: Update dimensions during initialization

  // 事件监听器
  // Event listeners
  // statusFilter.addEventListener("change", renderTasks); // 将由 changeLanguage 触发或在 applyTranslations 后触发
  // statusFilter.addEventListener("change", renderTasks); // Will be triggered by changeLanguage or after applyTranslations
  if (statusFilter) {
    statusFilter.addEventListener("change", renderTasks);
  }

  // 添加：重置视图按钮事件监听
  // New: Reset view button event listener
  if (resetViewBtn) {
    resetViewBtn.addEventListener("click", resetView);
  }

  // 添加：搜索和排序事件监听
  // New: Search and sorting event listeners
  const searchInput = document.getElementById("search-input");
  const sortOptions = document.getElementById("sort-options");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase();
      renderTasks();
    });
  }

  if (sortOptions) {
    sortOptions.addEventListener("change", (e) => {
      sortOption = e.target.value;
      renderTasks();
    });
  }

  // 添加：设置 SSE 连接
  // New: Setup SSE connection
  setupSSE();

  // 添加：语言切换器事件监听
  // New: Language switcher event listener
  if (langSwitcher) {
    langSwitcher.addEventListener("change", (e) =>
      changeLanguage(e.target.value)
    );
  }

  // 添加：窗口大小改变时更新尺寸
  // New: Update dimensions when window size changes
  window.addEventListener("resize", () => {
    updateDimensions();
    if (svg && simulation) {
      svg.attr("viewBox", [0, 0, width, height]);
      simulation.force("center", d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
    }
  });
});

// 添加：i18n 内核函数
// New: i18n core functions
// 1. 语言检测 (URL 参数 > navigator.language > 'en')
// 1. Language detection (URL parameters > navigator.language > 'en')
function detectLanguage() {
  // 1. 优先从 URL 参数读取
  // 1. Read from URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang");
  if (urlLang && ["en", "zh-CN"].includes(urlLang)) {
    return urlLang;
  }

  // 2. 检查浏览器语言（移除 localStorage 检查）
  // 2. Check browser language (removed localStorage check)
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    const lowerLang = browserLang.toLowerCase();
    if (
      lowerLang.startsWith("zh-cn") ||
      lowerLang.startsWith("zh-hans") ||
      lowerLang.startsWith("zh-sg") ||
      lowerLang.startsWith("zh-my")
    )
      return "zh-CN";
    if (lowerLang.startsWith("zh")) return "zh-CN"; // 简体默认回退到中文
                                                     // Simplified Chinese fallback to Simplified Chinese
    if (lowerLang.startsWith("en")) return "en";
  }

  // 3. 默认值
  // 3. Default value
  return "en";
}

// 2. 异步加载翻译文档
// 2. Asynchronously load translation files
async function loadTranslations(lang) {
  try {
    const response = await fetch(`/locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(
        `Failed to load ${lang}.json, status: ${response.status}`
      );
    }
    translations = await response.json();
    console.log(`Translations loaded for ${lang}`);
  } catch (error) {
    console.error("Error loading translations:", error);
    if (lang !== "en") {
      console.warn(`Falling back to English translations.`);
      await loadTranslations("en"); // Fallback to English
    } else {
      translations = {}; // Clear translations if even English fails
      // Maybe display a more persistent error message?
      // 也许显示更持久的错误消息？
      alert("Critical error: Could not load language files.");
    }
  }
}

// 3. 翻译函数
// 3. Translation function
function translate(key, replacements = {}) {
  let translated = translations[key] || key; // Fallback to key itself
  // 简单的占位符替换（例如 {message}）
  // Simple placeholder replacement (e.g., {message})
  for (const placeholder in replacements) {
    translated = translated.replace(
      `{${placeholder}}`,
      replacements[placeholder]
    );
  }
  return translated;
}

// 4. 应用翻译到 DOM (处理 textContent, placeholder, title)
// 4. Apply translations to DOM (handle textContent, placeholder, title)
function applyTranslations() {
  console.log("Applying translations for:", currentLang);
  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const key = el.dataset.i18nKey;
    const translatedText = translate(key);

    // 优先处理特定属性
    // Handle specific attributes first
    if (el.hasAttribute("placeholder")) {
      el.placeholder = translatedText;
    } else if (el.hasAttribute("title")) {
      el.title = translatedText;
    } else if (el.tagName === "OPTION") {
      el.textContent = translatedText;
      // 如果需要，也可以翻译 value，但通常不需要
      // If needed, value can also be translated, but usually not necessary
    } else {
      // 对于大多数元素，设置 textContent
      // For most elements, set textContent
      el.textContent = translatedText;
    }
  });
  // 手动更新没有 data-key 的元素（如果有的话）
  // Manually update elements without data-key (if any)
  // 例如，如果 footer 时间格式需要本地化，可以在这里处理
  // For example, if footer time format needs localization, it can be handled here
  // updateCurrentTime(); // 确保时间格式也可能更新（如果需要）
  // updateCurrentTime(); // Ensure time format may also be updated (if needed)
}

// 5. 初始化 i18n
// 5. Initialize i18n
async function initI18n() {
  currentLang = detectLanguage();
  console.log(`Initializing i18n with language: ${currentLang}`);
  // << 添加：设置切换器的初始值 >>
  // << New: Set initial value of the switcher >>
  if (langSwitcher) {
    langSwitcher.value = currentLang;
  }
  await loadTranslations(currentLang);
  applyTranslations();
  await fetchTasks();
}

// 添加：语言切换函数
// New: Language switching function
function changeLanguage(lang) {
  if (!lang || !["en", "zh-CN"].includes(lang)) {
    console.warn(`Invalid language selected: ${lang}. Defaulting to English.`);
    lang = "en";
  }
  currentLang = lang;
  console.log(`Changing language to: ${currentLang}`);
  loadTranslations(currentLang)
    .then(() => {
      console.log("Translations reloaded, applying...");
      applyTranslations();
      console.log("Re-rendering components...");
      // 重新渲染需要翻译的组件
      renderTasks();
      if (selectedTaskId) {
        const task = tasks.find((t) => t.id === selectedTaskId);
        if (task) {
          selectTask(selectedTaskId); // 确保传递 ID，让 selectTask 重新查找并渲染
        } else {
          // 如果选中的任务已不存在，清除详情
          taskDetailsContent.innerHTML = `<p class="placeholder">${translate(
            "task_details_placeholder"
          )}</p>`;
          selectedTaskId = null;
          highlightNode(null);
        }
      } else {
        // 如果没有任务被选中，确保详情面板显示 placeholder
        taskDetailsContent.innerHTML = `<p class="placeholder">${translate(
          "task_details_placeholder"
        )}</p>`;
      }
      renderDependencyGraph(); // 重新渲染图表（可能包含 placeholder）
      updateProgressIndicator(); // 重新渲染进度条（包含标签）
      renderGlobalAnalysisResult(); // 重新渲染全局分析（标题）
      // 确保下拉菜单的值与当前语言一致
      if (langSwitcher) langSwitcher.value = currentLang;
      console.log("Language change complete.");
    })
    .catch((error) => {
      console.error("Error changing language:", error);
      // 可以添加用户反馈，例如显示错误消息
      // User feedback can be added, such as displaying error messages
      showTemporaryError("Failed to change language. Please try again."); // Need translation key
      // 需要翻译键
    });
}
// --- i18n 内核函数结束 ---
// --- i18n core functions end ---

// 获取任务数据
// Fetch task data
async function fetchTasks() {
  try {
    // 初始加载时显示 loading (现在使用翻译)
    // Show loading during initial load (now uses translation)
    if (tasks.length === 0) {
      taskListElement.innerHTML = `<div class="loading">${translate(
        "task_list_loading"
      )}</div>`;
    }

    const response = await fetch("/api/tasks");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const newTasks = data.tasks || [];

    // 提取全局分析结果 (找第一个非空的)
    // Extract global analysis result (find the first non-empty one)
    let foundAnalysisResult = null;
    for (const task of newTasks) {
      if (task.analysisResult) {
        foundAnalysisResult = task.analysisResult;
        break; // 找到一个就够了
               // Found one is enough
      }
    }
    // 只有当找到的结果与当前保存的不同时才更新
    // Only update when the found result is different from the currently stored one
    if (foundAnalysisResult !== globalAnalysisResult) {
      globalAnalysisResult = foundAnalysisResult;
      renderGlobalAnalysisResult(); // 更新显示
                                      // Update display
    }

    // --- 智能更新逻辑 (初步 - 仍需改进以避免闪烁) ---
    // 简单地比较任务数量或标识符来决定是否重新渲染
    // 理想情况下应比较每个任务的内容并进行 DOM 更新
    const tasksChanged = didTasksChange(tasks, newTasks);

    if (tasksChanged) {
      tasks = newTasks; // 更新全局任务列表
      console.log("Tasks updated via fetch, re-rendering...");
      renderTasks();
      updateProgressIndicator();
      renderDependencyGraph(); // 更新图表
    } else {
      console.log(
        "No significant task changes detected, skipping full re-render."
      );
      // 如果不需要重新渲染列表，可能只需要更新进度条
      updateProgressIndicator();
      // 考虑是否需要更新图表（如果状态可能改变）
      // renderDependencyGraph(); // 暂时注释掉，除非状态变化很关键
    }

    // *** 移除 setTimeout 轮询 ***
    // setTimeout(fetchTasks, 30000);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // 避免覆盖现有列表，除非是初始加载失败
    if (tasks.length === 0) {
      taskListElement.innerHTML = `<div class="error">${translate(
        "error_loading_tasks",
        { message: error.message }
      )}</div>`;
      if (progressIndicator) progressIndicator.style.display = "none";
      if (dependencyGraphElement)
        dependencyGraphElement.innerHTML = `<div class="error">${translate(
          "error_loading_graph"
        )}</div>`;
    } else {
      showTemporaryError(
        translate("error_updating_tasks", { message: error.message })
      );
    }
  }
}

// 添加：设置 Server-Sent Events 连接
// New: Setup Server-Sent Events connection
function setupSSE() {
  console.log("Setting up SSE connection to /api/tasks/stream");
  const evtSource = new EventSource("/api/tasks/stream");

  evtSource.onmessage = function (event) {
    console.log("SSE message received:", event.data);
    // 可以根据 event.data 内容做更复杂的判断，目前只要收到消息就更新
  };

  evtSource.addEventListener("update", function (event) {
    console.log("SSE 'update' event received:", event.data);
    // 收到更新事件，重新获取任务列表
    fetchTasks();
  });

  evtSource.onerror = function (err) {
    console.error("EventSource failed:", err);
    // 可以实现重连逻辑
    evtSource.close(); // 关闭错误的连接
    // 延迟一段时间后尝试重新连接
    setTimeout(setupSSE, 5000); // 5秒后重试
  };

  evtSource.onopen = function () {
    console.log("SSE connection opened.");
  };
}

// 添加：比较任务列表是否有变化的辅助函数 (最全面版)
// New: Helper function to compare whether the task list has changed (most comprehensive version)
function didTasksChange(oldTasks, newTasks) {
  if (!oldTasks || !newTasks) return true; // Handle initial load or error states

  if (oldTasks.length !== newTasks.length) {
    console.log("Task length changed.");
    return true; // Length change definitely needs update
  }

  const oldTaskMap = new Map(oldTasks.map((task) => [task.id, task]));
  const newTaskIds = new Set(newTasks.map((task) => task.id)); // For checking removed tasks

  // Check for removed tasks first
  for (const oldTask of oldTasks) {
    if (!newTaskIds.has(oldTask.id)) {
      console.log(`Task removed: ${oldTask.id}`);
      return true;
    }
  }

  // Check for new or modified tasks
  for (const newTask of newTasks) {
    const oldTask = oldTaskMap.get(newTask.id);
    if (!oldTask) {
      console.log(`New task found: ${newTask.id}`);
      return true; // New task ID found
    }

    // Compare relevant fields
    const fieldsToCompare = [
      "name",
      "description",
      "status",
      "notes",
      "implementationGuide",
      "verificationCriteria",
      "summary",
    ];

    for (const field of fieldsToCompare) {
      if (oldTask[field] !== newTask[field]) {
        // Handle null/undefined comparisons carefully if needed
        // e.g., !(oldTask[field] == null && newTask[field] == null) checks if one is null/undefined and the other isn't
        if (
          !(oldTask[field] === null && newTask[field] === null) &&
          !(oldTask[field] === undefined && newTask[field] === undefined)
        ) {
          console.log(`Task ${newTask.id} changed field: ${field}`);
          return true;
        }
      }
    }

    // Compare dependencies (array of strings or objects)
    if (!compareDependencies(oldTask.dependencies, newTask.dependencies)) {
      console.log(`Task ${newTask.id} changed field: dependencies`);
      return true;
    }

    // Compare relatedFiles (array of objects) - simple length check first
    if (!compareRelatedFiles(oldTask.relatedFiles, newTask.relatedFiles)) {
      console.log(`Task ${newTask.id} changed field: relatedFiles`);
      return true;
    }

    // Optional: Compare updatedAt as a final check if other fields seem identical
    if (oldTask.updatedAt?.toString() !== newTask.updatedAt?.toString()) {
      console.log(`Task ${newTask.id} changed field: updatedAt (fallback)`);
      return true;
    }
  }

  return false; // No significant changes detected
}

// Helper function to compare dependency arrays
function compareDependencies(deps1, deps2) {
  const arr1 = deps1 || [];
  const arr2 = deps2 || [];

  if (arr1.length !== arr2.length) return false;

  // Extract IDs whether they are strings or objects {taskId: string}
  const ids1 = new Set(
    arr1.map((dep) =>
      typeof dep === "object" && dep !== null ? dep.taskId : dep
    )
  );
  const ids2 = new Set(
    arr2.map((dep) =>
      typeof dep === "object" && dep !== null ? dep.taskId : dep
    )
  );

  if (ids1.size !== ids2.size) return false; // Different number of unique deps
  for (const id of ids1) {
    if (!ids2.has(id)) return false;
  }
  return true;
}

// Helper function to compare relatedFiles arrays (can be simple or complex)
function compareRelatedFiles(files1, files2) {
  const arr1 = files1 || [];
  const arr2 = files2 || [];

  if (arr1.length !== arr2.length) return false;

  // Simple comparison: check if paths and types are the same in the same order
  // For a more robust check, convert to Sets of strings like `path|type` or do deep object comparison
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].path !== arr2[i].path || arr1[i].type !== arr2[i].type) {
      return false;
    }
    // Add more field comparisons if needed (description, lines, etc.)
    // if (arr1[i].description !== arr2[i].description) return false;
  }
  return true;
}

// 添加：显示临时错误消息的函数
// New: Function to display temporary error messages
function showTemporaryError(message) {
  const errorElement = document.createElement("div");
  errorElement.className = "temporary-error";
  errorElement.textContent = message; // 保持消息本身
  document.body.appendChild(errorElement);
  setTimeout(() => {
    errorElement.remove();
  }, 3000); // 显示 3 秒
}

// 渲染任务列表 - *** 需要进一步优化以实现智能更新 ***
// Render task list - *** Needs further optimization to achieve smart updates ***
function renderTasks() {
  console.log("Rendering tasks..."); // 添加日志
  const filterValue = statusFilter.value;

  let filteredTasks = tasks;
  if (filterValue !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.status === filterValue);
  }

  if (searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        (task.name && task.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (task.description &&
          task.description.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }

  // 保存筛选后的任务 ID 集合，用于图形渲染
  // Store the filtered task ID set for graphic rendering
  const filteredTaskIds = new Set(filteredTasks.map(task => task.id));

  filteredTasks.sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return (a.name || "").localeCompare(b.name || "");
      case "name-desc":
        return (b.name || "").localeCompare(a.name || "");
      case "status":
        const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
        return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      case "date-asc":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case "date-desc":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // 更新图形的显示状态
  updateGraphVisibility(filteredTaskIds);

  // --- 简单粗暴的替换 (会导致闪烁) ---
  // TODO: 实现 DOM Diffing 或更智能的更新策略
  if (filteredTasks.length === 0) {
    taskListElement.innerHTML = `<div class="placeholder">${translate(
      "task_list_empty"
    )}</div>`;
  } else {
    taskListElement.innerHTML = filteredTasks
      .map(
        (task) => `
            <div class="task-item status-${task.status.replace(
              "_",
              "-"
            )}" data-id="${task.id}" onclick="selectTask('${task.id}')">
            <h3>${task.name}</h3>
            <div class="task-meta">
                <span class="task-status status-${task.status.replace(
                  "_",
                  "-"
                )}">${getStatusText(task.status)}</span>
            </div>
            </div>
        `
      )
      .join("");
  }
  // --- 结束简单粗暴的替换 ---

  // 重新应用选中状态
  if (selectedTaskId) {
    const taskExists = tasks.some((t) => t.id === selectedTaskId);
    if (taskExists) {
      const selectedElement = document.querySelector(
        `.task-item[data-id="${selectedTaskId}"]`
      );
      if (selectedElement) {
        selectedElement.classList.add("selected");
      }
    } else {
      // 如果选中的任务在新的列表中不存在了，清除选择
      console.log(
        `Selected task ${selectedTaskId} no longer exists, clearing selection.`
      );
      selectedTaskId = null;
      taskDetailsContent.innerHTML = `<p class="placeholder">${translate(
        "task_details_placeholder"
      )}</p>`;
      highlightNode(null); // 清除图表高亮
    }
  }
}

// 添加：更新图形可见性的函数
function updateGraphVisibility(filteredTaskIds) {
  if (!g) return;

  // 更新节点的样式
  g.select(".nodes")
    .selectAll("g.node-item")
    .style("opacity", d => filteredTaskIds.has(d.id) ? 1 : 0.2)
    .style("filter", d => filteredTaskIds.has(d.id) ? "none" : "grayscale(80%)");

  // 更新连接的样式
  g.select(".links")
    .selectAll("line.link")
    .style("opacity", d => {
      const sourceVisible = filteredTaskIds.has(d.source.id || d.source);
      const targetVisible = filteredTaskIds.has(d.target.id || d.target);
      return (sourceVisible && targetVisible) ? 0.6 : 0.1;
    })
    .style("stroke", d => {
      const sourceVisible = filteredTaskIds.has(d.source.id || d.source);
      const targetVisible = filteredTaskIds.has(d.target.id || d.target);
      return (sourceVisible && targetVisible) ? "#999" : "#ccc";
    });

  // 更新缩略图中的节点和连接样式
  const minimapContent = svg.select(".minimap-content");
  
  minimapContent.selectAll(".minimap-node")
    .style("opacity", d => filteredTaskIds.has(d.id) ? 1 : 0.2)
    .style("filter", d => filteredTaskIds.has(d.id) ? "none" : "grayscale(80%)");

  minimapContent.selectAll(".minimap-link")
    .style("opacity", d => {
      const sourceVisible = filteredTaskIds.has(d.source.id || d.source);
      const targetVisible = filteredTaskIds.has(d.target.id || d.target);
      return (sourceVisible && targetVisible) ? 0.6 : 0.1;
    })
    .style("stroke", d => {
      const sourceVisible = filteredTaskIds.has(d.source.id || d.source);
      const targetVisible = filteredTaskIds.has(d.target.id || d.target);
      return (sourceVisible && targetVisible) ? "#999" : "#ccc";
    });
}

// 添加：将节点移动到视图中心的函数
function centerNode(nodeId) {
  if (!svg || !g || !simulation) return;

  const node = simulation.nodes().find(n => n.id === nodeId);
  if (!node) return;

  // 获取当前视图的变换状态
  const transform = d3.zoomTransform(svg.node());
  
  // 计算需要的变换以将节点居中
  const scale = transform.k; // 保持当前缩放级别
  const x = width / 2 - node.x * scale;
  const y = height / 2 - node.y * scale;

  // 使用过渡动画平滑地移动到新位置
  svg.transition()
    .duration(750) // 750ms的过渡时间
    .call(zoom.transform, d3.zoomIdentity
      .translate(x, y)
      .scale(scale)
    );
}

// 修改选择任务的函数
function selectTask(taskId) {
  // 清除旧的选中状态和高亮
  if (selectedTaskId) {
    const previousElement = document.querySelector(
      `.task-item[data-id="${selectedTaskId}"]`
    );
    if (previousElement) {
      previousElement.classList.remove("selected");
    }
  }

  // 如果再次点击同一个任务，则取消选中
  if (selectedTaskId === taskId) {
    selectedTaskId = null;
    taskDetailsContent.innerHTML = `<p class="placeholder">${translate(
      "task_details_placeholder"
    )}</p>`;
    highlightNode(null); // 取消高亮
    return;
  }

  selectedTaskId = taskId;

  // 添加新的选中状态
  const selectedElement = document.querySelector(
    `.task-item[data-id="${taskId}"]`
  );
  if (selectedElement) {
    selectedElement.classList.add("selected");
  }

  // 获取并显示任务详情
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    taskDetailsContent.innerHTML = `<div class="placeholder">${translate(
      "error_task_not_found"
    )}</div>`;
    return;
  }

  // --- 安全地填充任务详情 ---
  // 1. 创建基本骨架 (使用 innerHTML，但将动态内容替换为带 ID 的空元素)
  taskDetailsContent.innerHTML = `
    <div class="task-details-header">
      <h3 id="detail-name"></h3>
      <div class="task-meta">
        <span>${translate(
          "task_detail_status_label"
        )} <span id="detail-status" class="task-status"></span></span>
      </div>
    </div>
    
    <!-- 添加：条件显示 Summary -->
    <div class="task-details-section" id="detail-summary-section" style="display: none;">
      <h4>${translate("task_detail_summary_title")}</h4>
      <p id="detail-summary"></p>
    </div>
    
    <div class="task-details-section">
      <h4>${translate("task_detail_description_title")}</h4>
      <p id="detail-description"></p>
    </div>
    
    <div class="task-details-section">
      <h4>${translate("task_detail_implementation_guide_title")}</h4>
      <pre id="detail-implementation-guide"></pre>
    </div>
    
    <div class="task-details-section">
      <h4>${translate("task_detail_verification_criteria_title")}</h4>
      <p id="detail-verification-criteria"></p>
    </div>
    
    <div class="task-details-section">
      <h4>${translate("task_detail_dependencies_title")}</h4>
      <div class="dependencies" id="detail-dependencies">
        <!-- Dependencies will be populated by JS -->
      </div>
    </div>
    
    <div class="task-details-section">
      <h4>${translate("task_detail_related_files_title")}</h4>
      <div class="related-files" id="detail-related-files">
        <!-- Related files will be populated by JS -->
      </div>
    </div>

    <div class="task-details-section">
      <h4>${translate("task_detail_notes_title")}</h4>
      <p id="detail-notes"></p>
    </div>
  `;

  // 2. 获取对应元素并使用 textContent 安全地填充内容
  const detailName = document.getElementById("detail-name");
  const detailStatus = document.getElementById("detail-status");
  const detailDescription = document.getElementById("detail-description");
  const detailImplementationGuide = document.getElementById(
    "detail-implementation-guide"
  );
  const detailVerificationCriteria = document.getElementById(
    "detail-verification-criteria"
  );
  // 添加：获取 Summary 相关元素
  const detailSummarySection = document.getElementById(
    "detail-summary-section"
  );
  const detailSummary = document.getElementById("detail-summary");
  const detailNotes = document.getElementById("detail-notes");
  const detailDependencies = document.getElementById("detail-dependencies");
  const detailRelatedFiles = document.getElementById("detail-related-files");

  if (detailName) detailName.textContent = task.name;
  if (detailStatus) {
    detailStatus.textContent = getStatusText(task.status);
    detailStatus.className = `task-status status-${task.status.replace(
      "_",
      "-"
    )}`;
  }
  if (detailDescription)
    detailDescription.textContent =
      task.description || translate("task_detail_no_description");
  if (detailImplementationGuide)
    detailImplementationGuide.textContent =
      task.implementationGuide ||
      translate("task_detail_no_implementation_guide");
  if (detailVerificationCriteria)
    detailVerificationCriteria.textContent =
      task.verificationCriteria ||
      translate("task_detail_no_verification_criteria");

  // 添加：填充 Summary (如果存在且已完成)
  if (task.summary && detailSummarySection && detailSummary) {
    detailSummary.textContent = task.summary;
    detailSummarySection.style.display = "block"; // 显示区块
  } else if (detailSummarySection) {
    detailSummarySection.style.display = "none"; // 隐藏区块
  }

  if (detailNotes)
    detailNotes.textContent = task.notes || translate("task_detail_no_notes");

  // 3. 动态生成依赖项和相关文档 (这些可以包含安全的 HTML 结构如 span)
  if (detailDependencies) {
    const dependenciesHtml =
      task.dependencies && task.dependencies.length
        ? task.dependencies
            .map((dep) => {
              const depId =
                typeof dep === "object" && dep !== null && dep.taskId
                  ? dep.taskId
                  : dep;
              const depTask = tasks.find((t) => t.id === depId);
              // Translate the fallback text for unknown dependency
              const depName = depTask
                ? depTask.name
                : `${translate("task_detail_unknown_dependency")}(${depId})`;
              const span = document.createElement("span");
              span.className = "dependency-tag";
              span.dataset.id = depId;
              span.textContent = depName;
              span.onclick = () => highlightNode(depId);
              return span.outerHTML;
            })
            .join("")
        : `<span class="placeholder">${translate(
            "task_detail_no_dependencies"
          )}</span>`; // Translate placeholder
    detailDependencies.innerHTML = dependenciesHtml;
  }

  if (detailRelatedFiles) {
    const relatedFilesHtml =
      task.relatedFiles && task.relatedFiles.length
        ? task.relatedFiles
            .map((file) => {
              const span = document.createElement("span");
              span.className = "file-tag";
              span.title = file.description || "";
              const pathText = document.createTextNode(`${file.path} `);
              const small = document.createElement("small");
              small.textContent = `(${file.type})`; // Type is likely technical, maybe no translation needed?
              span.appendChild(pathText);
              span.appendChild(small);
              return span.outerHTML;
            })
            .join("")
        : `<span class="placeholder">${translate(
            "task_detail_no_related_files"
          )}</span>`; // Translate placeholder
    detailRelatedFiles.innerHTML = relatedFilesHtml;
  }

  // --- 原来的 innerHTML 赋值已移除 ---

  // 高亮节点并将其移动到中心
  highlightNode(taskId);
  centerNode(taskId);
}

// 添加：重置视图功能
function resetView() {
  if (!svg || !simulation) return;

  // 添加重置动画效果
  resetViewBtn.classList.add("resetting");

  // 计算视图中心
  const centerX = width / 2;
  const centerY = height / 2;

  // 重置缩放和平移（使用 transform 过渡）
  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);

  // 重置所有节点位置到中心附近
  simulation.nodes().forEach(node => {
    node.x = centerX + (Math.random() - 0.5) * 50; // 在中心点附近随机分布
    node.y = centerY + (Math.random() - 0.5) * 50;
    node.fx = null; // 清除固定位置
    node.fy = null;
  });

  // 重置力导向仿真
  simulation
    .force("center", d3.forceCenter(centerX, centerY))
    .alpha(1) // 完全重启仿真
    .restart();

  // 750ms 后移除动画类
  setTimeout(() => {
    resetViewBtn.classList.remove("resetting");
  }, 750);
}

// 添加：初始化缩放行为
function initZoom() {
  zoom = d3.zoom()
    .scaleExtent([0.1, 4]) // 设置缩放范围
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
      updateMinimap(); // 在缩放时更新缩略图
    });
  
  if (svg) {
    svg.call(zoom);
  }
}

// 渲染依赖关系图 - 修改为全局视图和 enter/update/exit 模式
function renderDependencyGraph() {
  if (!dependencyGraphElement || !window.d3) {
    console.warn("D3 or dependency graph element not found.");
    if (dependencyGraphElement) {
      if (!dependencyGraphElement.querySelector("svg")) {
        dependencyGraphElement.innerHTML = `<p class="placeholder">${translate("error_loading_graph_d3")}</p>`;
      }
    }
    return;
  }

  updateDimensions();

  // 如果没有任务，清空图表并显示提示
  if (tasks.length === 0) {
    dependencyGraphElement.innerHTML = `<p class="placeholder">${translate("dependency_graph_placeholder_empty")}</p>`;
    svg = null;
    g = null;
    simulation = null;
    return;
  }

  // 1. 准备节点 (Nodes) 和链接 (Links)
  const nodes = tasks.map((task) => ({
    id: task.id,
    name: task.name,
    status: task.status,
    x: simulation?.nodes().find((n) => n.id === task.id)?.x,
    y: simulation?.nodes().find((n) => n.id === task.id)?.y,
    fx: simulation?.nodes().find((n) => n.id === task.id)?.fx,
    fy: simulation?.nodes().find((n) => n.id === task.id)?.fy,
  }));

  const links = [];
  tasks.forEach((task) => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach((dep) => {
        const sourceId = typeof dep === "object" ? dep.taskId : dep;
        const targetId = task.id;
        if (nodes.some((n) => n.id === sourceId) && nodes.some((n) => n.id === targetId)) {
          links.push({ source: sourceId, target: targetId });
        } else {
          console.warn(`Dependency link ignored: Task ${sourceId} or ${targetId} not found in task list.`);
        }
      });
    }
  });

  if (!svg) {
    // --- 首次渲染 ---
    console.log("First render of dependency graph");
    dependencyGraphElement.innerHTML = "";

    svg = d3.select(dependencyGraphElement)
      .append("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("preserveAspectRatio", "xMidYMid meet");

    // 添加缩略图背景
    const minimapSize = Math.min(width, height) * 0.2; // 缩略图大小为主视图的20%
    const minimapMargin = 40;
    
    // 创建缩略图容器
    const minimap = svg.append("g")
      .attr("class", "minimap")
      .attr("transform", `translate(${width - minimapSize - minimapMargin}, ${height - minimapSize - minimapMargin*(height/width)})`);

    // 添加缩略图背景
    minimap.append("rect")
      .attr("width", minimapSize)
      .attr("height", minimapSize)
      .attr("fill", "rgba(0, 0, 0, 0.2)")
      .attr("stroke", "#666")
      .attr("stroke-width", 1)
      .attr("rx", 4)
      .attr("ry", 4);

    // 创建缩略图内容组
    minimap.append("g")
      .attr("class", "minimap-content");

    // 添加视口指示器
    minimap.append("rect")
      .attr("class", "minimap-viewport");

    g = svg.append("g");

    // 初始化并添加缩放行为
    initZoom();

    // 添加箭头定义
    g.append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // 初始化力导向仿真
    simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(30))
      // 添加：水平分布力，用于优化节点在水平方向的分布，根据节点的入度和出度来决定节点的水平位置，入度为0的节点（起始节点）靠左，出度为0的节点（终止节点）靠右，其他节点则分布在中间位置
      .force("x", d3.forceX().x(d => {
        // 计算节点的入度和出度
        const inDegree = links.filter(l => (l.target.id || l.target) === d.id).length;
        const outDegree = links.filter(l => (l.source.id || l.source) === d.id).length;
        
        if (inDegree === 0) {
          // 入度为0的节点（起始节点）靠左
          return width * 0.2;
        } else if (outDegree === 0) {
          // 出度为0的节点（终止节点）靠右
          return width * 0.8;
        } else {
          // 其他节点在中间
          return width * 0.5;
        }
      }).strength(0.2))
      // 添加：基于节点度数的垂直分布力
      .force("y", d3.forceY().y(height / 2).strength(d => {
        // 计算节点的总度数（入度+出度）
        const inDegree = links.filter(l => (l.target.id || l.target) === d.id).length;
        const outDegree = links.filter(l => (l.source.id || l.source) === d.id).length;
        const totalDegree = inDegree + outDegree;
        
        // 度数越大，力越大（基础力0.05，每个连接增加0.03，最大0.3）
        return Math.min(0.05 + totalDegree * 0.03, 0.3);
      }))
      .on("tick", ticked);

    // 添加用于存放链接和节点的组
    g.append("g").attr("class", "links");
    g.append("g").attr("class", "nodes");
  } else {
    // --- 更新图表渲染 ---
    console.log("Updating dependency graph");
    svg.attr("viewBox", [0, 0, width, height]);
    simulation.force("center", d3.forceCenter(width / 2, height / 2));
  }

  // --- 预先运算稳定的节点位置 ---
  // 拷贝节点和链接以进行稳定化计算
  const stableNodes = [...nodes];
  const stableLinks = [...links];
  
  // 暂时创建一个仿真器来计算稳定的位置
  const stableSim = d3
    .forceSimulation(stableNodes)
    .force("link", d3.forceLink(stableLinks).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(30));
  
  // 预热仿真获得稳定位置
  for (let i = 0; i < 10; i++) {
    stableSim.tick();
  }
  
  // 将稳定位置拷贝回原始节点
  stableNodes.forEach((stableNode) => {
    const originalNode = nodes.find(n => n.id === stableNode.id);
    if (originalNode) {
      originalNode.x = stableNode.x;
      originalNode.y = stableNode.y;
    }
  });
  
  // 停止临时仿真器
  stableSim.stop();
  // --- 预先运算结束 ---

  // 3. 更新链接 (无动画)
  const linkSelection = g
    .select(".links") // 选择放置链接的 g 元素
    .selectAll("line.link")
    .data(
      links,
      (d) => `${d.source.id || d.source}-${d.target.id || d.target}`
    ); // Key function 基于 source/target ID

  // Exit - 直接移除旧链接
  linkSelection.exit().remove();

  // Enter - 添加新链接 (无动画)
  const linkEnter = linkSelection
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke", "#999")
    .attr("marker-end", "url(#arrowhead)")
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 1.5);

  // 立即设置链接位置
  linkEnter
    .attr("x1", d => d.source.x || 0)
    .attr("y1", d => d.source.y || 0)
    .attr("x2", d => d.target.x || 0)
    .attr("y2", d => d.target.y || 0);

  // 4. 更新节点 (无动画)
  const nodeSelection = g
    .select(".nodes") // 选择放置节点的 g 元素
    .selectAll("g.node-item")
    .data(nodes, (d) => d.id); // 使用 ID 作为 key

  // Exit - 直接移除旧节点
  nodeSelection.exit().remove();

  // Enter - 添加新节点组 (无动画，直接在最终位置创建)
  const nodeEnter = nodeSelection
    .enter()
    .append("g")
    .attr("class", (d) => `node-item status-${getStatusClass(d.status)}`) // 使用辅助函数设置 class
    .attr("data-id", (d) => d.id)
    // 直接使用预计算的位置，无需缩放或透明度过渡
    .attr("transform", (d) => `translate(${d.x || 0}, ${d.y || 0})`)
    .call(drag(simulation)); // 添加拖拽

  // 添加圆形到 Enter 选择集
  nodeEnter
    .append("circle")
    .attr("r", 10)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .attr("fill", getNodeColor); // 直接设置颜色

  // 添加文本到 Enter 选择集
  nodeEnter
    .append("text")
    .attr("x", 15)
    .attr("y", 3)
    .text((d) => d.name)
    .attr("font-size", "10px")
    .attr("fill", "#ccc");

  // 添加标题 (tooltip) 到 Enter 选择集
  nodeEnter
    .append("title")
    .text((d) => `${d.name} (${getStatusText(d.status)})`);

  // 添加点击事件到 Enter 选择集
  nodeEnter.on("click", (event, d) => {
    selectTask(d.id);
    event.stopPropagation();
  });

  // Update - 立即更新现有节点 (无动画)
  nodeSelection
    .attr("transform", (d) => `translate(${d.x || 0}, ${d.y || 0})`)
    .attr("class", (d) => `node-item status-${getStatusClass(d.status)}`);

  nodeSelection
    .select("circle")
    .attr("fill", getNodeColor);

  // << 添加：重新定义 drag 函数 >>
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      // 取消固定位置，让节点可以继续被力导引影响 (如果需要)
      // d.fx = null;
      // d.fy = null;
      // 或者保留固定位置直到再次拖动
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
  // << drag 函数定义结束 >>

  // 5. 更新力导向仿真，但不启动
  simulation.nodes(nodes); // 更新仿真节点
  simulation.force("link").links(links); // 更新仿真链接
  
  // 更新水平分布力的目标位置
  simulation.force("x").x(d => {
    const inDegree = links.filter(l => (l.target.id || l.target) === d.id).length;
    const outDegree = links.filter(l => (l.source.id || l.source) === d.id).length;
    
    if (inDegree === 0) {
      return width * 0.2;
    } else if (outDegree === 0) {
      return width * 0.8;
    } else {
      return width * 0.5;
    }
  });
  // 注意：移除了 restart() 调用，防止刷新时的动画跳变
}

// Tick 函数: 更新节点和链接位置
function ticked() {
  if (!g) return;

  // 更新链接位置
  g.select(".links")
    .selectAll("line.link")
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  // 更新节点组位置
  g.select(".nodes")
    .selectAll("g.node-item")
    // << 修改：添加座标后备值 >>
    .attr("transform", (d) => `translate(${d.x || 0}, ${d.y || 0})`);

  // 更新缩略图
  updateMinimap();
}

// 函数：根据节点数据返回颜色 (示例)
function getNodeColor(nodeData) {
  switch (nodeData.status) {
    case "已完成":
    case "completed":
      return "var(--secondary-color)";
    case "进行中":
    case "in_progress":
      return "var(--primary-color)";
    case "待处理":
    case "pending":
      return "#f1c40f"; // 与进度条和状态标签一致
    default:
      return "#7f8c8d"; // 未知状态
  }
}

// 辅助函数
function getStatusText(status) {
  switch (status) {
    case "pending":
      return translate("status_pending");
    case "in_progress":
      return translate("status_in_progress");
    case "completed":
      return translate("status_completed");
    default:
      return status;
  }
}

function updateCurrentTime() {
  const now = new Date();
  // 保留原始格式，如果需要本地化时间，可以在此处使用 translate 或其他库
  const timeString = now.toLocaleString(); // 考虑是否需要基于 currentLang 格式化
  if (currentTimeElement) {
    // 将静态文本和动态时间分开
    const footerTextElement = currentTimeElement.parentNode.childNodes[0];
    if (footerTextElement && footerTextElement.nodeType === Node.TEXT_NODE) {
      footerTextElement.nodeValue = translate("footer_copyright");
    }
    currentTimeElement.textContent = timeString;
  }
}
// 更新项目进度指示器
function updateProgressIndicator() {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    progressIndicator.style.display = "none"; // 没有任务时隐藏
    return;
  }

  progressIndicator.style.display = "block"; // 确保显示

  const completedTasks = tasks.filter(
    (task) => task.status === "completed" || task.status === "已完成"
  ).length;
  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress" || task.status === "进行中"
  ).length;
  const pendingTasks = tasks.filter(
    (task) => task.status === "pending" || task.status === "待处理"
  ).length;

  const completedPercent =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const inProgressPercent =
    totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0;
  const pendingPercent = totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0;

  progressCompleted.style.width = `${completedPercent}%`;
  progressInProgress.style.width = `${inProgressPercent}%`;
  progressPending.style.width = `${pendingPercent}%`;

  // 更新标签 (使用 translate)
  progressLabels.innerHTML = `
    <span class="label-completed">${translate(
      "progress_completed"
    )}: ${completedTasks} (${completedPercent.toFixed(1)}%)</span>
    <span class="label-in-progress">${translate(
      "progress_in_progress"
    )}: ${inProgressTasks} (${inProgressPercent.toFixed(1)}%)</span>
    <span class="label-pending">${translate(
      "progress_pending"
    )}: ${pendingTasks} (${pendingPercent.toFixed(1)}%)</span>
    <span class="label-total">${translate(
      "progress_total"
    )}: ${totalTasks}</span>
  `;
}

// 添加：渲染全局分析结果
function renderGlobalAnalysisResult() {
  let targetElement = document.getElementById("global-analysis-result");

  // 如果元素不存在，尝试创建并添加到合适的位置 (例如 header 或 main content 前)
  if (!targetElement) {
    targetElement = document.createElement("div");
    targetElement.id = "global-analysis-result";
    targetElement.className = "global-analysis-section"; // 添加样式 class
    // 尝试插入到 header 之后或 main 之前
    const header = document.querySelector("header");
    const mainContent = document.querySelector("main");
    if (header && header.parentNode) {
      header.parentNode.insertBefore(targetElement, header.nextSibling);
    } else if (mainContent && mainContent.parentNode) {
      mainContent.parentNode.insertBefore(targetElement, mainContent);
    } else {
      // 作为最后手段，添加到 body 开头
      document.body.insertBefore(targetElement, document.body.firstChild);
    }
  }

  if (globalAnalysisResult) {
    targetElement.innerHTML = `
            <h4 data-i18n-key="global_analysis_title">${translate(
              "global_analysis_title"
            )}</h4> 
            <pre>${globalAnalysisResult}</pre> 
        `;
    targetElement.style.display = "block";
  } else {
    targetElement.style.display = "none"; // 如果没有结果则隐藏
    targetElement.innerHTML = ""; // 清空内容
  }
}

// 添加：高亮依赖图中的节点
function highlightNode(taskId, status = null) {
  if (!g || !window.d3) return;

  // 清除所有节点的高亮
  g.select(".nodes") // 从 g 开始选择
    .selectAll("g.node-item")
    .classed("highlighted", false);

  if (!taskId) return;

  // 高亮选中的节点
  const selectedNode = g
    .select(".nodes") // 从 g 开始选择
    .select(`g.node-item[data-id="${taskId}"]`);
  if (!selectedNode.empty()) {
    selectedNode.classed("highlighted", true);
    // 可以选择性地将选中节点带到最前面
    // selectedNode.raise();
  }
}

// 添加：辅助函数获取状态 class (应放在 ticked 函数之后，getNodeColor 之前或之后均可)
function getStatusClass(status) {
  return status ? status.replace(/_/g, "-") : "unknown"; // 替换所有下划线
}

// 添加：更新宽高的函数
function updateDimensions() {
  if (dependencyGraphElement) {
    width = dependencyGraphElement.clientWidth;
    height = dependencyGraphElement.clientHeight || 400;
  }
}

// 添加缩略图更新函数
function updateMinimap() {
  if (!svg || !simulation) return;

  const minimapSize = Math.min(width, height) * 0.2;
  const nodes = simulation.nodes();
  const links = simulation.force("link").links();

  // 计算当前图的边界（添加padding）
  const padding = 20; // 添加内边距
  const xExtent = d3.extent(nodes, d => d.x);
  const yExtent = d3.extent(nodes, d => d.y);
  const graphWidth = (xExtent[1] - xExtent[0]) || width;
  const graphHeight = (yExtent[1] - yExtent[0]) || height;

  // 计算缩放比例，确保考虑padding
  const scale = Math.min(
    minimapSize / (graphWidth + padding * 2),
    minimapSize / (graphHeight + padding * 2)
  ) * 0.9; // 0.9作为安全系数

  // 创建缩放函数，加入padding
  const minimapX = d3.scaleLinear()
    .domain([xExtent[0] - padding, xExtent[1] + padding])
    .range([0, minimapSize]);
  const minimapY = d3.scaleLinear()
    .domain([yExtent[0] - padding, yExtent[1] + padding])
    .range([0, minimapSize]);

  // 更新缩略图中的连接
  const minimapContent = svg.select(".minimap-content");
  const minimapLinks = minimapContent.selectAll(".minimap-link")
    .data(links);

  minimapLinks.enter()
    .append("line")
    .attr("class", "minimap-link")
    .merge(minimapLinks)
    .attr("x1", d => minimapX(d.source.x))
    .attr("y1", d => minimapY(d.source.y))
    .attr("x2", d => minimapX(d.target.x))
    .attr("y2", d => minimapY(d.target.y))
    .attr("stroke", "#999")
    .attr("stroke-width", 0.5)
    .attr("stroke-opacity", 0.6);

  minimapLinks.exit().remove();

  // 更新缩略图中的节点
  const minimapNodes = minimapContent.selectAll(".minimap-node")
    .data(nodes);

  minimapNodes.enter()
    .append("circle")
    .attr("class", "minimap-node")
    .attr("r", 2)
    .merge(minimapNodes)
    .attr("cx", d => minimapX(d.x))
    .attr("cy", d => minimapY(d.y))
    .attr("fill", getNodeColor);

  minimapNodes.exit().remove();

  // 更新视口指示器
  const transform = d3.zoomTransform(svg.node());
  const viewportWidth = width / transform.k;
  const viewportHeight = height / transform.k;
  const viewportX = -transform.x / transform.k;
  const viewportY = -transform.y / transform.k;

  svg.select(".minimap-viewport")
    .attr("x", minimapX(viewportX))
    .attr("y", minimapY(viewportY))
    .attr("width", minimapX(viewportX + viewportWidth) - minimapX(viewportX))
    .attr("height", minimapY(viewportY + viewportHeight) - minimapY(viewportY));
}

// 函数：激活节点拖拽 (保持不变)
// ... drag ...
