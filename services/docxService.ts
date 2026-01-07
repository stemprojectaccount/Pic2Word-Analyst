import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { AnalysisResult } from "../types";

// Helper function to save file without external dependencies (replaces file-saver)
const saveAs = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const generateAndDownloadDocx = async (result: AnalysisResult, originalFileName: string) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "BÁO CÁO PHÂN TÍCH HÌNH ẢNH",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Section 1: Extracted Text
          new Paragraph({
            text: "1. Văn bản trích xuất (OCR)",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: result.extractedText || "(Không tìm thấy văn bản trong hình ảnh)",
                size: 24, // 12pt
              }),
            ],
            spacing: { after: 400 },
          }),

          // Section 2: Content Analysis
          new Paragraph({
            text: "2. Phân tích nội dung & Bối cảnh",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: result.description || "(Không có mô tả)",
                size: 24, // 12pt
              }),
            ],
            spacing: { after: 400 },
          }),

          // Footer
          new Paragraph({
            text: "Được tạo bởi Pic2Word Analyst - Powered by Gemini",
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
            children: [
              new TextRun({
                text: "\n" + new Date().toLocaleString('vi-VN'),
                italics: true,
                size: 20,
                color: "808080"
              })
            ]
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = originalFileName.replace(/\.[^/.]+$/, "") + "_phan_tich.docx";
  saveAs(blob, fileName);
};