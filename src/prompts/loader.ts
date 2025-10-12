/**
 * prompt 加载器
 * prompt loader
 * 提供从环境变量加载自定义 prompt 的功能
 * Provides functionality to load custom prompts from environment variables
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDataDir } from "../utils/paths.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processEnvString(input: string | undefined): string {
  if (!input) return "";

  return input
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "\r");
}

/**
 * 加载 prompt，支持环境变量自定义
 * Load prompt with environment variable customization support
 * @param basePrompt 基本 prompt 内容
 * @param basePrompt Basic prompt content
 * @param promptKey prompt 的键名，用于生成环境变量名称
 * @param promptKey Prompt key name, used to generate environment variable names
 * @returns 最终的 prompt 内容
 * @returns Final prompt content
 */
export function loadPrompt(basePrompt: string, promptKey: string): string {
  // 转换为大写，作为环境变量的一部分
  // Convert to uppercase as part of the environment variable
  const envKey = promptKey.toUpperCase();

  // 检查是否有替换模式的环境变量
  // Check if there is a replacement mode environment variable
  const overrideEnvVar = `MCP_PROMPT_${envKey}`;
  if (process.env[overrideEnvVar]) {
    // 使用环境变量完全替换原始 prompt
    // Use environment variable to completely replace original prompt
    return processEnvString(process.env[overrideEnvVar]);
  }

  // 检查是否有追加模式的环境变量
  // Check if there is an append mode environment variable
  const appendEnvVar = `MCP_PROMPT_${envKey}_APPEND`;
  if (process.env[appendEnvVar]) {
    // 将环境变量内容追加到原始 prompt 后
    // Append environment variable content to the original prompt
    return `${basePrompt}\n\n${processEnvString(process.env[appendEnvVar])}`;
  }

  // 如果没有自定义，则使用原始 prompt
  // If no customization, use the original prompt
  return basePrompt;
}

/**
 * 生成包含动态参数的 prompt
 * Generate prompt with dynamic parameters
 * @param promptTemplate prompt 模板
 * @param promptTemplate prompt template
 * @param params 动态参数
 * @param params dynamic parameters
 * @returns 填充参数后的 prompt
 * @returns Prompt with parameters filled in
 */
export function generatePrompt(
  promptTemplate: string,
  params: Record<string, any> = {}
): string {
  // 使用简单的模板替换方法，将 {paramName} 替换为对应的参数值
  // Use simple template replacement method to replace {paramName} with corresponding parameter values
  let result = promptTemplate;

  Object.entries(params).forEach(([key, value]) => {
    // 如果值为 undefined 或 null，使用空字符串替换
    // If value is undefined or null, replace with empty string
    const replacementValue =
      value !== undefined && value !== null ? String(value) : "";

    // 使用正则表达式替换所有匹配的占位符
    // Use regular expression to replace all matching placeholders
    const placeholder = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(placeholder, replacementValue);
  });

  return result;
}

/**
 * 从模板加载 prompt
 * Load prompt from template
 * @param templatePath 相对于模板集根目录的模板路径 (e.g., 'chat/basic.md')
 * @param templatePath Template path relative to template set root directory (e.g., 'chat/basic.md')
 * @returns 模板内容
 * @returns Template content
 * @throws Error 如果找不到模板文档
 * @throws Error if template file is not found
 */
export async function loadPromptFromTemplate(
  templatePath: string
): Promise<string> {
  const defaultTemplateSet = "zh";
  const templateSetName = process.env.TEMPLATES_USE || defaultTemplateSet;
  const dataDir = await getDataDir();
  const builtInTemplatesBaseDir = __dirname;

  let finalPath = "";
  const checkedPaths: string[] = []; // 用于更详细的错误报告
  // Used for more detailed error reporting

  // 1. 检查 DATA_DIR 中的自定义路径
  // 1. Check custom paths in DATA_DIR
  // path.resolve 可以处理 templateSetName 是绝对路径的情况
  // path.resolve can handle cases where templateSetName is an absolute path
  const customFilePath = path.resolve(dataDir, templateSetName, templatePath);
  checkedPaths.push(`Custom: ${customFilePath}`);
  if (fs.existsSync(customFilePath)) {
    finalPath = customFilePath;
  }

  // 2. 如果未找到自定义路径，检查特定的内置模板目录
  // 2. If custom path not found, check specific built-in template directory
  if (!finalPath) {
    // 假设 templateSetName 对于内置模板是 'en', 'zh' 等
    // Assume templateSetName for built-in templates is 'en', 'zh', etc.
    const specificBuiltInFilePath = path.join(
      builtInTemplatesBaseDir,
      `templates_${templateSetName}`,
      templatePath
    );
    checkedPaths.push(`Specific Built-in: ${specificBuiltInFilePath}`);
    if (fs.existsSync(specificBuiltInFilePath)) {
      finalPath = specificBuiltInFilePath;
    }
  }

  // 3. 如果特定的内置模板也未找到，且不是默认模板 (避免重复检查)
  // 3. If specific built-in template is also not found and not the default template (avoid duplicate checking)
  if (!finalPath && templateSetName !== defaultTemplateSet) {
    const defaultBuiltInFilePath = path.join(
      builtInTemplatesBaseDir,
      `templates_${defaultTemplateSet}`,
      templatePath
    );
    checkedPaths.push(
      `Default Built-in ('${defaultTemplateSet}'): ${defaultBuiltInFilePath}`
    );
    if (fs.existsSync(defaultBuiltInFilePath)) {
      finalPath = defaultBuiltInFilePath;
    }
  }

  // 4. 最后尝试回退到英文模板
  // 4. Finally try falling back to English templates
  if (!finalPath && templateSetName !== "en") {
    const defaultBuiltInFilePath = path.join(
      builtInTemplatesBaseDir,
      "templates_en",
      templatePath
    );
    checkedPaths.push(`Default Built-in ('en'): ${defaultBuiltInFilePath}`);
    if (fs.existsSync(defaultBuiltInFilePath)) {
      finalPath = defaultBuiltInFilePath;
    }
  }

  // 5. 如果所有路径都找不到模板，抛出错误
  // 5. If template is not found in all paths, throw error
  if (!finalPath) {
    throw new Error(
      `Template file not found: '${templatePath}' in template set '${templateSetName}'. Checked paths:\n - ${checkedPaths.join(
        "\n - "
      )}`
    );
  }

  // 6. 读取找到的文档
  // 6. Read the found file
  return fs.readFileSync(finalPath, "utf-8");
}
