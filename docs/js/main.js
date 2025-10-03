/**
 * MCP Shrimp Task Manager 网站主脚本
 * MCP Shrimp Task Manager main website script
 */

// 页面加载完成后执行
// Execute after page load
document.addEventListener("DOMContentLoaded", function () {
  // 初始化滚动动画
  // Initialize scroll animation
  initAOS();

  // 初始化移动端菜单
  // Initialize mobile menu
  initMobileMenu();

  // 初始化代码高亮和复制功能
  // Initialize code highlighting and copy functionality
  initCodeBlocks();

  // 平滑滚动功能
  initSmoothScroll();

  // 英雄区特效
  initHeroEffects();

  // 痛点与解决方案区特效
  initPainPointsEffects();

  // 核心功能展示区特效
  initFeaturesEffects();

  // 工作流程展示区特效
  initWorkflowEffects();

  // 初始化安装与配置区功能
  initInstallationSection();

  // 检测页面滚动位置以显示回到顶部按钮
  initScrollToTopButton();

  // 初始化响应式图片懒加载
  initLazyLoading();

  // 初始化页面进入动画
  initPageEntranceAnimation();

  // 多语言功能
  initMultiLanguage();
});

/**
 * 初始化AOS滚动动画库
 * Initialize AOS scroll animation library
 */
function initAOS() {
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
    mirror: true,
    disable: function () {
      // 只在低性能设备上禁用动画，根据用户偏好设置
      // Only disable animations on low-performance devices based on user preferences
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
  });

  // 在窗口调整大小时重新初始化AOS以确保正确的触发位置
  // Re-initialize AOS when window is resized to ensure correct trigger positions
  window.addEventListener("resize", function () {
    AOS.refresh();
  });
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function (e) {
      e.preventDefault();

      // 为了支持过渡效果，先移除hidden类
      if (mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.remove("hidden");

        // 等待DOM更新，然后添加visible类启动过渡效果
        setTimeout(() => {
          mobileMenu.classList.add("visible");
        }, 10);
      } else {
        // 先移除visible类触发过渡效果
        mobileMenu.classList.remove("visible");

        // 等待过渡完成，然后隐藏菜单
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300); // 300ms与CSS过渡时间匹配
      }
    });

    // 点击菜单项后关闭菜单
    const menuLinks = mobileMenu.querySelectorAll("a");
    menuLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("visible");

        // 等待过渡完成，然后隐藏菜单
        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      });
    });

    // 点击菜单外区域关闭菜单
    document.addEventListener("click", function (e) {
      if (
        !menuToggle.contains(e.target) &&
        !mobileMenu.contains(e.target) &&
        !mobileMenu.classList.contains("hidden")
      ) {
        mobileMenu.classList.remove("visible");

        setTimeout(() => {
          mobileMenu.classList.add("hidden");
        }, 300);
      }
    });
  }
}

/**
 * 英雄区特效初始化
 */
function initHeroEffects() {
  // 获取英雄区
  const heroSection = document.getElementById("hero");
  if (!heroSection) return;

  // 添加浮动装饰元素的动画序列
  const decorElements = heroSection.querySelectorAll(".absolute");
  decorElements.forEach((elem, index) => {
    elem.style.setProperty("--animation-order", index + 1);

    // 使用淡入动画让元素在页面加载后逐个显示
    setTimeout(() => {
      elem.style.opacity = "0.8";
    }, (index + 1) * 200);
  });

  // 添加视差滚动效果
  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset;
    const heroHeight = heroSection.offsetHeight;

    // 当用户滚动经过英雄区时应用效果
    if (scrollTop <= heroHeight) {
      const scrollPercentage = scrollTop / heroHeight;

      // 英雄区域淡出效果
      heroSection.style.opacity = 1 - scrollPercentage * 0.8;

      // 标题向上移动效果
      const heroTitle = heroSection.querySelector("h1");
      if (heroTitle) {
        heroTitle.style.transform = `translateY(${scrollPercentage * 50}px)`;
      }
    }
  });

  // 添加滑鼠移动视差效果
  heroSection.addEventListener("mousemove", function (e) {
    // 只在更大的屏幕上启用这个效果
    if (window.innerWidth >= 768) {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

      // 获取英雄区内的图片元素
      const heroImage = heroSection.querySelector("img");
      if (heroImage) {
        heroImage.style.transform = `translate(${moveX * 2}px, ${
          moveY * 2
        }px) scale(1.02)`;
      }

      // 获取英雄区内的装饰元素
      decorElements.forEach((elem, index) => {
        // 使用不同的移动比例，创造层次感
        const factorX = (index + 1) * 0.03;
        const factorY = (index + 1) * 0.02;
        elem.style.transform = `translate(${moveX * factorX}px, ${
          moveY * factorY
        }px)`;
      });
    }
  });

  // 鼠标离开时重置元素位置
  heroSection.addEventListener("mouseleave", function () {
    const heroImage = heroSection.querySelector("img");
    if (heroImage) {
      heroImage.style.transform = "";
    }

    decorElements.forEach((elem) => {
      elem.style.transform = "";
    });
  });

  // Logo动画效果
  const logo = document.querySelector("header nav img");
  if (logo) {
    // 导航栏 logo 在页面加载时轻微旋转动画
    logo.style.transition = "transform 1s ease-out";
    logo.style.transform = "rotate(0deg)";

    setTimeout(() => {
      logo.style.transform = "rotate(5deg)";
      setTimeout(() => {
        logo.style.transform = "rotate(0deg)";
      }, 500);
    }, 1500);
  }
}

/**
 * 痛点与解决方案区特效初始化
 */
