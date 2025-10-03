import { RelatedFile, RelatedFileType } from "../types/index.js";

/**
 * 生成任务相关文档的内容摘要
 * Generate a content summary of task-related files
 *
 * 此函数根据提供的 RelatedFile 对象列表，生成文档的摘要信息，而不实际读取文件内容。
 * This function generates file summary information based on the provided RelatedFile object list without actually reading file contents.
 * 这是一个轻量级的实现，仅基于文件元数据（如路径、类型、描述等）生成格式化的摘要，
 * This is a lightweight implementation that generates formatted summaries based only on file metadata (such as paths, types, descriptions, etc.),
 * 适用于需要提供文档上下文信息但不需要访问实际文件内容的情境。
 * suitable for scenarios that need to provide file context information but don't need to access actual file contents.
 *
 * @param relatedFiles 相关文档列表 - RelatedFile 对象数组，包含文档的路径、类型、描述等信息
 * @param relatedFiles Related file list - Array of RelatedFile objects containing file paths, types, descriptions, and other information
 * @param maxTotalLength 摘要内容的最大总长度 - 控制生成摘要的总字符数，避免过大的返回内容
 * @param maxTotalLength Maximum total length of summary content - Controls the total character count of generated summaries to avoid overly large return content
 * @returns 包含两个字段的对象：
 * @returns Object containing two fields:
 *   - content: 详细的文档信息，包含每个文件的基本信息和提示消息
 *   - content: Detailed file information, including basic information and hint messages for each file
 *   - summary: 简洁的文件列表概览，适合快速浏览
 *   - summary: Concise file list overview, suitable for quick browsing
 */
export async function loadTaskRelatedFiles(
  relatedFiles: RelatedFile[],
  maxTotalLength: number = 15000 // 控制生成内容的总长度
  // Control the total length of generated content
): Promise<{ content: string; summary: string }> {
  if (!relatedFiles || relatedFiles.length === 0) {
    return {
      content: "",
      summary: "无相关文档", // No related files
    };
  }

  let totalContent = "";
  let filesSummary = `## 相关文档内容摘要 (共 ${relatedFiles.length} 个文档)\n\n`;
  // Related file content summary (total of ${relatedFiles.length} files)
  let totalLength = 0;

  // 按文档类型优先级排序（首先处理待修改的文档）
  // Sort by file type priority (process files to be modified first)
  const priorityOrder: Record<RelatedFileType, number> = {
    [RelatedFileType.TO_MODIFY]: 1,
    [RelatedFileType.REFERENCE]: 2,
    [RelatedFileType.DEPENDENCY]: 3,
    [RelatedFileType.CREATE]: 4,
    [RelatedFileType.OTHER]: 5,
  };

  const sortedFiles = [...relatedFiles].sort(
    (a, b) => priorityOrder[a.type] - priorityOrder[b.type]
  );

  // 处理每个文档
  // Process each file
  for (const file of sortedFiles) {
    if (totalLength >= maxTotalLength) {
      filesSummary += `\n### 已达到上下文长度限制，部分文档未加载\n`;
      // Context length limit reached, some files not loaded
      break;
    }

    // 生成文档基本信息
    // Generate basic file information
    const fileInfo = generateFileInfo(file);

    // 添加到总内容
    // Add to total content
    const fileHeader = `\n### ${file.type}: ${file.path}${
      file.description ? ` - ${file.description}` : ""
    }${
      file.lineStart && file.lineEnd
        ? ` (行 ${file.lineStart}-${file.lineEnd})` // (lines ${file.lineStart}-${file.lineEnd})
        : ""
    }\n\n`;

    totalContent += fileHeader + "```\n" + fileInfo + "\n```\n\n";
    filesSummary += `- **${file.path}**${
      file.description ? ` - ${file.description}` : ""
    } (${fileInfo.length} 字符)\n`; // characters

    totalLength += fileInfo.length + fileHeader.length + 8; // 8 for "```\n" and "\n```"
  }

  return {
    content: totalContent,
    summary: filesSummary,
  };
}

/**
 * 生成文档基本信息摘要
 * Generate basic file information summary
 *
 * 根据文件的元数据生成格式化的信息摘要，包含文件路径、类型和相关提示。
 * Generate a formatted information summary based on file metadata, including file paths, types, and related hints.
 * 不读取实际文件内容，仅基于提供的 RelatedFile 对象生成信息。
 * Does not read actual file contents, generates information based only on the provided RelatedFile object.
 *
 * @param file 相关文档对象 - 包含文件路径、类型、描述等基本信息
 * @param file Related file object - Contains basic information such as file path, type, description, etc.
 * @returns 格式化的文件信息摘要文本
 * @returns Formatted file information summary text
 */
function generateFileInfo(file: RelatedFile): string {
  let fileInfo = `文件: ${file.path}\n`; // File:
  fileInfo += `类型: ${file.type}\n`; // Type:

  if (file.description) {
    fileInfo += `描述: ${file.description}\n`; // Description:
  }

  if (file.lineStart && file.lineEnd) {
    fileInfo += `行范围: ${file.lineStart}-${file.lineEnd}\n`; // Line range:
  }

  fileInfo += `若需查看实际内容，请直接查看文件: ${file.path}\n`;
  // To view actual content, please check the file directly:

  return fileInfo;
}
