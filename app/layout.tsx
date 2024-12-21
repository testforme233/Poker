import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '年会惯蛋比赛管理系统',
  description: '管理年会惯蛋比赛的队伍、座位和积分',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}