function initPainPointsEffects() {
  const painPointsSection = document.getElementById("pain-points");
  if (!painPointsSection) return;

  // 获取所有卡片
  const cards = painPointsSection.querySelectorAll(
    ".rounded-lg.overflow-hidden"
  );

  // 为每个卡片添加延迟出现动画
  cards.forEach((card, index) => {
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", (index * 150).toString());
  });

  // 为每个卡片添加鼠标进入和离开效果
  cards.forEach((card, index) => {
    // 获取痛点和解决方案区块
    const painIcon = card.querySelector(".p-6 img");
    const solutionIcon = card.querySelector(".p-4 img");
    const arrowIcon = card.querySelector(".h-8.w-8.text-green-500");

    // 鼠标进入效果
    card.addEventListener("mouseenter", function () {
      // 延迟执行动画，营造序列动画效果
      if (painIcon) {
        setTimeout(() => {
          painIcon.style.transform = "scale(1.1) rotate(5deg)";
        }, 100);
      }

      if (arrowIcon) {
        setTimeout(() => {
          arrowIcon.style.transform = "translateY(8px)";
        }, 200);
      }

      if (solutionIcon) {
        setTimeout(() => {
          solutionIcon.style.transform = "scale(1.1) rotate(-5deg)";
        }, 300);
      }

      // 添加发光效果
      card.style.boxShadow =
        "0 20px 30px rgba(0, 0, 0, 0.15), 0 0 15px rgba(59, 130, 246, 0.3)";
    });

    // 鼠标离开效果
    card.addEventListener("mouseleave", function () {
      if (painIcon) painIcon.style.transform = "";
      if (arrowIcon) arrowIcon.style.transform = "";
      if (solutionIcon) solutionIcon.style.transform = "";

      // 移除发光效果
      card.style.boxShadow = "";
    });
  });

  // 添加视差滚动效果
  window.addEventListener("scroll", function () {
    // 只在更大的屏幕上启用这个效果
    if (window.innerWidth >= 768) {
      const scrollPosition = window.scrollY;
      const sectionTop = painPointsSection.offsetTop;
      const sectionHeight = painPointsSection.offsetHeight;

      // 当用户滚动到该区域时应用效果
      if (
        scrollPosition > sectionTop - window.innerHeight &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        cards.forEach((card, index) => {
          // 相对于部分的滚动位置
          const relativeScroll =
            (scrollPosition - (sectionTop - window.innerHeight)) /
            (sectionHeight + window.innerHeight);
          // 根据卡片位置计算偏移量
          const offset = Math.sin(relativeScroll * Math.PI + index * 0.5) * 15;

          // 根据索引设置不同的偏移方向
          if (index % 2 === 0) {
            card.style.transform = `translateY(${offset}px)`;
          } else {
            card.style.transform = `translateY(${-offset}px)`;
          }
        });
      }
    }
  });
}

/**
 * 初始化代码区块功能
 */
function initCodeBlocks() {
  // 确保 Prism.js 已加载
  if (typeof Prism !== "undefined") {
    // 代码高亮应用
    Prism.highlightAll();
  }

  // 初始化代码示例切换功能
  initCodeTabSwitcher();

  // 可选：添加打字机效果
  initTypingEffect();
}

/**
 * 初始化代码示例标签切换功能
 */
function initCodeTabSwitcher() {
  const tabButtons = document.querySelectorAll(".code-tab-btn");
  const contentSections = document.querySelectorAll(".code-content-section");

  if (!tabButtons.length || !contentSections.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // 获取目标内容ID
      const targetId = btn.getAttribute("data-target");

      // 取消所有按钮激活状态
      tabButtons.forEach((b) => {
        b.classList.remove("active", "bg-blue-50", "text-blue-600");
        b.classList.add("hover:bg-blue-50");
      });

      // 激活当前按钮
      btn.classList.add("active", "bg-blue-50", "text-blue-600");

      // 隐藏所有内容
      contentSections.forEach((section) => {
        section.classList.add("hidden");
      });

      // 显示目标内容
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove("hidden");

        // 确保激活内容区的代码高亮
        const codeBlocks = targetSection.querySelectorAll("code");
        if (typeof Prism !== "undefined" && codeBlocks.length) {
          codeBlocks.forEach((block) => {
            Prism.highlightElement(block);
          });
        }
      }
    });
  });
}

/**
 * 初始化打字机效果 (可选功能)
 */
