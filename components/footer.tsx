"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/enhanced-card";
import { MaterialRipple } from "@/components/ui/material-animations";

export default function Footer() {
  return (
    <footer className="w-full mt-12 py-8">
      <div className="container mx-auto px-4">
        <Card variant="glass" className="overflow-hidden">
          <CardContent className="p-8">
            <div className="w-full flex flex-col items-center justify-center space-y-6">
              {/* Logo và Brand */}
              <MaterialRipple>
                <div className="flex items-center gap-3 cursor-pointer hover:scale-105 material-transition">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center material-elevation-1">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" 
                      />
                    </svg>
                  </div>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Phim Ảnh
                  </span>
                </div>
              </MaterialRipple>

              {/* Mô tả */}
              <p className="text-center text-muted-foreground max-w-lg leading-relaxed">
                Khám phá kho tàng phim ảnh chất lượng cao với hình ảnh và âm thanh hoàn hảo. 
                Trải nghiệm những tác phẩm điện ảnh kinh điển với chất lượng tuyệt đỉnh.
              </p>

              {/* Navigation Links */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <MaterialRipple>
                  <Link 
                    href="/" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary/5"
                  >
                    Trang chủ
                  </Link>
                </MaterialRipple>
                <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                <MaterialRipple>
                  <Link 
                    href="/new-updates" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary/5"
                  >
                    Mới cập nhật
                  </Link>
                </MaterialRipple>
                <div className="w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
                <MaterialRipple>
                  <Link 
                    href="/recently" 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium px-3 py-2 rounded-lg hover:bg-primary/5"
                  >
                    Đã xem gần đây
                  </Link>
                </MaterialRipple>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
                <Card variant="elevated" className="text-center p-4 hover:scale-105 material-transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Tốc độ cao</h3>
                  <p className="text-xs text-muted-foreground">Streaming nhanh chóng</p>
                </Card>

                <Card variant="elevated" className="text-center p-4 hover:scale-105 material-transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Chất lượng HD</h3>
                  <p className="text-xs text-muted-foreground">Hình ảnh sắc nét</p>
                </Card>

                <Card variant="elevated" className="text-center p-4 hover:scale-105 material-transition">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">Cập nhật liên tục</h3>
                  <p className="text-xs text-muted-foreground">Phim mới hàng ngày</p>
                </Card>
              </div>

              {/* Divider */}
              <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>

              {/* Copyright */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground/70">
                  © {new Date().getFullYear()} Phim Ảnh. All rights reserved.
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Made with ❤️ using Material Design
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </footer>
  );
}
