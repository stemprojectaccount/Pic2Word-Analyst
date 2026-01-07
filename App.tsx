import React, { useState } from 'react';
import { FileText, Wand2, Download, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import FileUploader from './components/FileUploader';
import { analyzeImage } from './services/geminiService';
import { generateAndDownloadDocx } from './services/docxService';
import { AnalysisResult } from './types';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyzeImage(file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !file) return;
    try {
      await generateAndDownloadDocx(result, file.name);
    } catch (err) {
      console.error(err);
      setError("Không thể tạo file Word. Vui lòng thử lại.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <ImageIcon className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Pic2Word <span className="text-indigo-600">Analyst</span></h1>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Made by Thanh Dat 7A 
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Chuyển đổi hình ảnh sang tài liệu Word</h2>
          <p className="text-slate-600 text-lg">
            Tải lên hình ảnh của bạn để trích xuất văn bản và nhận phân tích nội dung chi tiết bằng AI.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Upload */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-sm">1</span>
                Tải ảnh lên
              </h3>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                selectedFile={file} 
                onClear={handleClear}
                disabled={isLoading}
              />
              
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isLoading}
                  className={`
                    w-full py-3.5 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md
                    ${!file || isLoading 
                      ? 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-700 active:transform active:scale-[0.98] shadow-indigo-200'}
                  `}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Phân tích hình ảnh
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-sm">2</span>
                  Kết quả phân tích
                </h3>

                {!result && !isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-100 rounded-xl">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="text-center">Kết quả phân tích văn bản và nội dung sẽ xuất hiện tại đây.</p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                     <div className="relative w-16 h-16 mb-4">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-200 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                     </div>
                     <p className="text-slate-600 font-medium animate-pulse">Gemini đang đọc tài liệu...</p>
                     <p className="text-slate-400 text-sm mt-2">Quá trình này có thể mất vài giây</p>
                  </div>
                )}

                {result && (
                  <div className="flex flex-col h-full animate-fadeIn">
                    <div className="flex-1 space-y-6 mb-6">
                      
                      {/* Extracted Text Section */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Văn bản trích xuất</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                           {result.extractedText ? (
                             <p className="whitespace-pre-wrap">{result.extractedText}</p>
                           ) : (
                             <p className="text-slate-400 italic">Không tìm thấy văn bản nào trong ảnh.</p>
                           )}
                        </div>
                      </div>

                      {/* Description Section */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Phân tích nội dung</h4>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 text-sm leading-relaxed">
                          <p>{result.description}</p>
                        </div>
                      </div>

                    </div>

                    <button
                      onClick={handleDownload}
                      className="w-full py-3 px-4 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 active:transform active:scale-[0.98]"
                    >
                      <Download size={20} />
                      Tải xuống file Word (.docx)
                    </button>
                  </div>
                )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;