function initTypingEffect() {
  // 检查是否启用打字机效果（可以通过URL参数控制）
  const urlParams = new URLSearchParams(window.location.search);
  const enableTyping = urlParams.get("typing") === "true";

  if (!enableTyping) return;

  const codeBlocks = document.querySelectorAll("#examples code");
  if (!codeBlocks.length) return;

  codeBlocks.forEach((codeBlock) => {
    const originalText = codeBlock.textContent;
    codeBlock.textContent = "";

    let charIndex = 0;
    const typingSpeed = 30; // 每字符间隔毫秒

    // 先隐藏原始代码，然后进行打字效果
    codeBlock.parentElement.classList.add("typing-in-progress");

    // 视窗进入可视区域时启动打字效果
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTyping();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(codeBlock.parentElement);

    function startTyping() {
      const typingInterval = setInterval(() => {
        if (charIndex < originalText.length) {
          codeBlock.textContent += originalText.charAt(charIndex);
          charIndex++;

          // 自动滚动代码块以跟踪光标
          codeBlock.parentElement.scrollTop =
            codeBlock.parentElement.scrollHeight;

          // 动态应用语法高亮
          if (typeof Prism !== "undefined") {
            Prism.highlightElement(codeBlock);
          }
        } else {
          clearInterval(typingInterval);
          codeBlock.parentElement.classList.remove("typing-in-progress");
        }
      }, typingSpeed);
    }
  });
}

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // 确保不是仅 "#" 的链接
      if (href !== "#") {
        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          // 计算目标元素位置并考虑固定导航栏的高度
          const headerHeight = document.querySelector("header").offsetHeight;
          const targetPosition =
            target.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

/**
 * 核心功能展示区特效初始化
 */
function initFeaturesEffects() {
  const featuresSection = document.getElementById("features");
  if (!featuresSection) return;

  // 获取所有功能卡片
  const featureCards = featuresSection.querySelectorAll(".rounded-lg");

  // 为每个卡片添加悬停效果
  featureCards.forEach((card, index) => {
    // 获取卡片中的图标和标题
    const featureIcon = card.querySelector(".p-6 img");
    const featureTitle = card.querySelector("h3");

    // 鼠标进入效果
    card.addEventListener("mouseenter", function () {
      if (featureIcon) {
        featureIcon.style.transform = "scale(1.2) rotate(5deg)";
        featureIcon.style.transition = "transform 0.5s ease";
      }

      if (featureTitle) {
        featureTitle.style.transform = "translateY(-5px)";
        featureTitle.style.transition = "transform 0.3s ease";
      }
    });

    // 鼠标离开效果
    card.addEventListener("mouseleave", function () {
      if (featureIcon) {
        featureIcon.style.transform = "";
      }

      if (featureTitle) {
        featureTitle.style.transform = "";
      }
    });

    // 点击效果 - 添加轻微弹跳效果
    card.addEventListener("click", function () {
      card.style.transform = "scale(0.95)";
      setTimeout(() => {
        card.style.transform = "";
      }, 200);
    });
  });

  // 添加滚动视差效果
  window.addEventListener("scroll", function () {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    // 计算特效触发范围
    const sectionTop = featuresSection.offsetTop;
    const sectionHeight = featuresSection.offsetHeight;
    const triggerStart = sectionTop - windowHeight;
    const triggerEnd = sectionTop + sectionHeight;

    // 只在特效范围内计算视差
    if (scrollPosition > triggerStart && scrollPosition < triggerEnd) {
      const scrollProgress =
        (scrollPosition - triggerStart) / (triggerEnd - triggerStart);

      // 应用各种视差效果
      featureCards.forEach((card, index) => {
        const delayFactor = (index % 3) * 0.1;
        const moveY = Math.sin((scrollProgress + delayFactor) * Math.PI) * 15;

        // 应用视差效果
        card.style.transform = `translateY(${moveY}px)`;
      });
    }
  });
}

/**
 * 工作流程展示区特效初始化
 */
function initWorkflowEffects() {
  // 步骤详情弹窗功能
  initWorkflowModal();

  // 为桌面版时间轴添加连接线动画
  animateWorkflowConnections();

  // 为步骤图标添加互动效果
  addWorkflowIconInteractions();
}

/**
 * 初始化工作流程详情弹窗
 */
function initWorkflowModal() {
  const modal = document.getElementById("workflow-detail-modal");
  const closeBtn = document.getElementById("close-modal");
  const closeBtnAlt = document.getElementById("close-modal-btn");
  const detailLinks = document.querySelectorAll(
    ".workflow-detail-link, .workflow-step"
  );
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");

  if (!modal || !closeBtn || !detailLinks.length) return;

  // 工作流程步骤详情数据
  const workflowDetails = {
    en: {
      1: {
        title: "Task Planning",
        content: `
          <p>The task planning stage is the initial phase where AI assistants define project scope, set goals, and establish success criteria.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Clarify project requirements and constraints</li>
            <li>Set clear objectives and define measurable success criteria</li>
            <li>Establish project boundaries and identify stakeholders</li>
            <li>Create a high-level plan with timeline estimates</li>
            <li>Optionally reference existing tasks for continuous planning</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Outputs:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Comprehensive task description</li>
            <li>Clear success criteria</li>
            <li>Technical requirements and constraints</li>
          </ul>
          <p class="mt-4">This stage lays the foundation for all subsequent work, ensuring that both the AI assistant and the user have a shared understanding of what needs to be accomplished.</p>
        `,
      },
      2: {
        title: "In-depth Analysis",
        content: `
          <p>The in-depth analysis stage involves a thorough examination of the requirements and technical landscape to develop a viable implementation strategy.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Analyze requirements and identify technical challenges</li>
            <li>Evaluate technical feasibility and potential risks</li>
            <li>Research best practices and available solutions</li>
            <li>Systematically review existing codebase if applicable</li>
            <li>Develop initial implementation concepts</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Outputs:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Technical feasibility assessment</li>
            <li>Risk identification and mitigation strategies</li>
            <li>Initial implementation approach</li>
            <li>Pseudocode or architectural diagrams where appropriate</li>
          </ul>
          <p class="mt-4">This stage ensures that the proposed solution is technically sound and addresses all requirements before proceeding to implementation.</p>
        `,
      },
      3: {
        title: "Solution Reflection",
        content: `
          <p>The solution reflection stage involves critical review and optimization of the proposed approach before implementation.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Critically review the analysis results and proposed solutions</li>
            <li>Identify potential gaps, edge cases, or inefficiencies</li>
            <li>Consider alternative approaches and their trade-offs</li>
            <li>Evaluate solution against best practices and design principles</li>
            <li>Refine implementation strategy based on insights</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Outputs:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Optimized solution design</li>
            <li>Documented considerations and trade-offs</li>
            <li>Refined implementation strategy</li>
          </ul>
          <p class="mt-4">This reflective process helps catch potential issues early and ensures the chosen approach is optimal before investing in implementation.</p>
        `,
      },
      4: {
        title: "Task Decomposition",
        content: `
          <p>The task decomposition stage breaks down complex tasks into manageable, atomic subtasks with clear dependencies and execution order.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Break down complex tasks into smaller, manageable units</li>
            <li>Establish clear dependencies between subtasks</li>
            <li>Define scope and acceptance criteria for each subtask</li>
            <li>Assign priority levels and estimate complexity</li>
            <li>Create a logical execution sequence</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Supported Update Modes:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Append:</strong> Keep all existing tasks and add new ones</li>
            <li><strong>Overwrite:</strong> Clear all uncompleted tasks and completely replace them, while preserving completed tasks</li>
            <li><strong>Selective:</strong> Intelligently update existing tasks based on task names, preserving tasks not in the list</li>
            <li><strong>Clear All Tasks:</strong> Remove all tasks and create a backup</li>
          </ul>
          <p class="mt-4">This structured approach makes complex projects manageable by creating a clear roadmap of small, achievable steps.</p>
        `,
      },
      5: {
        title: "Task Execution",
        content: `
          <p>The task execution stage involves implementing specific tasks according to the predetermined plan, with a focus on quality and adherence to requirements.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Select tasks for execution based on dependencies and priorities</li>
            <li>Implement solutions following the implementation guide</li>
            <li>Follow coding standards and best practices</li>
            <li>Handle edge cases and error conditions</li>
            <li>Document implementation decisions and rationale</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Execution Process:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Prepare necessary resources and environment</li>
            <li>Follow the implementation guide step by step</li>
            <li>Monitor progress and handle any unexpected issues</li>
            <li>Maintain code quality and documentation</li>
          </ul>
          <p class="mt-4">This stage transforms plans into concrete results, implementing the solutions designed in earlier stages.</p>
        `,
      },
      6: {
        title: "Result Verification",
        content: `
          <p>The result verification stage ensures that implemented tasks meet all requirements and quality standards before being marked as complete.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Verify that all requirements have been implemented</li>
            <li>Check for adherence to technical standards and best practices</li>
            <li>Test edge cases and error handling</li>
            <li>Review code quality and documentation</li>
            <li>Validate against the verification criteria defined for the task</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Verification Checklist:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Functional correctness: Does it work as expected?</li>
            <li>Completeness: Are all requirements addressed?</li>
            <li>Quality: Does it meet coding standards and best practices?</li>
            <li>Performance: Does it operate efficiently?</li>
            <li>Documentation: Is the implementation well-documented?</li>
          </ul>
          <p class="mt-4">This thorough verification process ensures high-quality deliverables that fully satisfy requirements.</p>
        `,
      },
      7: {
        title: "Task Completion",
        content: `
          <p>The task completion stage formally marks tasks as complete, generates detailed completion reports, and updates the status of dependent tasks.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Formally mark task as completed after successful verification</li>
            <li>Generate a comprehensive completion report</li>
            <li>Update the status of dependent tasks</li>
            <li>Archive relevant information for future reference</li>
            <li>Communicate completion to stakeholders</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Completion Report Contents:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Summary of completed work</li>
            <li>Implementation highlights and key decisions</li>
            <li>Any notable challenges encountered and their solutions</li>
            <li>Recommendations for future work or improvements</li>
          </ul>
          <p class="mt-4">The completion stage ensures proper closure of tasks, maintains workflow continuity, and builds institutional knowledge for future projects.</p>
        `,
      },
    },
    "zh-CN": {
      1: {
        title: "任务规划",
        content: `
          <p>任务规划阶段是初始阶段，AI助手定义项目范围、设置目标，并建立成功标准。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>厘清项目需求和约束条件</li>
            <li>设置明确目标和定义可衡量的成功标准</li>
            <li>确立项目界限和识别相关利益方</li>
            <li>创建高级计划及时间估算</li>
            <li>可选择参考现有任务进行持续规划</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">输出成果：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>全面的任务描述</li>
            <li>明确的成功标准</li>
            <li>技术需求和约束条件</li>
          </ul>
          <p class="mt-4">此阶段为所有后续工作奠定基础，确保AI助手和用户对需要完成的工作有共同理解。</p>
        `,
      },
      2: {
        title: "深入分析",
        content: `
          <p>深入分析阶段涉及对需求和技术环境的彻底检查，以制定可行的实施策略。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>分析需求并识别技术挑战</li>
            <li>评估技术可行性和潜在风险</li>
            <li>研究最佳实践和可用解决方案</li>
            <li>系统性地审查现有代码库（如适用）</li>
            <li>开发初步实施概念</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">输出成果：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>技术可行性评估</li>
            <li>风险识别和缓解策略</li>
            <li>初步实施方法</li>
            <li>适当的伪代码或架构图</li>
          </ul>
          <p class="mt-4">此阶段确保在进行实施前，提出的解决方案在技术上是合理的，并能处理所有需求。</p>
        `,
      },
      3: {
        title: "方案反思",
        content: `
          <p>方案反思阶段涉及在实施前对提出的方法进行批判性审查和优化。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>批判性审查分析结果和提出的解决方案</li>
            <li>识别潜在差距、边缘情况或低效问题</li>
            <li>考虑替代方法及其权衡</li>
            <li>根据最佳实践和设计原则评估解决方案</li>
            <li>根据洞察优化实施策略</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">输出成果：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>优化后的解决方案设计</li>
            <li>记录的考虑事项和权衡</li>
            <li>改进的实施策略</li>
          </ul>
          <p class="mt-4">这种反思过程有助于及早发现潜在问题，并确保在投入实施前所选方法是最佳选择。</p>
        `,
      },
      4: {
        title: "任务分解",
        content: `
          <p>任务分解阶段将复杂任务分解为可管理的原子子任务，并建立明确的依赖关系和执行顺序。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>将复杂任务分解为更小、可管理的单元</li>
            <li>建立子任务之间的明确依赖关系</li>
            <li>为每个子任务定义范围和验收标准</li>
            <li>分配优先级别并评估复杂度</li>
            <li>创建逻辑执行顺序</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">支持的更新模式：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>追加(append)：</strong>保留所有现有任务并添加新任务</li>
            <li><strong>覆盖(overwrite)：</strong>清除所有未完成的任务并完全替换，同时保留已完成的任务</li>
            <li><strong>选择性更新(selective)：</strong>根据任务名称智能匹配更新现有任务，同时保留其他任务</li>
            <li><strong>清除所有任务(clearAllTasks)：</strong>移除所有任务并创建备份</li>
          </ul>
          <p class="mt-4">这种结构化方法通过创建由小型、可实现步骤组成的清晰路线图，使复杂项目变得可管理。</p>
        `,
      },
      5: {
        title: "任务执行",
        content: `
          <p>任务执行阶段涉及按照预定计划实施特定任务，重点关注质量和需求遵从。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>根据依赖和优先顺序选择要执行的任务</li>
            <li>按照实施指南实施解决方案</li>
            <li>遵循编码标准和最佳实践</li>
            <li>处理边缘情况和错误条件</li>
            <li>记录实施决策和理由</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">执行过程：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>准备必要的资源和环境</li>
            <li>逐步遵循实施指南</li>
            <li>监控进度并处理任何意外问题</li>
            <li>维护代码质量和文档</li>
          </ul>
          <p class="mt-4">该阶段将计划转化为具体结果，实施早期阶段设计的解决方案。</p>
        `,
      },
      6: {
        title: "结果验证",
        content: `
          <p>结果验证阶段确保已实施的任务在标记为完成前满足所有需求和质量标准。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>验证是否已实施所有需求</li>
            <li>检查是否遵循技术标准和最佳实践</li>
            <li>测试边缘情况和错误处理</li>
            <li>审查代码质量和文档</li>
            <li>根据为任务定义的验证标准进行验证</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">验证清单：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>功能正确性：是否按预期工作？</li>
            <li>完整性：是否涵盖所有需求？</li>
            <li>质量：是否符合编码标准和最佳实践？</li>
            <li>性能：是否高效运行？</li>
            <li>文档：实施是否有良好的文档？</li>
          </ul>
          <p class="mt-4">这种彻底的验证过程确保交付高质量的成果，完全满足需求。</p>
        `,
      },
      7: {
        title: "任务完成",
        content: `
          <p>任务完成阶段正式将任务标记为已完成，生成详细的完成报告，并更新相关依赖任务的状态。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>成功验证后正式将任务标记为已完成</li>
            <li>生成全面的完成报告</li>
            <li>更新依赖任务的状态</li>
            <li>归档相关信息以供将来参考</li>
            <li>向利益相关者传达完成情况</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">完成报告内容：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>已完成工作摘要</li>
            <li>实施亮点和关键决策</li>
            <li>遇到的任何值得注意的挑战及其解决方案</li>
            <li>对未来工作或改进的建议</li>
          </ul>
          <p class="mt-4">完成阶段确保任务适当结束，维持工作流程连续性，并为未来项目建立机构知识。</p>
        `,
      },
    },
  };

  // 点击详情链接打开弹窗
  detailLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const stepIndex = parseInt(this.getAttribute("data-step"));
      const lang = localStorage.getItem("preferred-language") || "en";
      if (stepIndex >= 0 && workflowDetails[lang][stepIndex]) {
        modalTitle.textContent = workflowDetails[lang][stepIndex].title;
        modalContent.innerHTML = workflowDetails[lang][stepIndex].content;
        modal.classList.remove("hidden");
        modal.classList.add("active");
      }
    });
  });

  // 关闭弹窗
  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("active");
  }

  closeBtn.addEventListener("click", closeModal);
  closeBtnAlt.addEventListener("click", closeModal);

  // 点击弹窗外部关闭
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });
}

