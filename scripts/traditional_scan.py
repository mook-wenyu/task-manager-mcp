#!/usr/bin/env python3
"""扫描仓库文件中的繁体字并生成 Markdown 报告。"""

import argparse
import datetime
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple

from opencc import OpenCC

EXCLUDE_DIRS = {".git", "node_modules", "dist", ".shrimp", "reports", ".codex", "logs", "RESULTS", "PATCHES"}
INCLUDE_SUFFIXES = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".yml",
    ".yaml",
    ".csv",
    ".txt",
    ".html",
    ".css"
}

cc = OpenCC("t2s")


def is_text_file(path: Path) -> bool:
    if path.suffix.lower() in INCLUDE_SUFFIXES:
        return True
    return False


def find_traditional(line: str) -> List[Tuple[str, str, int]]:
    """返回繁体字符列表：[(原字符, 转换后, 索引), ...]"""
    findings: List[Tuple[str, str, int]] = []
    cursor = 0
    while cursor < len(line):
        char = line[cursor]
        if char == "\ufeff":
            cursor += 1
            continue
        converted = cc.convert(char)
        if char != converted and any(ord(ch) > 127 for ch in char):
            findings.append((char, converted, cursor))
        cursor += 1
    return findings


def _read_lines(path: Path) -> List[str]:
    try:
        with path.open("r", encoding="utf-8") as fp:
            return fp.readlines()
    except UnicodeDecodeError:
        with path.open("r", encoding="utf-8", errors="ignore") as fp:
            return fp.readlines()


def scan_file(path: Path) -> List[Dict[str, object]]:
    results: List[Dict[str, object]] = []
    for idx, raw_line in enumerate(_read_lines(path), start=1):
        line = raw_line.rstrip("\n")
        findings = find_traditional(line)
        if findings:
            results.append(
                {
                    "line": idx,
                    "original": line,
                    "findings": [
                        {
                            "char": char,
                            "suggest": suggest,
                            "column": column + 1,
                        }
                        for char, suggest, column in findings
                    ],
                }
            )
    return results


def walk(root: Path) -> Dict[Path, List[Dict[str, object]]]:
    findings: Dict[Path, List[Dict[str, object]]] = {}
    for current_root, dirs, files in os.walk(root):
        rel_root = Path(current_root).relative_to(root)
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file_name in files:
            file_path = Path(current_root) / file_name
            rel_path = file_path.relative_to(root)
            if not is_text_file(file_path):
                continue
            entries = scan_file(file_path)
            if entries:
                findings[rel_path] = entries
    return findings


def generate_report(findings: Dict[Path, List[Dict[str, object]]], output: Path, root: Path) -> None:
    total_files = len(findings)
    total_occurrences = sum(len(entries) for entries in findings.values())

    lines: List[str] = []
    lines.append("# 繁体中文扫描报告")
    lines.append("")
    lines.append(f"生成时间: {datetime.datetime.now().isoformat(timespec='seconds')}")
    lines.append(f"扫描根目录: {root}")
    lines.append("")
    lines.append("## 扫描摘要")
    lines.append(f"- 含繁体字文件数: {total_files}")
    lines.append(f"- 含繁体行条目合计: {total_occurrences}")
    lines.append("")
    lines.append("## 详细结果")
    if not findings:
        lines.append("未检测到繁体字。")
    else:
        for rel_path, entries in sorted(findings.items()):
            lines.append(f"### {rel_path.as_posix()}")
            for entry in entries:
                line_no = entry["line"]
                preview = entry["original"]
                lines.append(f"- 行 {line_no}: {preview}")
                for finding in entry["findings"]:
                    char = finding["char"]
                    suggest = finding["suggest"]
                    column = finding["column"]
                    lines.append(
                        f"  - 列 {column}: `{char}` → 建议 `{suggest}`"
                    )
            lines.append("")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="扫描繁体中文并生成报告")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.cwd(),
        help="扫描根目录，默认当前目录",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("reports/traditional_scan.md"),
        help="输出报告路径",
    )
    args = parser.parse_args()

    findings = walk(args.root.resolve())
    generate_report(findings, args.output, args.root.resolve())

    print(json.dumps({
        "files_with_traditional": len(findings),
        "total_entries": sum(len(entries) for entries in findings.values()),
        "report": str(args.output)
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
