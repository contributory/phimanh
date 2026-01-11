export default function Loading() {
  return (
    <main className="mx-auto max-w-screen-2xl px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div
              className="absolute inset-3 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Đang tải phim...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vui lòng chờ trong giây lát
          </p>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 text-center pointer-events-none">
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-4xl mx-auto">
          Trang web dành cho mục đích học tập, chúng tôi không lưu trữ và cũng không chịu trách nhiệm cho nội dung bản quyền xuất hiện trên trang web
        </p>
      </div>
    </main>
  );
}