/**
 * 为工作流程时间轴添加连接线动画
 */
function animateWorkflowConnections() {
  const desktopTimeline = document.querySelector(
    "#workflow .hidden.md\\:block"
  );
  if (!desktopTimeline) return;

  // 当时间轴进入视口时触发动画
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const steps = entry.target.querySelectorAll(".workflow-step");

          steps.forEach((step, index) => {
            setTimeout(() => {
              step.classList.add("animated");
            }, index * 200);
          });

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(desktopTimeline);
}

/**
 * 为工作流程步骤图标添加互动效果
 */
function addWorkflowIconInteractions() {
  const workflowIcons = document.querySelectorAll(
    ".workflow-icon, .workflow-icon-mobile"
  );

  workflowIcons.forEach((icon) => {
    icon.addEventListener("mouseenter", function () {
      const img = this.querySelector("img");
      if (img) {
        img.style.transform = "scale(1.2) rotate(5deg)";
        img.style.transition = "transform 0.3s ease";
      }
    });

    icon.addEventListener("mouseleave", function () {
      const img = this.querySelector("img");
      if (img) {
        img.style.transform = "";
      }
    });

    // 增加点击效果
    icon.addEventListener("click", function () {
      const link =
        this.parentNode.querySelector(".workflow-detail-link") ||
        this.closest(".flex").querySelector(".workflow-detail-link");

      if (link) {
        link.click();
      }
    });
  });
}

/**
 * 初始化安装与配置区功能
 */
function initInstallationSection() {
  // 初始化安装方式选项卡切换
  initInstallTabs();

  // 初始化Cursor IDE配置选项卡切换
  initCursorTabs();

  // 初始化命令行复制按钮
  initCommandCopyButtons();

  // 添加安装卡片的动画效果
  initInstallCardsAnimation();
}

/**
 * 初始化安装方式选项卡切换
 */
function initInstallTabs() {
  const tabButtons = document.querySelectorAll(".install-tab-btn");
  const contentSections = document.querySelectorAll(".install-content-section");

  if (!tabButtons.length || !contentSections.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 移除所有活动状态
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      contentSections.forEach((section) => section.classList.add("hidden"));

      // 设置当前活动状态
      button.classList.add("active");
      const targetId = button.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove("hidden");
      }
    });
  });
}

/**
 * 初始化Cursor IDE配置选项卡切换
 */
function initCursorTabs() {
  const tabButtons = document.querySelectorAll(".cursor-tab-btn");
  const contentSections = document.querySelectorAll(".cursor-content-section");

  if (!tabButtons.length || !contentSections.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 移除所有活动状态
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      contentSections.forEach((section) => section.classList.add("hidden"));

      // 设置当前活动状态
      button.classList.add("active");
      const targetId = button.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.remove("hidden");
      }
    });
  });
}

/**
 * 初始化命令行复制按钮
 */
function initCommandCopyButtons() {
  const copyButtons = document.querySelectorAll(".copy-cmd-btn");

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const command = button.getAttribute("data-command");
      if (!command) return;

      try {
        await navigator.clipboard.writeText(command);

        // 更新按钮文字
        const originalText = button.textContent.trim();
        button.textContent = "已复制!";
        button.classList.add("bg-gray-600");
        button.classList.remove(
          "bg-blue-600",
          "bg-green-600",
          "bg-purple-600",
          "hover:bg-blue-700",
          "hover:bg-green-700",
          "hover:bg-purple-700"
        );

        // 恢复原始状态
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove("bg-gray-600");

          // 根据按钮颜色还原样式
          if (button.classList.contains("copy-cmd-btn")) {
            if (button.closest("#smithery-install")) {
              button.classList.add("bg-blue-600", "hover:bg-blue-700");
            } else if (button.closest("#manual-install")) {
              button.classList.add("bg-green-600", "hover:bg-green-700");
            } else if (button.closest("#cursor-config")) {
              button.classList.add("bg-purple-600", "hover:bg-purple-700");
            }
          }
        }, 2000);
      } catch (err) {
        console.error("复制命令失败:", err);
        button.textContent = "复制失败";
      }
    });
  });
}

/**
 * 安装卡片的动画效果
 */
function initInstallCardsAnimation() {
  const installCards = document.querySelectorAll("#installation .grid > div");

  installCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)";
      card.style.boxShadow =
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";

      // 找到卡片内的图标并添加动画
      const icon = card.querySelector("svg");
      if (icon) {
        icon.style.transform = "scale(1.2)";
        icon.style.transition = "transform 0.3s ease";
      }
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.style.boxShadow = "";

      // 恢复图标
      const icon = card.querySelector("svg");
      if (icon) {
        icon.style.transform = "";
      }
    });
  });
}

/**
 * 初始化页面滚动到顶部按钮
 */
function initScrollToTopButton() {
  // 创建回到顶部按钮元素
  const scrollToTopBtn = document.createElement("button");
  scrollToTopBtn.id = "scrollToTop";
  scrollToTopBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>';
  scrollToTopBtn.className =
    "fixed bottom-5 right-5 bg-blue-600 text-white p-2 rounded-full shadow-lg transform scale-0 transition-transform duration-300";
  scrollToTopBtn.setAttribute("aria-label", "回到顶部");

  // 添加按钮到文档
  document.body.appendChild(scrollToTopBtn);

  // 点击事件 - 平滑滚动到顶部
  scrollToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // 根据滚动位置显示或隐藏按钮
  window.addEventListener("scroll", function () {
    if (window.scrollY > 500) {
      scrollToTopBtn.style.transform = "scale(1)";
    } else {
      scrollToTopBtn.style.transform = "scale(0)";
    }
  });
}

/**
 * 初始化图片懒加载功能
 */
function initLazyLoading() {
  if ("loading" in HTMLImageElement.prototype) {
    // 浏览器支持原生懒加载
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      img.src = img.dataset.src;
    });
  } else {
    // 回退方案 - 使用 Intersection Observer API
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    });

    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => {
      imgObserver.observe(img);
    });
  }
}

/**
 * 初始化页面进入动画
 */
function initPageEntranceAnimation() {
  // 页面加载完成后的动画效果
  document.body.classList.add("page-loaded");

  // 延迟一点时间后开始序列动画
  setTimeout(() => {
    const header = document.querySelector("header");
    if (header) {
      header.style.opacity = "1";
      header.style.transform = "translateY(0)";
    }

    const heroContent = document.querySelector("#hero .container");
    if (heroContent) {
      setTimeout(() => {
        heroContent.style.opacity = "1";
        heroContent.style.transform = "translateY(0)";
      }, 200);
    }
  }, 100);
}

/**
 * 为元素添加动画类
 * @param {Element} element - 要添加动画的元素
 * @param {string} animationClass - 要添加的动画类名
 * @param {number} delay - 延迟时间(毫秒)
 */
function addAnimation(element, animationClass, delay = 0) {
  if (!element) return;

  setTimeout(() => {
    element.classList.add(animationClass);

    // 动画结束后移除类
    element.addEventListener(
      "animationend",
      () => {
        element.classList.remove(animationClass);
      },
      { once: true }
    );
  }, delay);
}

/**
 * 检测元素是否在视口中
 * @param {Element} element - 要检测的元素
 * @returns {boolean} - 元素是否在视口中
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
    rect.right >= 0
  );
}

/**
 * 初始化多语言功能
 */
function initMultiLanguage() {
  // 检查 i18n.js 是否已载入
  if (typeof i18n !== "undefined") {
    // 优先使用增强版初始化函数
    if (typeof enhancedInitializeLanguage === "function") {
      enhancedInitializeLanguage();
    } else if (typeof initializeLanguage === "function") {
      // 兼容性处理，如果增强版函数不存在则使用原始方法
      initializeLanguage();
    } else {
      console.warn("多语言初始化函数不可用，将使用基本初始化");
      // 基本初始化 - 在i18n.js无法正确载入时提供基本功能
      try {
        const currentLang =
          localStorage.getItem("preferred-language") ||
          (navigator.language && navigator.language.startsWith("zh")
            ? "zh-CN"
            : "en");
        document.documentElement.setAttribute("lang", currentLang);
      } catch (e) {
        console.error("基本语言初始化失败:", e);
      }
    }

    // 为语言切换添加自定义事件
    try {
      document.querySelectorAll(".lang-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          const lang = this.getAttribute("data-lang");

          // 优先使用增强版语言切换函数
          if (typeof enhancedSetLanguage === "function") {
            enhancedSetLanguage(lang);
          } else if (typeof setLanguageWithAnimation === "function") {
            // 次优先使用带动画效果的语言切换
            setLanguageWithAnimation(lang);
          } else if (typeof setLanguage === "function") {
            // 兼容性处理，使用基本语言切换函数
            setLanguage(lang);
          } else {
            console.warn("语言切换函数不可用");
            // 最基本处理 - 更新 HTML lang 属性并保存偏好
            try {
              localStorage.setItem("preferred-language", lang);
              document.documentElement.setAttribute("lang", lang);
            } catch (e) {
              console.error("基本语言切换失败:", e);
            }
          }
        });
      });
    } catch (e) {
      console.error("为语言按钮添加事件监听器时出错:", e);
    }

    // 初始化时执行批量翻译，优化性能
    if (typeof batchApplyTranslations === "function") {
      batchApplyTranslations();
    }
  } else {
    console.warn("i18n.js 尚未载入，无法启用完整多语言功能");
    // 尝试提供基本的多语言支持
    try {
      const basicLanguageSupport = function () {
        const langBtns = document.querySelectorAll(".lang-btn");
        if (langBtns.length === 0) return;

        langBtns.forEach((btn) => {
          btn.addEventListener("click", function () {
            const lang = this.getAttribute("data-lang");
            try {
              localStorage.setItem("preferred-language", lang);
              document.documentElement.setAttribute("lang", lang);

              // 更新按钮状态
              langBtns.forEach((b) => {
                if (b.getAttribute("data-lang") === lang) {
                  b.classList.add("active");
                } else {
                  b.classList.remove("active");
                }
              });
            } catch (e) {
              console.error("基本语言切换失败:", e);
            }
          });
        });

        // 初始化按钮状态
        try {
          const savedLang =
            localStorage.getItem("preferred-language") ||
            (navigator.language && navigator.language.startsWith("zh")
              ? "zh-CN"
              : "en");

          langBtns.forEach((btn) => {
            if (btn.getAttribute("data-lang") === savedLang) {
              btn.classList.add("active");
            } else {
              btn.classList.remove("active");
            }
          });

          document.documentElement.setAttribute("lang", savedLang);
        } catch (e) {
          console.error("初始化语言按钮状态失败:", e);
        }
      };

      basicLanguageSupport();
    } catch (e) {
      console.error("基本多语言支持初始化失败:", e);
    }
  }

  // 监听语言切换事件
  try {
    document.addEventListener("languageChanged", function (event) {
      const lang = event.detail.language;
      console.log("Language changed to:", lang);

      // 使用 translateText 函数更新特殊元素
      const updateSpecialElements = function () {
        // 安全地取得翻译函数
        const getTranslation = (key, defaultText) => {
          if (typeof safeTranslate === "function") {
            return safeTranslate(key, defaultText);
          } else if (typeof translateText === "function") {
            return translateText(key, defaultText);
          } else {
            return lang === "en" ? defaultText.en : defaultText.zh;
          }
        };

        try {
          // 更新复制按钮文字
          const copyBtns = document.querySelectorAll(".copy-cmd-btn");
          const copyText = getTranslation("common.copy", {
            en: "Copy",
            zh: "复制",
          });

          copyBtns.forEach((btn) => {
            // 只更新没有显示"已复制"的按钮
            if (
              btn.textContent !== "Copied!" &&
              btn.textContent !== "已复制!"
            ) {
              btn.textContent = copyText;
            }
          });
        } catch (e) {
          console.warn("更新复制按钮文字失败:", e);
        }

        try {
          // 更新模态窗口中的关闭按钮文字
          const closeModalBtn = document.getElementById("close-modal-btn");
          if (closeModalBtn) {
            closeModalBtn.textContent = getTranslation("common.close", {
              en: "Close",
              zh: "关闭",
            });
          }
        } catch (e) {
          console.warn("更新关闭按钮文字失败:", e);
        }
      };

      // 使用 setTimeout 避免阻塞 UI
      setTimeout(updateSpecialElements, 0);

      // 根据当前语言更新工作流程模态内容
      try {
        updateWorkflowModalContent(lang);
      } catch (e) {
        console.warn("更新工作流程模态内容失败:", e);
      }
    });
  } catch (e) {
    console.error("添加语言变更事件监听器失败:", e);
  }
}

/**
 * 根据当前语言更新工作流程模态窗口内容
 * @param {string} lang - 当前语言代码 ("en" 或 "zh-CN")
 */
function updateWorkflowModalContent(lang) {
  const modal = document.getElementById("workflow-detail-modal");
  if (!modal) return;

  // 获取当前显示的步骤
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");
  const currentStep = modal.getAttribute("data-current-step");

  if (currentStep && modalTitle && modalContent) {
    // 从工作流程详情中获取对应语言的内容
    const workflowDetails = getWorkflowDetails();
    const langKey = lang === "en" ? "en" : "zh-CN";

    if (workflowDetails[langKey] && workflowDetails[langKey][currentStep]) {
      const stepData = workflowDetails[langKey][currentStep];

      // 使用 requestAnimationFrame 优化渲染性能
      requestAnimationFrame(function () {
        modalTitle.textContent = stepData.title;
        modalContent.innerHTML = stepData.content;

        // 为动态生成的内容添加 data-i18n 属性
        const dynamicElements = modalContent.querySelectorAll("h4, p, li");
        dynamicElements.forEach(function (el, index) {
          const key = `workflow.step${currentStep}.content.${index}`;
          el.setAttribute("data-i18n-dynamic", key);
        });
      });
    }
  }
}

/**
 * 获取工作流程详情数据
 * @returns {Object} 工作流程详情对象
 */
function getWorkflowDetails() {
  // 返回工作流程详情数据
  return {
    // 现有数据保持不变
    en: {
      1: {
        title: "Task Planning",
        content: `
          <p>The task planning stage is the initial phase where AI assistants define project scope, set goals, and establish success criteria.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Clarify project requirements and constraints</li>
            <li>Set clear objectives and define measurable success criteria</li>
            <li>Establish project boundaries and identify stakeholders</li>
            <li>Create a high-level plan with timeline estimates</li>
            <li>Optionally reference existing tasks for continuous planning</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Outputs:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Comprehensive task description</li>
            <li>Clear success criteria</li>
            <li>Technical requirements and constraints</li>
          </ul>
          <p class="mt-4">This stage lays the foundation for all subsequent work, ensuring that both the AI assistant and the user have a shared understanding of what needs to be accomplished.</p>
        `,
      },
      2: {
        title: "In-depth Analysis",
        content: `
          <p>The in-depth analysis stage involves a thorough examination of the requirements and technical landscape to develop a viable implementation strategy.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Analyze requirements and identify technical challenges</li>
            <li>Evaluate technical feasibility and potential risks</li>
            <li>Research best practices and available solutions</li>
            <li>Systematically review existing codebase if applicable</li>
            <li>Develop initial implementation concepts</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Outputs:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Technical feasibility assessment</li>
            <li>Risk identification and mitigation strategies</li>
            <li>Initial implementation approach</li>
            <li>Pseudocode or architectural diagrams where appropriate</li>
          </ul>
          <p class="mt-4">This stage ensures that the proposed solution is technically sound and addresses all requirements before proceeding to implementation.</p>
        `,
      },
      3: {
        title: "Solution Reflection",
        content: `
          <p>The solution reflection stage involves critical review and optimization of the proposed approach before implementation.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Critically review the analysis results and proposed solutions</li>
            <li>Identify potential gaps, edge cases, or inefficiencies</li>
            <li>Consider alternative approaches and their trade-offs</li>
            <li>Evaluate solution against best practices and design principles</li>
            <li>Refine implementation strategy based on insights</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Outputs:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Optimized solution design</li>
            <li>Documented considerations and trade-offs</li>
            <li>Refined implementation strategy</li>
          </ul>
          <p class="mt-4">This reflective process helps catch potential issues early and ensures the chosen approach is optimal before investing in implementation.</p>
        `,
      },
      4: {
        title: "Task Decomposition",
        content: `
          <p>The task decomposition stage breaks down complex tasks into manageable, atomic subtasks with clear dependencies and execution order.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Break down complex tasks into smaller, manageable units</li>
            <li>Establish clear dependencies between subtasks</li>
            <li>Define scope and acceptance criteria for each subtask</li>
            <li>Assign priority levels and estimate complexity</li>
            <li>Create a logical execution sequence</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Supported Update Modes:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Append:</strong> Keep all existing tasks and add new ones</li>
            <li><strong>Overwrite:</strong> Clear all uncompleted tasks and completely replace them, while preserving completed tasks</li>
            <li><strong>Selective:</strong> Intelligently update existing tasks based on task names, preserving tasks not in the list</li>
            <li><strong>Clear All Tasks:</strong> Remove all tasks and create a backup</li>
          </ul>
          <p class="mt-4">This structured approach makes complex projects manageable by creating a clear roadmap of small, achievable steps.</p>
        `,
      },
      5: {
        title: "Task Execution",
        content: `
          <p>The task execution stage involves implementing specific tasks according to the predetermined plan, with a focus on quality and adherence to requirements.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Select tasks for execution based on dependencies and priorities</li>
            <li>Implement solutions following the implementation guide</li>
            <li>Follow coding standards and best practices</li>
            <li>Handle edge cases and error conditions</li>
            <li>Document implementation decisions and rationale</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Execution Process:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Prepare necessary resources and environment</li>
            <li>Follow the implementation guide step by step</li>
            <li>Monitor progress and handle any unexpected issues</li>
            <li>Maintain code quality and documentation</li>
          </ul>
          <p class="mt-4">This stage transforms plans into concrete results, implementing the solutions designed in earlier stages.</p>
        `,
      },
      6: {
        title: "Result Verification",
        content: `
          <p>The result verification stage ensures that implemented tasks meet all requirements and quality standards before being marked as complete.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Verify that all requirements have been implemented</li>
            <li>Check for adherence to technical standards and best practices</li>
            <li>Test edge cases and error handling</li>
            <li>Review code quality and documentation</li>
            <li>Validate against the verification criteria defined for the task</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Verification Checklist:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Functional correctness: Does it work as expected?</li>
            <li>Completeness: Are all requirements addressed?</li>
            <li>Quality: Does it meet coding standards and best practices?</li>
            <li>Performance: Does it operate efficiently?</li>
            <li>Documentation: Is the implementation well-documented?</li>
          </ul>
          <p class="mt-4">This thorough verification process ensures high-quality deliverables that fully satisfy requirements.</p>
        `,
      },
      7: {
        title: "Task Completion",
        content: `
          <p>The task completion stage formally marks tasks as complete, generates detailed completion reports, and updates the status of dependent tasks.</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Formally mark task as completed after successful verification</li>
            <li>Generate a comprehensive completion report</li>
            <li>Update the status of dependent tasks</li>
            <li>Archive relevant information for future reference</li>
            <li>Communicate completion to stakeholders</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Completion Report Contents:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Summary of completed work</li>
            <li>Implementation highlights and key decisions</li>
            <li>Any notable challenges encountered and their solutions</li>
            <li>Recommendations for future work or improvements</li>
          </ul>
          <p class="mt-4">The completion stage ensures proper closure of tasks, maintains workflow continuity, and builds institutional knowledge for future projects.</p>
        `,
      },
    },
    "zh-CN": {
      1: {
        title: "任务规划",
        content: `
          <p>任务规划阶段是初始阶段，AI助手定义项目范围、设置目标，并建立成功标准。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>厘清项目需求和约束条件</li>
            <li>设置明确目标和定义可衡量的成功标准</li>
            <li>确立项目界限和识别相关利益方</li>
            <li>创建高级计划及时间估算</li>
            <li>可选择参考现有任务进行持续规划</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">输出成果：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>全面的任务描述</li>
            <li>明确的成功标准</li>
            <li>技术需求和约束条件</li>
          </ul>
          <p class="mt-4">此阶段为所有后续工作奠定基础，确保AI助手和用户对需要完成的工作有共同理解。</p>
        `,
      },
      2: {
        title: "深入分析",
        content: `
          <p>深入分析阶段涉及对需求和技术环境的彻底检查，以制定可行的实施策略。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>分析需求并识别技术挑战</li>
            <li>评估技术可行性和潜在风险</li>
            <li>研究最佳实践和可用解决方案</li>
            <li>系统性地审查现有代码库（如适用）</li>
            <li>开发初步实施概念</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">输出成果：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>技术可行性评估</li>
            <li>风险识别和缓解策略</li>
            <li>初步实施方法</li>
            <li>适当的伪代码或架构图</li>
          </ul>
          <p class="mt-4">此阶段确保在进行实施前，提出的解决方案在技术上是合理的，并能处理所有需求。</p>
        `,
      },
      3: {
        title: "方案反思",
        content: `
          <p>方案反思阶段涉及在实施前对提出的方法进行批判性审查和优化。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>批判性审查分析结果和提出的解决方案</li>
            <li>识别潜在差距、边缘情况或低效问题</li>
            <li>考虑替代方法及其权衡</li>
            <li>根据最佳实践和设计原则评估解决方案</li>
            <li>根据洞察优化实施策略</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">输出成果：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>优化后的解决方案设计</li>
            <li>记录的考虑事项和权衡</li>
            <li>改进的实施策略</li>
          </ul>
          <p class="mt-4">这种反思过程有助于及早发现潜在问题，并确保在投入实施前所选方法是最佳选择。</p>
        `,
      },
      4: {
        title: "任务分解",
        content: `
          <p>任务分解阶段将复杂任务分解为可管理的原子子任务，并建立明确的依赖关系和执行顺序。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>将复杂任务分解为更小、可管理的单元</li>
            <li>建立子任务之间的明确依赖关系</li>
            <li>为每个子任务定义范围和验收标准</li>
            <li>分配优先级别并评估复杂度</li>
            <li>创建逻辑执行顺序</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">支持的更新模式：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>追加(append)：</strong>保留所有现有任务并添加新任务</li>
            <li><strong>覆盖(overwrite)：</strong>清除所有未完成的任务并完全替换，同时保留已完成的任务</li>
            <li><strong>选择性更新(selective)：</strong>根据任务名称智能匹配更新现有任务，同时保留其他任务</li>
            <li><strong>清除所有任务(clearAllTasks)：</strong>移除所有任务并创建备份</li>
          </ul>
          <p class="mt-4">这种结构化方法通过创建由小型、可实现步骤组成的清晰路线图，使复杂项目变得可管理。</p>
        `,
      },
      5: {
        title: "任务执行",
        content: `
          <p>任务执行阶段涉及按照预定计划实施特定任务，重点关注质量和需求遵从。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">主要活动：</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>根据依赖和优先顺序选择要执行的任务</li>
            <li>按照实施指南实施解决方案</li>
            <li>遵循编码标准和最佳实践</li>
            <li>处理边缘情况和错误条件</li>
            <li>记录实施决策和理由</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Execution Process:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Prepare necessary resources and environment</li>
            <li>Follow the implementation guide step by step</li>
            <li>Monitor progress and handle any unexpected issues</li>
            <li>Maintain code quality and documentation</li>
          </ul>
          <p class="mt-4">This stage transforms plans into concrete results, implementing the solutions designed in earlier stages.</p>
        `,
      },
      6: {
        title: "结果验证",
        content: `
          <p>结果验证阶段确保已实施的任务在标记为完成前满足所有需求和质量标准。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Verify that all requirements have been implemented</li>
            <li>Check for adherence to technical standards and best practices</li>
            <li>Test edge cases and error handling</li>
            <li>Review code quality and documentation</li>
            <li>Validate against the verification criteria defined for the task</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Verification Checklist:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Functional correctness: Does it work as expected?</li>
            <li>Completeness: Are all requirements addressed?</li>
            <li>Quality: Does it meet coding standards and best practices?</li>
            <li>Performance: Does it operate efficiently?</li>
            <li>Documentation: Is the implementation well-documented?</li>
          </ul>
          <p class="mt-4">This thorough verification process ensures high-quality deliverables that fully satisfy requirements.</p>
        `,
      },
      7: {
        title: "任务完成",
        content: `
          <p>任务完成阶段正式将任务标记为已完成，生成详细的完成报告，并更新相关依赖任务的状态。</p>
          <h4 class="text-lg font-semibold mt-4 mb-2">Key Activities:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>成功验证后正式将任务标记为已完成</li>
            <li>生成全面的完成报告</li>
            <li>更新依赖任务的状态</li>
            <li>归档相关信息以供将来参考</li>
            <li>向利益相关者传达完成情况</li>
          </ul>
          <h4 class="text-lg font-semibold mt-4 mb-2">Completion Report Contents:</h4>
          <ul class="list-disc pl-6 space-y-2">
            <li>Summary of completed work</li>
            <li>Implementation highlights and key decisions</li>
            <li>Any notable challenges encountered and their solutions</li>
            <li>Recommendations for future work or improvements</li>
          </ul>
          <p class="mt-4">The completion stage ensures proper closure of tasks, maintains workflow continuity, and builds institutional knowledge for future projects.</p>
        `,
      },
    },
  };
}

